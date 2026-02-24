import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'
import type { WeatherLocation, WeatherOptions, WeatherData } from '@/types/weather'
import { fetchWeatherData } from '@/services/weather-api'
import { HOURLY_VARIABLES, DAILY_VARIABLES } from '@/types/weather'
import type { HourlyVariable, DailyVariable } from '@/types/weather'

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

    if (!current || !daily) return []

    const temperature = current.temperature_2m ?? 0
    const humidity = current.relative_humidity_2m ?? 0
    const minTemp = daily.temperature_2m_min?.[0] ?? 0
    const maxTemp = daily.temperature_2m_max?.[0] ?? 0

    // Mildew (Mildiú): High humidity (>85%) and moderate temperatures (10-25°C)
    if (humidity > 85 && temperature >= 10 && temperature <= 25) {
      currentAlerts.push('Riesgo de Mildiú detectado: Humedad alta y temperaturas moderadas.')
    }

    // Botrytis: High humidity and moderate temperatures
    if (humidity > 90 && temperature >= 15 && temperature <= 20) {
      currentAlerts.push('Riesgo de Botrytis detectado: Niveles de humedad críticos.')
    }

    // Adverse Weather logic
    if (minTemp < 2 || temperature < 0) {
      currentAlerts.push('Riesgo por condiciones meteorológicas adversas: Helada inminente.')
    }

    if (maxTemp > 32 || temperature > 35) {
      currentAlerts.push('Riesgo por condiciones meteorológicas adversas: Ola de calor.')
    }

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

    return {
      temperature: current.temperature_2m ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      soilHumidity: hourly?.soil_moisture_0_to_7cm?.[0] ?? 0,
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
