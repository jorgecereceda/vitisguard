import { describe, it, expect } from 'vitest'
import { useWeather } from '../composables/use-weather'

describe('useWeather Composable', () => {
  it('should initialize with null data and no alerts', () => {
    const { weatherData, alerts, isLoading, error } = useWeather()

    expect(weatherData.value).toBeNull()
    expect(alerts.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  const baseData = {
    current: {
      temperature_2m: 20,
      relative_humidity_2m: 60,
      precipitation: 0,
      cloud_cover: 10
    },
    daily: {
      temperature_2m_min: [15],
      temperature_2m_max: [25],
      et0_fao_evapotranspiration: [2.5],
      sunshine_duration: [3600]
    },
    hourly: {
      soil_moisture_0_to_7cm: [40]
    }
  }

  it('should detect Mildew risk when conditions are met', () => {
    const { weather, alerts } = useWeather()

    weather.value = {
      ...baseData,
      current: {
        ...baseData.current,
        temperature_2m: 20,
        relative_humidity_2m: 90
      }
    } as any

    expect(alerts.value.some(a => a.includes('Mildiú'))).toBe(true)
  })

  it('should detect Botrytis risk in critical conditions', () => {
    const { weather, alerts } = useWeather()

    weather.value = {
      ...baseData,
      current: {
        ...baseData.current,
        temperature_2m: 18,
        relative_humidity_2m: 95
      }
    } as any

    expect(alerts.value.some(a => a.includes('Botrytis'))).toBe(true)
  })

  it('should detect Frost risk when conditions are met', () => {
    const { weather, alerts } = useWeather()

    weather.value = {
      ...baseData,
      current: {
        ...baseData.current,
        temperature_2m: -2
      },
      daily: {
        ...baseData.daily,
        temperature_2m_min: [-2]
      }
    } as any

    expect(alerts.value.some(a => a.includes('Helada'))).toBe(true)
  })

  it('should detect Heat Wave risk when conditions are met', () => {
    const { weather, alerts } = useWeather()

    weather.value = {
      ...baseData,
      current: {
        ...baseData.current,
        temperature_2m: 38
      },
      daily: {
        ...baseData.daily,
        temperature_2m_max: [38]
      }
    } as any

    expect(alerts.value.some(a => a.includes('Ola de Calor'))).toBe(true)
  })

  it('should return no alerts when conditions are healthy', () => {
    const { weather, alerts } = useWeather()

    weather.value = {
      current: {
        temperature_2m: 5,
        relative_humidity_2m: 30,
        precipitation: 0,
        cloud_cover: 10,
        wind_speed_10m: 10
      },
      daily: {
        temperature_2m_min: [3],
        temperature_2m_max: [8],
        et0_fao_evapotranspiration: [2.5],
        sunshine_duration: [3600]
      },
      hourly: {
        soil_moisture_0_to_7cm: [40],
        soil_temperature_0_to_7cm: [6],
        sunshine_duration: [3600]
      }
    } as any

    expect(alerts.value).toEqual([])
  })
})
