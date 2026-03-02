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
  isActive?: boolean
}

interface Props {
  diseases: DiseaseRisk[]
  weatherRisks: WeatherRisk[]
  activeAlerts?: string[]
  activeWeatherRisks?: WeatherRisk[]
}

const props = withDefaults(defineProps<Props>(), {
  activeAlerts: () => [],
  activeWeatherRisks: () => [],
})

interface Treatment {
  id: string
  category: 'disease' | 'weather' | 'alert'
  title: string
  description: string
  priority: RiskLevel
}

const hasActiveContent = computed(() => {
  return props.activeAlerts.length > 0 || props.activeWeatherRisks.length > 0
})

const treatments = computed<Treatment[]>(() => {
  const result: Treatment[] = []

  props.activeAlerts.forEach((alert, index) => {
    const isDiseaseAlert = alert.includes('Riesgo') && alert.includes('probabilidad')
    const title = isDiseaseAlert ? 'Alerta de Enfermedad' : 'Alerta Meteorológica'
    
    result.push({
      id: `alert-${index}`,
      category: 'alert',
      title,
      description: alert,
      priority: 'critical',
    })
  })

  props.activeWeatherRisks
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

  const priorityOrder: Record<RiskLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
})

const alertsList = computed(() => 
  treatments.value.filter(t => t.category === 'alert')
)

const recommendationsList = computed(() => 
  treatments.value.filter(t => t.category === 'disease' || t.category === 'weather')
)

const hasTreatments = computed(() => treatments.value.length > 0)

const getCategoryIcon = (category: 'disease' | 'weather' | 'alert') => {
  if (category === 'alert') return '🚨'
  return category === 'disease' ? '🦠' : '🌧️'
}
</script>

<template>
  <div class="treatment-panel">
    <template v-if="hasTreatments">
      
      <!-- Sección Alertas -->
      <div v-if="alertsList.length > 0" class="treatment-panel__section">
        <h4 class="treatment-panel__subtitle">
          <span>🚨</span> Alertas
        </h4>
        <div class="treatment-panel__list">
          <div
            v-for="alert in alertsList"
            :key="alert.id"
            :class="['treatment-card', `treatment-card--${alert.priority}`]"
          >
            <div class="treatment-card__header">
              <span class="treatment-card__icon">{{ getCategoryIcon(alert.category) }}</span>
              <span class="treatment-card__title">{{ alert.title }}</span>
            </div>
            <p class="treatment-card__description">{{ alert.description }}</p>
          </div>
        </div>
      </div>

      <!-- Sección Recomendaciones -->
      <div v-if="recommendationsList.length > 0" class="treatment-panel__section">
        <h4 class="treatment-panel__subtitle">
          <span>💊</span> Recomendaciones
        </h4>
        <div class="treatment-panel__list">
          <div
            v-for="rec in recommendationsList"
            :key="rec.id"
            :class="['treatment-card', `treatment-card--${rec.priority}`]"
          >
            <div class="treatment-card__header">
              <span class="treatment-card__icon">{{ getCategoryIcon(rec.category) }}</span>
              <span class="treatment-card__title">{{ rec.title }}</span>
            </div>
            <p class="treatment-card__description">{{ rec.description }}</p>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="treatment-panel__empty">
      <div class="treatment-panel__empty-icon">✅</div>
      <h3 class="treatment-panel__empty-title">Sin alertas activas</h3>
      <p class="treatment-panel__empty-text">
        Las condiciones climáticas actuales no presentan riesgos para tus viñedos.
      </p>
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

.treatment-panel__section {
  margin-bottom: 1.5rem;
}

.treatment-panel__section:last-child {
  margin-bottom: 0;
}

.treatment-panel__subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
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
  border: 1px solid;
}

.treatment-card--critical {
  background: #fef2f2;
  border-color: #ef4444;
}

.treatment-card--high {
  background: #fff7ed;
  border-color: #f97316;
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

.treatment-panel__empty {
  text-align: center;
  padding: 3rem;
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 8px;
}

.treatment-panel__empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.treatment-panel__empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #16a34a;
  margin: 0 0 0.5rem;
}

.treatment-panel__empty-text {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}
</style>
