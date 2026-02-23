import { ref, computed } from 'vue'

/**
 * Interface for weather data structure
 */
export interface WeatherData {
  temperature: number
  humidity: number
  soilHumidity: number
  precipitation: number
  isFrostLikely: boolean
  isHeatWaveLikely: boolean
}

/**
 * Composable to manage weather data and disease risk logic
 */
export function useWeather() {
  const weatherData = ref<WeatherData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Calculates specific disease and weather risks based on current metrics
   * Logic based on US-002 requirements
   */
  const alerts = computed(() => {
    if (!weatherData.value) return []

    const currentAlerts: string[] = []
    const { temperature, humidity, isFrostLikely, isHeatWaveLikely } = weatherData.value

    // Mildew (Mildiú) Risk Logic: High humidity (>85%) and moderate temperatures (10-25°C)
    if (humidity > 85 && temperature >= 10 && temperature <= 25) {
      currentAlerts.push('Mildew Risk detected: High humidity and moderate temperature.')
    }

    // Botrytis Risk Logic: High maintained humidity and moderate temperatures
    if (humidity > 90 && temperature >= 15 && temperature <= 20) {
      currentAlerts.push('Botrytis Risk detected: Critical humidity levels.')
    }

    // Adverse Weather logic
    if (isFrostLikely || temperature < 0) {
      currentAlerts.push('Frost Risk: Protection recommended.')
    }

    if (isHeatWaveLikely || temperature > 35) {
      currentAlerts.push('Heat Wave Risk: Adjust irrigation patterns.')
    }

    return currentAlerts
  })

  /**
   * Mock function to simulate data fetching from Open-Meteo
   * To be replaced by actual service call in TK-002-01/02
   */
  const fetchWeather = async (lat: number, lon: number) => {
    isLoading.value = true
    error.value = null
    try {
      // Simulation of API call
      // In a real scenario, this would call a service from src/services
      console.log(`Fetching weather for ${lat}, ${lon}`)
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
