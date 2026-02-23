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

    it('should detect Mildew risk when conditions are met', () => {
        const { weatherData, alerts } = useWeather()

        weatherData.value = {
            temperature: 20,
            humidity: 90,
            soilHumidity: 40,
            precipitation: 0,
            isFrostLikely: false,
            isHeatWaveLikely: false
        }

        expect(alerts.value).toContain('Mildew Risk detected: High humidity and moderate temperature.')
    })

    it('should detect Botrytis risk in critical conditions', () => {
        const { weatherData, alerts } = useWeather()

        weatherData.value = {
            temperature: 18,
            humidity: 95,
            soilHumidity: 45,
            precipitation: 0,
            isFrostLikely: false,
            isHeatWaveLikely: false
        }

        expect(alerts.value).toContain('Botrytis Risk detected: Critical humidity levels.')
    })

    it('should detect Frost risk when temperature is below zero', () => {
        const { weatherData, alerts } = useWeather()

        weatherData.value = {
            temperature: -2,
            humidity: 50,
            soilHumidity: 30,
            precipitation: 0,
            isFrostLikely: true,
            isHeatWaveLikely: false
        }

        expect(alerts.value).toContain('Frost Risk: Protection recommended.')
    })

    it('should detect Heat Wave risk when temperature is extreme', () => {
        const { weatherData, alerts } = useWeather()

        weatherData.value = {
            temperature: 38,
            humidity: 20,
            soilHumidity: 10,
            precipitation: 0,
            isFrostLikely: false,
            isHeatWaveLikely: true
        }

        expect(alerts.value).toContain('Heat Wave Risk: Adjust irrigation patterns.')
    })

    it('should return no alerts when conditions are healthy', () => {
        const { weatherData, alerts } = useWeather()

        weatherData.value = {
            temperature: 22,
            humidity: 60,
            soilHumidity: 35,
            precipitation: 0,
            isFrostLikely: false,
            isHeatWaveLikely: false
        }

        expect(alerts.value).toEqual([])
    })
})
