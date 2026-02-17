import { describe, it, expect } from 'vitest'
import { useDiseaseDetection } from './use-disease-detection'
import type { WeatherConditions } from '@/types/disease'

describe('useDiseaseDetection', () => {
  const { analyzeDisease, analyzeAllDiseases, getHighRiskDiseases, getRecommendations } =
    useDiseaseDetection()

  const favorableConditions: WeatherConditions = {
    temperature: 18,
    humidity: 95,
    precipitation: 10,
    soilMoisture: 80,
    soilTemperature: 16,
    sunshineHours: 5,
    windSpeed: 5,
  }

  const unfavorableConditions: WeatherConditions = {
    temperature: 35,
    humidity: 30,
    precipitation: 0,
    soilMoisture: 20,
    soilTemperature: 32,
    sunshineHours: 12,
    windSpeed: 20,
  }

  it('analyzeMildiuRisk returns high risk for favorable conditions', () => {
    const result = analyzeDisease('mildiu', favorableConditions)
    expect(result.disease).toBe('mildiu')
    expect(['high', 'critical']).toContain(result.level)
    expect(result.probability).toBeGreaterThan(60)
    expect(result.conditions.length).toBeGreaterThan(0)
  })

  it('analyzeMildiuRisk returns low risk for unfavorable conditions', () => {
    const result = analyzeDisease('mildiu', unfavorableConditions)
    expect(result.disease).toBe('mildiu')
    expect(result.level).toBe('low')
    expect(result.probability).toBeLessThan(30)
  })

  it('analyzeBotrytisRisk returns correct risk for favorable conditions', () => {
    const result = analyzeDisease('botrytis', favorableConditions)
    expect(result.disease).toBe('botrytis')
    expect(result.conditions.length).toBeGreaterThan(0)
  })

  it('analyzeBotrytisRisk returns low risk for unfavorable conditions', () => {
    const result = analyzeDisease('botrytis', unfavorableConditions)
    expect(result.disease).toBe('botrytis')
    expect(result.level).toBe('low')
  })

  it('analyzeAllDiseases returns array of all diseases', () => {
    const results = analyzeAllDiseases(favorableConditions)
    expect(results).toHaveLength(4)
    expect(results.map(r => r.disease)).toContain('mildiu')
    expect(results.map(r => r.disease)).toContain('botrytis')
    expect(results.map(r => r.disease)).toContain('oidio')
    expect(results.map(r => r.disease)).toContain('excoriosis')
  })

  it('getHighRiskDiseases filters high and critical risks', () => {
    const allRisks = analyzeAllDiseases(favorableConditions)
    const highRisks = getHighRiskDiseases(allRisks)
    highRisks.forEach(risk => {
      expect(['high', 'critical']).toContain(risk.level)
    })
  })

  it('getRecommendations returns recommendations for high risk diseases', () => {
    const allRisks = analyzeAllDiseases(favorableConditions)
    const recommendations = getRecommendations(allRisks)
    expect(recommendations.length).toBeGreaterThan(0)
  })

  it('handles null values gracefully', () => {
    const nullConditions: WeatherConditions = {
      temperature: null,
      humidity: null,
      precipitation: null,
      soilMoisture: null,
      soilTemperature: null,
      sunshineHours: null,
      windSpeed: null,
    }
    const result = analyzeDisease('mildiu', nullConditions)
    expect(result.level).toBe('low')
    expect(result.probability).toBe(0)
  })

  it('returns recommendation string for each disease', () => {
    const result = analyzeDisease('mildiu', favorableConditions)
    expect(typeof result.recommendation).toBe('string')
    expect(result.recommendation.length).toBeGreaterThan(0)
  })

  it('detectedAt is a Date object', () => {
    const result = analyzeDisease('mildiu', favorableConditions)
    expect(result.detectedAt).toBeInstanceOf(Date)
  })
})
