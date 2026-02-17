import type {
  WeatherLocation,
  WeatherOptions,
  WeatherResponse,
  CurrentData,
  CurrentVariable,
  WeatherData,
} from '@/types/weather'
import { HOURLY_VARIABLES, DAILY_VARIABLES, CURRENT_VARIABLES } from '@/types/weather'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const API_TIMEOUT_MS = 10000

export class WeatherApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'WeatherApiError'
  }
}

export async function fetchWeatherForecast(
  location: WeatherLocation,
  options: WeatherOptions = {}
): Promise<WeatherResponse> {
  const { latitude, longitude } = location
  const {
    hourly,
    daily,
    forecastDays = 7,
    pastDays = 0,
  } = options

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: hourly?.join(',') ?? '',
    daily: daily?.join(',') ?? '',
    timezone: 'UTC',
    forecast_days: forecastDays.toString(),
    past_days: pastDays.toString(),
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}?${params}`, {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new WeatherApiError(
        `HTTP error: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    if (data.error) {
      throw new WeatherApiError(data.reason ?? 'API returned error')
    }

    return data as WeatherResponse
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new WeatherApiError('Request timeout exceeded')
      }
      throw error
    }
    throw new WeatherApiError('Unknown error occurred')
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchCurrentWeather(
  location: WeatherLocation,
  variables: CurrentVariable[] = [...CURRENT_VARIABLES]
): Promise<CurrentData> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: variables.join(','),
    timezone: 'UTC',
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}?${params}`, {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new WeatherApiError(
        `HTTP error: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    if (data.error) {
      throw new WeatherApiError(data.reason ?? 'API returned error')
    }

    return data.current as CurrentData
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new WeatherApiError('Request timeout exceeded')
      }
      throw error
    }
    throw new WeatherApiError('Unknown error occurred')
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchWeatherData(
  location: WeatherLocation,
  options: WeatherOptions = {}
): Promise<WeatherData> {
  const {
    hourly = [...HOURLY_VARIABLES],
    daily = [...DAILY_VARIABLES],
    forecastDays = 7,
    pastDays = 0,
  } = options

  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: CURRENT_VARIABLES.join(','),
    hourly: hourly.join(','),
    daily: daily.join(','),
    timezone: 'UTC',
    forecast_days: forecastDays.toString(),
    past_days: pastDays.toString(),
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}?${params}`, {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new WeatherApiError(
        `HTTP error: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    if (data.error) {
      throw new WeatherApiError(data.reason ?? 'API returned error')
    }

    return {
      current: data.current,
      hourly: data.hourly,
      daily: data.daily,
      metadata: {
        latitude: data.latitude,
        longitude: data.longitude,
        elevation: data.elevation,
        utc_offset_seconds: data.utc_offset_seconds,
        timezone: data.timezone,
        timezone_abbreviation: data.timezone_abbreviation,
        generationtime_ms: data.generationtime_ms,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new WeatherApiError('Request timeout exceeded')
      }
      throw error
    }
    throw new WeatherApiError('Unknown error occurred')
  } finally {
    clearTimeout(timeoutId)
  }
}
