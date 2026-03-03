import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'
import type { WeatherLocation, WeatherOptions, WeatherData } from '@/types/weather'
import { fetchWeatherData } from '@/services/weather-api'
import { HOURLY_VARIABLES, DAILY_VARIABLES } from '@/types/weather'
import type { HourlyVariable, DailyVariable } from '@/types/weather'
import { useDiseaseDetection } from './use-disease-detection'
import { generateWeatherAlerts } from '@/utils/weather-alerts'
import type { WeatherConditions } from '@/types/disease'

export interface UseWeatherOptions {
  retryAttempts?: number
  retryDelay?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

const DEFAULT_RETRY_ATTEMPTS = 3
const DEFAULT_RETRY_DELAY = 1000
const _DEFAULT_REFRESH_INTERVAL = 300000

export function useWeather(options: UseWeatherOptions = {}) {
  const {
    retryAttempts = DEFAULT_RETRY_ATTEMPTS,
    retryDelay = DEFAULT_RETRY_DELAY,
    refreshInterval = 60000,
  } = options

  const weather = ref<WeatherData | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const abortController = ref<AbortController | null>(null)
  const refreshTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const currentLocation = ref<WeatherLocation | null>(null)
  const currentOptions = ref<WeatherOptions | null>(null)

  const hourlyVars: HourlyVariable[] = [...HOURLY_VARIABLES]
  const dailyVars: DailyVariable[] = [...DAILY_VARIABLES]

  const isError = computed(() => error.value !== null)
  const hasData = computed(() => weather.value !== null)

  async function loadWeather(
    location: WeatherLocation,
    options?: WeatherOptions
  ): Promise<WeatherData | null> {
    abortPreviousRequest()

    isLoading.value = true
    error.value = null
    currentLocation.value = location
    currentOptions.value = options ?? null

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        abortController.value = controller

        const timeoutId = setTimeout(
          () => controller.abort(),
          10000
        )

        const data = await fetchWeatherData(
          location,
          {
            hourly: hourlyVars,
            daily: dailyVars,
            ...options,
          }
        )

        clearTimeout(timeoutId)
        weather.value = data
        isLoading.value = false
        return data
      } catch (e) {
        lastError = e instanceof Error ? e : new Error('Unknown error')

        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        }
      }
    }

    error.value = lastError
    isLoading.value = false
    return null
  }

  function abortPreviousRequest(): void {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  function startPolling(): void {
    if (refreshTimer.value) {
      return
    }

    if (!currentLocation.value) {
      return
    }

    refreshTimer.value = setInterval(() => {
      if (currentLocation.value) {
        loadWeather(currentLocation.value, currentOptions.value ?? undefined)
      }
    }, refreshInterval)
  }

  function stopPolling(): void {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
  }

  function clearWeather(): void {
    abortPreviousRequest()
    stopPolling()
    weather.value = null
    error.value = null
    currentLocation.value = null
    currentOptions.value = null
  }

  function setOptions(newOptions: UseWeatherOptions): void {
    if (newOptions.autoRefresh !== undefined) {
      if (newOptions.autoRefresh) {
        startPolling()
      } else {
        stopPolling()
      }
    }
  }

  const alerts = computed(() => {
    if (!weather.value) return []

    const currentAlerts: string[] = []
    const current = weather.value.current
    const daily = weather.value.daily
    const hourly = weather.value.hourly

    if (!current || !daily) return []

    const conditions: WeatherConditions = {
      temperature: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      precipitation: current.precipitation ?? null,
      soilMoisture: hourly?.soil_moisture_0_to_7cm?.[0] ?? null,
      soilTemperature: hourly?.soil_temperature_0_to_7cm?.[0] ?? null,
      sunshineHours: hourly?.sunshine_duration?.[0] ?? null,
      windSpeed: current.wind_speed_10m ?? null,
    }

    const { analyzeAllDiseases } = useDiseaseDetection()
    const diseaseRisks = analyzeAllDiseases(conditions)

    const highRiskDiseases = diseaseRisks.filter(
      r => r.level === 'high' || r.level === 'critical'
    )
    highRiskDiseases.forEach(risk => {
      const diseaseNames: Record<string, string> = {
        mildiu: 'Mildiú',
        botrytis: 'Botrytis',
        oidio: 'Oídio',
        excoriosis: 'Excoriosis',
      }
      const levelText = risk.level === 'critical' ? 'crítico' : 'alto'
      currentAlerts.push(
        `Riesgo ${levelText} de ${diseaseNames[risk.disease] || risk.disease}: ${risk.probability}% de probabilidad.`
      )
    })

    const weatherAlerts = generateWeatherAlerts(
      conditions.temperature,
      conditions.humidity,
      conditions.precipitation,
      conditions.windSpeed,
      daily?.temperature_2m_min?.[0] ?? null,
      daily?.temperature_2m_max?.[0] ?? null,
      conditions.soilMoisture
    )

    const activeWeatherAlerts = weatherAlerts.filter(a => a.level !== 'low' && a.level !== 'medium')
    activeWeatherAlerts.forEach(alert => {
      currentAlerts.push(`${alert.title}: ${alert.description}`)
    })

    return currentAlerts
  })

  /**
   * Computed property that maps the raw weather data to a simplified structure
   * for the UI, maintaining compatibility with the dashboard.
   */
  const weatherData = computed(() => {
    if (!weather.value) return null

    const current = weather.value.current
    const daily = weather.value.daily
    const hourly = weather.value.hourly

    if (!current) return null

    const now = new Date()
    const currentHour = now.getUTCHours()

    // Helper to calculate moisture levels for a specific day index
    const getSoilMoistureForDay = (dayIdx: number) => {
      const start = dayIdx * 24
      const end = start + 24

      const dayMoisture0to7 = hourly?.soil_moisture_0_to_7cm?.slice(start, end) ?? []
      const dayMoisture7to28 = hourly?.soil_moisture_7_to_28cm?.slice(start, end) ?? []
      const dayMoisture28to100 = hourly?.soil_moisture_28_to_100cm?.slice(start, end) ?? []
      const dayMoisture100to255 = hourly?.soil_moisture_100_to_255cm?.slice(start, end) ?? []

      const average = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

      // Normalization: raw data is m3/m3 (0-0.5 typical).
      // We normalize so 0.45 m3/m3 = 100% (Saturation reference for these soils)
      const toPercent = (val: number) => Math.round(Math.min((val / 0.45) * 100, 100))

      return {
        current: toPercent(average(dayMoisture0to7)),
        depth20: toPercent(average(dayMoisture7to28)),
        depth40: toPercent(average(dayMoisture28to100)),
        depth60: toPercent(average(dayMoisture100to255)),
      }
    }

    // Pre-calculate daily moisture for all 7 days
    const dailyMoisture = Array.from({ length: 7 }, (_, i) => getSoilMoistureForDay(i))

    return {
      temperature: current.temperature_2m ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      soilHumidity: dailyMoisture[0]?.current ?? 0,
      soilMoistureLevels: dailyMoisture[0] ?? { current: 0, depth20: 0, depth40: 0, depth60: 0 },
      allDaysSoilMoisture: dailyMoisture,
      precipitation: current.precipitation ?? 0,
      cloudCover: current.cloud_cover ?? 0,
      et0: daily?.et0_fao_evapotranspiration?.[0] ?? 0,
      sunshineDuration: daily?.sunshine_duration?.[0] ?? 0,
      isFrostLikely: (daily?.temperature_2m_min?.[0] ?? 0) < 2,
      isHeatWaveLikely: (daily?.temperature_2m_max?.[0] ?? 0) > 32
    }
  })

  /**
   * Convenience wrapper for loadWeather that matches the old fetchWeather signature
   */
  async function fetchWeather(lat: number, lon: number) {
    return loadWeather({ latitude: lat, longitude: lon })
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      abortPreviousRequest()
      stopPolling()
    })
  }

  return {
    weather,
    weatherData,
    isLoading,
    error,
    isError,
    hasData,
    alerts,
    loadWeather,
    fetchWeather,
    clearWeather,
    abortPreviousRequest,
    startPolling,
    stopPolling,
    setOptions,
  }
}
