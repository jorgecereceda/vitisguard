import { computed } from 'vue'
import type { DiseaseType, DiseaseRisk, WeatherConditions } from '@/types/disease'
import { DISEASE_CONFIGS, calculateRiskLevel } from '@/utils/disease-thresholds'

export function useDiseaseDetection() {
  function calculateFavorability(
    value: number | null,
    min: number,
    max: number,
    idealMin?: number,
    idealMax?: number
  ): number {
    if (value === null) return 0

    if (idealMin !== undefined && idealMax !== undefined) {
      if (value >= idealMin && value <= idealMax) return 1
      if (value < idealMin) return Math.max(0, (value - min) / (idealMin - min))
      return Math.max(0, (max - value) / (max - idealMax))
    }

    if (value >= min && value <= max) return 1

    if (value < min) return Math.max(0, (value - (min - 5)) / 5)

    return Math.max(0, (max + 5 - value) / 5)
  }

  function analyzeDisease(
    diseaseType: DiseaseType,
    conditions: WeatherConditions
  ): DiseaseRisk {
    const config = DISEASE_CONFIGS[diseaseType]
    if (!config) {
      return {
        id: `disease-${diseaseType}-unknown`,
        category: 'disease',
        disease: diseaseType,
        level: 'low',
        probability: 0,
        conditions: [],
        recommendation: 'Enfermedad no reconocida',
        detectedAt: new Date(),
      }
    }
    const { thresholds, weights } = config

    const conditionsList: string[] = []

    const tempFav = calculateFavorability(
      conditions.temperature,
      thresholds.tempMin,
      thresholds.tempMax,
      thresholds.tempMin + 5,
      thresholds.tempMax - 5
    )
    if (tempFav > 0.5) {
      conditionsList.push(
        `Temperatura ${conditions.temperature}°C favorable`
      )
    }

    const humidityFav = calculateFavorability(
      conditions.humidity,
      thresholds.humidityMin,
      100,
      thresholds.humidityMin,
      95
    )
    if (humidityFav > 0.5) {
      conditionsList.push(
        `Humedad ${conditions.humidity}% favorable`
      )
    }

    const precipFav = thresholds.precipitationMin
      ? calculateFavorability(
          conditions.precipitation,
          0,
          thresholds.precipitationMin * 2,
          thresholds.precipitationMin,
          thresholds.precipitationMin * 2
        )
      : calculateFavorability(
          conditions.humidity,
          thresholds.humidityMin,
          100
        )

    if (precipFav > 0.5 && conditions.precipitation && conditions.precipitation > 0) {
      conditionsList.push(
        `Precipitación ${conditions.precipitation}mm favorable`
      )
    }

    const probability = Math.min(
      100,
      Math.round(
        (tempFav * weights.temperature * 100) +
        (humidityFav * weights.humidity * 100) +
        (precipFav * weights.precipitation * 100)
      )
    )

    const level = calculateRiskLevel(probability)
    const recommendation = config.recommendations[level]

    return {
      id: `disease-${diseaseType}-${Date.now()}`,
      category: 'disease',
      disease: diseaseType,
      level,
      probability,
      conditions: conditionsList,
      recommendation,
      detectedAt: new Date(),
    }
  }

  function analyzeAllDiseases(
    conditions: WeatherConditions
  ): DiseaseRisk[] {
    const diseases: DiseaseType[] = ['mildiu', 'botrytis', 'oidio', 'excoriosis']
    return diseases.map(disease => analyzeDisease(disease, conditions))
  }

  function getHighRiskDiseases(risks: DiseaseRisk[]): DiseaseRisk[] {
    return risks.filter(r => r.level === 'high' || r.level === 'critical')
  }

  function getRecommendations(risks: DiseaseRisk[]): string[] {
    const highRisk = getHighRiskDiseases(risks)
    return highRisk.map(r => r.recommendation)
  }

  const hasHighRisk = computed(() => {
    return (risks: DiseaseRisk[]) => 
      risks.some(r => r.level === 'high' || r.level === 'critical')
  })

  return {
    analyzeDisease,
    analyzeAllDiseases,
    getHighRiskDiseases,
    getRecommendations,
    hasHighRisk,
  }
}
