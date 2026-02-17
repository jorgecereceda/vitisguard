import { ref, toRefs, computed, onUnmounted } from 'vue'
import type { WeatherLocation, WeatherOptions, WeatherResponse } from '@/types/weather'
import { fetchWeatherForecast } from '@/services/weather-api'
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

  const weather = ref<WeatherResponse | null>(null)
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
  ): Promise<WeatherResponse | null> {
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

        const data = await fetchWeatherForecast(
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

  onUnmounted(() => {
    abortPreviousRequest()
    stopPolling()
  })

  return {
    ...toRefs({
      weather,
      isLoading,
      error,
    }),
    isError,
    hasData,
    loadWeather,
    clearWeather,
    abortPreviousRequest,
    startPolling,
    stopPolling,
    setOptions,
  }
}
