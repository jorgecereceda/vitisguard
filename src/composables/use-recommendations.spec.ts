import { describe, it, expect } from 'vitest'
import { useRecommendations } from './use-recommendations'
import type { CurrentData, HourlyData } from '@/types/weather'

describe('useRecommendations', () => {
  const { analyzeWeatherData } = useRecommendations()

  const mockCurrent: CurrentData = {
    time: '2024-01-01T12:00:00',
    temperature_2m: 18,
    relative_humidity_2m: 95,
    precipitation: 10,
    wind_speed_10m: 15,
  }

  const mockHourly: HourlyData = {
    time: ['2024-01-01T12:00:00'],
    soil_moisture_0_to_7cm: [85],
    soil_temperature_0_to_7cm: [16],
    sunshine_duration: [5],
  }

  it('analyzeWeatherData returns recommendations array', () => {
    const recommendations = analyzeWeatherData(mockCurrent, mockHourly)
    expect(Array.isArray(recommendations)).toBe(true)
    expect(recommendations.length).toBeGreaterThan(0)
  })

  it('detects frost when temperature < 0', () => {
    const coldCurrent = { ...mockCurrent, temperature_2m: -5 }
    const recommendations = analyzeWeatherData(coldCurrent, mockHourly)
    const weatherAlerts = recommendations.filter(r => r.category === 'weather')
    expect(weatherAlerts.length).toBeGreaterThan(0)
    expect(weatherAlerts.some(a => 'type' in a && a.type === 'frost')).toBe(true)
  })

  it('detects heatwave when temperature > 35', () => {
    const hotCurrent = { ...mockCurrent, temperature_2m: 38 }
    const recommendations = analyzeWeatherData(hotCurrent, mockHourly)
    const weatherAlerts = recommendations.filter(r => r.category === 'weather')
    expect(weatherAlerts.some(a => 'type' in a && a.type === 'heatwave')).toBe(true)
  })

  it('detects drought after days without rain', () => {
    const recommendations = analyzeWeatherData(mockCurrent, mockHourly, 10)
    const weatherAlerts = recommendations.filter(r => r.category === 'weather')
    expect(weatherAlerts.some(a => 'type' in a && a.type === 'drought')).toBe(true)
  })

  it('generates irrigation recommendation for low soil moisture', () => {
    const dryHourly: HourlyData = {
      ...mockHourly,
      soil_moisture_0_to_7cm: [15],
    }
    const recommendations = analyzeWeatherData(mockCurrent, dryHourly)
    const irrigation = recommendations.filter(r => r.category === 'irrigation')
    expect(irrigation.length).toBeGreaterThan(0)
    expect(irrigation[0]?.action).toBe('increase')
  })

  it('handles null data gracefully', () => {
    const recommendations = analyzeWeatherData(null, null)
    expect(Array.isArray(recommendations)).toBe(true)
  })
})
