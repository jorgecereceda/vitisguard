import { ref, computed } from 'vue'
import { fetchWeatherData } from '@/services/weather-api'

/**
 * Interface for weather data structure - US-002 Extended
 */
export interface WeatherData {
  temperature: number
  humidity: number
  soilHumidity: number
  precipitation: number
  cloudCover: number
  et0: number
  sunshineDuration: number
  isFrostLikely: boolean
  isHeatWaveLikely: boolean
}

// Simple in-memory cache
const cache = new Map<string, { data: WeatherData; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * Composable to manage weather data and disease risk logic
 */
export function useWeather() {
  const weatherData = ref<WeatherData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Calculates specific disease and weather risks based on current metrics
   */
  const alerts = computed(() => {
    if (!weatherData.value) return []

    const currentAlerts: string[] = []
    const { temperature, humidity, isFrostLikely, isHeatWaveLikely } = weatherData.value

    // Mildew (Mildiú): High humidity (>85%) and moderate temperatures (10-25°C)
    if (humidity > 85 && temperature >= 10 && temperature <= 25) {
      currentAlerts.push('Riesgo de Mildiú detectado: Humedad alta y temperaturas moderadas.')
    }

    // Botrytis: High humidity and moderate temperatures
    if (humidity > 90 && temperature >= 15 && temperature <= 20) {
      currentAlerts.push('Riesgo de Botrytis detectado: Niveles de humedad críticos.')
    }

    // Adverse Weather logic
    if (isFrostLikely || temperature < 0) {
      currentAlerts.push('Riesgo por condiciones meteorológicas adversas: Helada inminente.')
    }

    if (isHeatWaveLikely || temperature > 35) {
      currentAlerts.push('Riesgo por condiciones meteorológicas adversas: Ola de calor.')
    }

    return currentAlerts
  })

  /**
   * Fetch weather data from Open-Meteo using actual service
   */
  const fetchWeather = async (lat: number, lon: number) => {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      weatherData.value = cached.data
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const response = await fetchWeatherData({ latitude: lat, longitude: lon })

      const current = response.current
      const daily = response.daily

      const mappedData: WeatherData = {
        temperature: current.temperature_2m ?? 0,
        humidity: current.relative_humidity_2m ?? 0,
        soilHumidity: response.hourly.soil_moisture_0_to_7cm?.[0] ?? 0,
        precipitation: current.precipitation ?? 0,
        cloudCover: current.cloud_cover ?? 0,
        et0: daily.et0_fao_evapotranspiration?.[0] ?? 0,
        sunshineDuration: daily.sunshine_duration?.[0] ?? 0,
        isFrostLikely: (daily.temperature_2m_min?.[0] ?? 0) < 2,
        isHeatWaveLikely: (daily.temperature_2m_max?.[0] ?? 0) > 32
      }

      weatherData.value = mappedData
      cache.set(cacheKey, { data: mappedData, timestamp: Date.now() })
    } catch (err) {
      error.value = 'Failed to fetch weather data'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    weatherData,
    isLoading,
    error,
    alerts,
    fetchWeather
  }
}
