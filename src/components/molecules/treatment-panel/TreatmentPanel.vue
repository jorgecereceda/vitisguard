<script setup lang="ts">
import { computed } from 'vue'
import type { DiseaseType, RiskLevel } from '@/types/disease'
import { DISEASE_CONFIGS } from '@/utils/disease-thresholds'
import { WEATHER_ALERT_CONFIGS } from '@/utils/weather-alerts'

interface DiseaseRisk {
  id: string
  type: DiseaseType
  name: string
  level: RiskLevel
  probability: number
}

interface WeatherRisk {
  id: string
  type: string
  name: string
  level: RiskLevel
}

interface Props {
  diseases: DiseaseRisk[]
  weatherRisks: WeatherRisk[]
}

const props = defineProps<Props>()

interface Treatment {
  id: string
  category: 'disease' | 'weather'
  title: string
  description: string
  priority: RiskLevel
}

const treatments = computed<Treatment[]>(() => {
  const result: Treatment[] = []

  props.diseases
    .filter(d => d.level === 'high' || d.level === 'critical')
    .forEach(disease => {
      const config = DISEASE_CONFIGS[disease.type]
      if (config) {
        result.push({
          id: disease.id,
          category: 'disease',
          title: `Tratamiento para ${disease.name}`,
          description: config.recommendations[disease.level],
          priority: disease.level,
        })
      }
    })

  props.weatherRisks
    .filter(r => r.level === 'high' || r.level === 'critical')
    .forEach(risk => {
      const config = WEATHER_ALERT_CONFIGS[risk.type as keyof typeof WEATHER_ALERT_CONFIGS]
      if (config) {
        result.push({
          id: risk.id,
          category: 'weather',
          title: `Protección contra ${risk.name}`,
          description: config.recommendations[risk.level],
          priority: risk.level,
        })
      }
    })

  const priorityOrder: Record<RiskLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
})

const hasTreatments = computed(() => treatments.value.length > 0)

const getCategoryIcon = (category: 'disease' | 'weather') => {
  return category === 'disease' ? '🦠' : '🌧️'
}
</script>

<template>
  <div v-if="hasTreatments" class="treatment-panel">
    <h3 class="treatment-panel__title">
      <span class="treatment-panel__icon">💊</span>
      Propuestas de Tratamiento
    </h3>

    <div class="treatment-panel__list">
      <div
        v-for="treatment in treatments"
        :key="treatment.id"
        :class="['treatment-card', `treatment-card--${treatment.priority}`]"
      >
        <div class="treatment-card__header">
          <span class="treatment-card__icon">{{ getCategoryIcon(treatment.category) }}</span>
          <span class="treatment-card__title">{{ treatment.title }}</span>
        </div>
        <p class="treatment-card__description">{{ treatment.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.treatment-panel {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.treatment-panel__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem;
}

.treatment-panel__icon {
  font-size: 1.25rem;
}

.treatment-panel__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.treatment-card {
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid;
}

.treatment-card--critical {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.treatment-card--high {
  background: #fff7ed;
  border-left-color: #f97316;
}

.treatment-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.treatment-card__icon {
  font-size: 1.25rem;
}

.treatment-card__title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
}

.treatment-card__description {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}
</style>
