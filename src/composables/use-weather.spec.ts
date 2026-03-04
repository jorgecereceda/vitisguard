import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { WeatherData } from '@/types/weather'
import { useWeather } from './use-weather'

vi.mock('@/services/weather-api', () => ({
  fetchWeatherData: vi.fn(),
}))

import { fetchWeatherData } from '@/services/weather-api'
const mockedFetch = fetchWeatherData as ReturnType<typeof vi.fn>

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
      current: { time: '2024-01-01T00:00:00Z', temperature_2m: 20 },
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
      metadata: {
        latitude: 43.0,
        longitude: -2.9,
        elevation: 100,
        utc_offset_seconds: 0,
        timezone: 'UTC',
        timezone_abbreviation: 'UTC',
        generationtime_ms: 100
      },
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
    let resolveFetch: (value: WeatherData) => void
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
      current: { time: '2024-01-01T00:00:00Z', temperature_2m: 20 },
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
      metadata: {
        latitude: 43.0,
        longitude: -2.9,
        elevation: 100,
        utc_offset_seconds: 0,
        timezone: 'UTC',
        timezone_abbreviation: 'UTC',
        generationtime_ms: 100
      },
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
        current: { time: '2024-01-01T00:00:00Z', temperature_2m: 20 },
        hourly: { time: ['2024-01-01'] },
        daily: { time: ['2024-01-01'] },
        metadata: {
          latitude: 43.0,
          longitude: -2.9,
          elevation: 100,
          utc_offset_seconds: 0,
          timezone: 'UTC',
          timezone_abbreviation: 'UTC',
          generationtime_ms: 100
        },
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
      current: { time: '2024-01-01T00:00:00Z', temperature_2m: 20 },
      hourly: { time: ['2024-01-01'] },
      daily: { time: ['2024-01-01'] },
      metadata: {
        latitude: 43.0,
        longitude: -2.9,
        elevation: 100,
        utc_offset_seconds: 0,
        timezone: 'UTC',
        timezone_abbreviation: 'UTC',
        generationtime_ms: 100
      },
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

  it('calculates alerts correctly based on weather data', async () => {
    const { alerts, loadWeather } = useWeather()

    // Mock data that should trigger Mildew and Heat Wave alerts
    // Mildiú requires: humidity >= 90, temp 6-26, precipitation >= 6
    // Heat wave requires: temperature > 35
    const mockData = {
      current: {
        time: '2024-01-01T00:00:00Z',
        temperature_2m: 38,
        relative_humidity_2m: 92,
        precipitation: 10,
        wind_speed_10m: 10,
      },
      daily: {
        time: ['2024-01-01'],
        temperature_2m_min: [10],
        temperature_2m_max: [40],
      },
      hourly: {
        soil_moisture_0_to_7cm: [40],
        soil_temperature_0_to_7cm: [18],
        sunshine_duration: [3600],
      },
      metadata: { latitude: 0, longitude: 0 },
    }

    mockedFetch.mockResolvedValueOnce(mockData)

    await loadWeather({ latitude: 0, longitude: 0 })

    expect(alerts.value.some(a => a.includes('Mildiú'))).toBe(true)
    expect(alerts.value.some(a => a.includes('Ola de Calor'))).toBe(true)
    expect(alerts.value.some(a => a.includes('Helada'))).toBe(false)
  })

  it('calculates frost and botrytis alerts', async () => {
    const { alerts, loadWeather } = useWeather()

    // Mock data that should trigger Botrytis and Frost alerts
    // Botrytis requires: temp 15-25, humidity >= 80
    // Frost requires: temperature < 0
    const mockData = {
      current: {
        time: '2024-01-01T00:00:00Z',
        temperature_2m: -2,
        relative_humidity_2m: 92,
        precipitation: 0,
        wind_speed_10m: 10,
      },
      daily: {
        time: ['2024-01-01'],
        temperature_2m_min: [-2],
        temperature_2m_max: [20],
      },
      hourly: {
        soil_moisture_0_to_7cm: [40],
        soil_temperature_0_to_7cm: [18],
        sunshine_duration: [3600],
      },
      metadata: { latitude: 0, longitude: 0 },
    }

    mockedFetch.mockResolvedValueOnce(mockData)

    await loadWeather({ latitude: 0, longitude: 0 })

    expect(alerts.value.some(a => a.includes('Botrytis'))).toBe(true)
    expect(alerts.value.some(a => a.includes('Helada'))).toBe(true)
  })

  it('provides weatherData compatibility layer', async () => {
    const { weatherData, loadWeather } = useWeather()

    const mockData = {
      current: {
        time: '2024-01-01T00:00:00Z',
        temperature_2m: 20,
        relative_humidity_2m: 50,
        precipitation: 5,
        cloud_cover: 75,
      },
      daily: {
        time: ['2024-01-01'],
        et0_fao_evapotranspiration: [3.5],
        sunshine_duration: [36000],
        temperature_2m_min: [10],
        temperature_2m_max: [25],
      },
      hourly: {
        time: ['2024-01-01T00:00:00Z'],
        soil_moisture_0_to_7cm: [0.25],
      },
      metadata: { latitude: 0, longitude: 0 },
    }

    mockedFetch.mockResolvedValueOnce(mockData)

    await loadWeather({ latitude: 0, longitude: 0 })

    expect(weatherData.value).toEqual({
      temperature: 20,
      humidity: 50,
      soilHumidity: 56,
      precipitation: 5,
      cloudCover: 75,
      et0: 3.5,
      sunshineDuration: 36000,
      isFrostLikely: false,
      isHeatWaveLikely: false,
      soilMoistureLevels: expect.objectContaining({
        current: 56,
        depth20: 0,
        depth40: 0,
        depth60: 0,
      }),
      allDaysSoilMoisture: expect.any(Array),
    })
  })
})
