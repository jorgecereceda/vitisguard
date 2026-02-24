import { ref, computed } from 'vue'
import type { AnyRecommendation, DiseaseRisk, RiskLevel } from '@/types/disease'
import { useDiseaseDetection } from './use-disease-detection'
import { generateWeatherAlerts, generateIrrigationRecommendation } from '@/utils/weather-alerts'
import type { CurrentData, HourlyData } from '@/types/weather'

const PRIORITY_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function useRecommendations() {
  const recommendations = ref<AnyRecommendation[]>([])
  const dismissedIds = ref<Set<string>>(new Set())

  function extractWeatherConditions(current: CurrentData | null, hourly: HourlyData | null) {
    return {
      temperature: current?.temperature_2m ?? null,
      humidity: current?.relative_humidity_2m ?? null,
      precipitation: current?.precipitation ?? null,
      soilMoisture: hourly?.soil_moisture_0_to_7cm?.[0] ?? null,
      soilTemperature: hourly?.soil_temperature_0_to_7cm?.[0] ?? null,
      sunshineHours: hourly?.sunshine_duration?.[0] ?? null,
      windSpeed: current?.wind_speed_10m ?? null,
    }
  }

  function analyzeWeatherData(
    current: CurrentData | null,
    hourly: HourlyData | null,
    daysWithoutRain: number = 0
  ): AnyRecommendation[] {
    const conditions = extractWeatherConditions(current, hourly)
    const { analyzeAllDiseases } = useDiseaseDetection()

    const diseaseRisks = analyzeAllDiseases(conditions)

    const updatedDiseaseRisks: DiseaseRisk[] = diseaseRisks.map(risk => ({
      ...risk,
      id: `disease-${risk.disease}-${Date.now()}`,
      category: 'disease' as const,
    }))

    const weatherAlerts = generateWeatherAlerts(
      conditions.temperature,
      conditions.humidity,
      conditions.precipitation,
      conditions.windSpeed,
      daysWithoutRain
    )

    const irrigationRec = generateIrrigationRecommendation(
      conditions.soilMoisture ?? null,
      null,
      conditions.precipitation ?? null
    )

    const allRecommendations: AnyRecommendation[] = [
      ...updatedDiseaseRisks,
      ...weatherAlerts,
    ]

    if (irrigationRec) {
      allRecommendations.push(irrigationRec)
    }

    return allRecommendations
  }

  function setRecommendations(newRecs: AnyRecommendation[]): void {
    recommendations.value = newRecs
  }

  function getActiveRecommendations(): AnyRecommendation[] {
    return recommendations.value.filter(
      rec => !dismissedIds.value.has(rec.id)
    )
  }

  function getPrioritizedRecommendations(limit?: number): AnyRecommendation[] {
    const active = getActiveRecommendations()
    const sorted = [...active].sort((a, b) => {
      const priorityA = PRIORITY_ORDER[a.level]
      const priorityB = PRIORITY_ORDER[b.level]
      return priorityA - priorityB
    })
    return limit ? sorted.slice(0, limit) : sorted
  }

  function getCriticalAlerts(): AnyRecommendation[] {
    return getActiveRecommendations().filter(
      rec => rec.level === 'critical'
    )
  }

  function getAlertsByCategory(category: 'disease' | 'weather' | 'irrigation'): AnyRecommendation[] {
    return getActiveRecommendations().filter(
      rec => rec.category === category
    )
  }

  function dismissAlert(id: string): void {
    dismissedIds.value.add(id)
  }

  function clearDismissed(): void {
    dismissedIds.value.clear()
  }

  const hasCritical = computed(() => getCriticalAlerts().length > 0)
  const hasAlerts = computed(() => getActiveRecommendations().length > 0)
  const alertCount = computed(() => getActiveRecommendations().length)

  return {
    recommendations,
    setRecommendations,
    analyzeWeatherData,
    getActiveRecommendations,
    getPrioritizedRecommendations,
    getCriticalAlerts,
    getAlertsByCategory,
    dismissAlert,
    clearDismissed,
    hasCritical,
    hasAlerts,
    alertCount,
  }
}
