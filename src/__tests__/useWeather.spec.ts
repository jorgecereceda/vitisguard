import { describe, it, expect } from 'vitest'
import { useWeather } from '../composables/useWeather'

describe('useWeather Composable', () => {
  it('should initialize with null data and no alerts', () => {
    const { weatherData, alerts, isLoading, error } = useWeather()

    expect(weatherData.value).toBeNull()
    expect(alerts.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  const baseData = {
    temperature: 20,
    humidity: 60,
    soilHumidity: 40,
    precipitation: 0,
    cloudCover: 10,
    et0: 2.5,
    sunshineDuration: 3600,
    isFrostLikely: false,
    isHeatWaveLikely: false
  }

  it('should detect Mildew risk when conditions are met', () => {
    const { weatherData, alerts } = useWeather()

    weatherData.value = {
      ...baseData,
      temperature: 20,
      humidity: 90
    }

    expect(alerts.value).toContain('Riesgo de Mildiú detectado: Humedad alta y temperaturas moderadas.')
  })

  it('should detect Botrytis risk in critical conditions', () => {
    const { weatherData, alerts } = useWeather()

    weatherData.value = {
      ...baseData,
      temperature: 18,
      humidity: 95
    }

    expect(alerts.value).toContain('Riesgo de Botrytis detectado: Niveles de humedad críticos.')
  })

  it('should detect Frost risk when conditions are met', () => {
    const { weatherData, alerts } = useWeather()

    weatherData.value = {
      ...baseData,
      temperature: -2,
      isFrostLikely: true
    }

    expect(alerts.value).toContain('Riesgo por condiciones meteorológicas adversas: Helada inminente.')
  })

  it('should detect Heat Wave risk when conditions are met', () => {
    const { weatherData, alerts } = useWeather()

    weatherData.value = {
      ...baseData,
      temperature: 38,
      isHeatWaveLikely: true
    }

    expect(alerts.value).toContain('Riesgo por condiciones meteorológicas adversas: Ola de calor.')
  })

  it('should return no alerts when conditions are healthy', () => {
    const { weatherData, alerts } = useWeather()

    weatherData.value = { ...baseData }

    expect(alerts.value).toEqual([])
  })
})
