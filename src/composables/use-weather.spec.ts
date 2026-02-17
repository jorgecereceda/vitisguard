import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { WeatherResponse } from '@/types/weather'
import { useWeather } from './use-weather'

vi.mock('@/services/weather-api', () => ({
  fetchWeatherForecast: vi.fn(),
}))

import { fetchWeatherForecast } from '@/services/weather-api'
const mockedFetch = fetchWeatherForecast as ReturnType<typeof vi.fn>

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default values', () => {
    const { weather, isLoading, error, isError, hasData } = useWeather()

    expect(weather.value).toBeNull()
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(isError.value).toBe(false)
    expect(hasData.value).toBe(false)
  })

  it('loadWeather fetches data successfully', async () => {
    const mockData = {
      latitude: 43.0,
      longitude: -2.9,
      elevation: 100,
      utc_offset_seconds: 0,
      timezone: 'UTC',
      timezone_abbreviation: 'UTC',
      generationtime_ms: 100,
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
    }

    mockedFetch.mockResolvedValueOnce(mockData)

    const { weather, isLoading, error, loadWeather, isError, hasData } = useWeather()

    const location = { latitude: 43.0, longitude: -2.9 }
    const result = await loadWeather(location)

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenCalledWith(location, expect.any(Object))
    expect(weather.value).toEqual(mockData)
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(isError.value).toBe(false)
    expect(hasData.value).toBe(true)
    expect(result).toEqual(mockData)
  })

  it('sets isLoading to true during fetch', async () => {
    let resolveFetch: (value: WeatherResponse) => void
    mockedFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )

    const { isLoading, loadWeather } = useWeather()

    const location = { latitude: 43.0, longitude: -2.9 }
    const promise = loadWeather(location)

    expect(isLoading.value).toBe(true)

    resolveFetch!({
      latitude: 43.0,
      longitude: -2.9,
      elevation: 100,
      utc_offset_seconds: 0,
      timezone: 'UTC',
      timezone_abbreviation: 'UTC',
      generationtime_ms: 100,
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
    })
    await promise

    expect(isLoading.value).toBe(false)
  })

  it('sets error on fetch failure', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network error'))

    const { weather, isLoading, error, loadWeather, isError, hasData } =
      useWeather({ retryAttempts: 1 })

    const location = { latitude: 43.0, longitude: -2.9 }
    const result = await loadWeather(location)

    expect(error.value).toBeInstanceOf(Error)
    expect(error.value?.message).toBe('Network error')
    expect(isError.value).toBe(true)
    expect(hasData.value).toBe(false)
    expect(weather.value).toBeNull()
    expect(result).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('retries on failure', async () => {
    mockedFetch
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce({
        latitude: 43.0,
        longitude: -2.9,
        elevation: 100,
        utc_offset_seconds: 0,
        timezone: 'UTC',
        timezone_abbreviation: 'UTC',
        generationtime_ms: 100,
        hourly: { time: ['2024-01-01'] },
        daily: { time: ['2024-01-01'] },
      })

    const { error, loadWeather } = useWeather({ retryAttempts: 3, retryDelay: 10 })

    vi.useFakeTimers()
    const location = { latitude: 43.0, longitude: -2.9 }

    const promise = loadWeather(location)

    await vi.runAllTimersAsync()
    await promise

    expect(mockedFetch).toHaveBeenCalledTimes(3)
    expect(error.value).toBeNull()
  })

  it('clearWeather resets all state', async () => {
    mockedFetch.mockResolvedValueOnce({
      latitude: 43.0,
      longitude: -2.9,
      elevation: 100,
      utc_offset_seconds: 0,
      timezone: 'UTC',
      timezone_abbreviation: 'UTC',
      generationtime_ms: 100,
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
    })

    const { weather, error, clearWeather, loadWeather, isLoading } = useWeather()

    const location = { latitude: 43.0, longitude: -2.9 }
    await loadWeather(location)

    expect(weather.value).not.toBeNull()

    clearWeather()

    expect(weather.value).toBeNull()
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('hasData computed returns correct value', async () => {
    mockedFetch.mockResolvedValueOnce({
      latitude: 43.0,
      longitude: -2.9,
      elevation: 100,
      utc_offset_seconds: 0,
      timezone: 'UTC',
      timezone_abbreviation: 'UTC',
      generationtime_ms: 100,
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
    })

    const { weather: _weather, hasData, loadWeather } = useWeather()

    expect(hasData.value).toBe(false)

    const location = { latitude: 43.0, longitude: -2.9 }
    await loadWeather(location)

    expect(hasData.value).toBe(true)
  })

  it('isError computed returns correct value', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Test error'))

    const { error: _error, isError, loadWeather } = useWeather({ retryAttempts: 1 })

    expect(isError.value).toBe(false)

    const location = { latitude: 43.0, longitude: -2.9 }
    await loadWeather(location)

    expect(isError.value).toBe(true)
  })

  it('startPolling and stopPolling work correctly', () => {
    vi.useFakeTimers()

    mockedFetch.mockResolvedValue({
      latitude: 43.0,
      longitude: -2.9,
      elevation: 100,
      utc_offset_seconds: 0,
      timezone: 'UTC',
      timezone_abbreviation: 'UTC',
      generationtime_ms: 100,
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
    })

    const { startPolling, stopPolling, loadWeather, weather: _weather } = useWeather()

    const location = { latitude: 43.0, longitude: -2.9 }
    loadWeather(location)

    startPolling()

    vi.advanceTimersByTime(60000)

    expect(mockedFetch).toHaveBeenCalledTimes(2)

    stopPolling()

    vi.advanceTimersByTime(60000)

    expect(mockedFetch).toHaveBeenCalledTimes(2)
  })
})
