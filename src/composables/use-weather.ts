import { ref } from 'vue'
import type { WeatherLocation, WeatherOptions, WeatherResponse } from '@/types/weather'
import { fetchWeatherForecast } from '@/services/weather-api'
import { HOURLY_VARIABLES, DAILY_VARIABLES } from '@/types/weather'
import type { HourlyVariable, DailyVariable } from '@/types/weather'

export function useWeather() {
  const weather = ref<WeatherResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const hourlyVars: HourlyVariable[] = [...HOURLY_VARIABLES]
  const dailyVars: DailyVariable[] = [...DAILY_VARIABLES]

  async function loadWeather(
    location: WeatherLocation,
    options?: WeatherOptions
  ): Promise<WeatherResponse | null> {
    isLoading.value = true
    error.value = null

    try {
      const data = await fetchWeatherForecast(location, {
        hourly: hourlyVars,
        daily: dailyVars,
        ...options,
      })
      weather.value = data
      return data
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error')
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearWeather(): void {
    weather.value = null
    error.value = null
  }

  return {
    weather,
    isLoading,
    error,
    loadWeather,
    clearWeather,
  }
}
