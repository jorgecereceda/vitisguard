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

interface Phenomenon {
  id: string
  name: string
  category: 'weather' | 'disease' | 'alert'
  priority: RiskLevel
  alertTitle: string
  alertContent: string
  recTitle: string
  recContent: string
}

const treatments = computed<Phenomenon[]>(() => {
  const phenomenonMap = new Map<string, Phenomenon>()

  // 1. Procesar Riesgos Climáticos Estructurados
  props.activeWeatherRisks
    .filter(r => r.level === 'high' || r.level === 'critical')
    .forEach(risk => {
      const config = WEATHER_ALERT_CONFIGS[risk.type as keyof typeof WEATHER_ALERT_CONFIGS]
      if (config) {
        phenomenonMap.set(risk.name.toLowerCase(), {
          id: risk.id,
          name: risk.name,
          category: 'weather',
          priority: risk.level,
          alertTitle: `Alerta: ${risk.name}`,
          alertContent: config.description,
          recTitle: `Recomendación de Protección`,
          recContent: (config.recommendations as Record<RiskLevel, string>)[risk.level] || config.description || ''
        })
      }
    })

  // 2. Procesar Enfermedades
  props.diseases
    .filter(d => d.level === 'high' || d.level === 'critical')
    .forEach(disease => {
      const config = DISEASE_CONFIGS[disease.type]
      if (config) {
        phenomenonMap.set(disease.name.toLowerCase(), {
          id: disease.id,
          name: disease.name,
          category: 'disease',
          priority: disease.level,
          alertTitle: `Riesgo de ${disease.name}`,
          alertContent: `Detección: ${disease.probability}% de probabilidad de infección.`,
          recTitle: `Tratamiento Recomendado`,
          recContent: (config.recommendations as Record<RiskLevel, string>)[disease.level] || ''
        })
      }
    })

  // 3. Procesar Alertas de Texto (Fusión o nuevas)
  props.activeAlerts.forEach((alert, index) => {
    if (!alert || typeof alert !== 'string') return
    const segments = alert.split(':')
    const name = (segments[0] || '').trim().toLowerCase()

    const existing = Array.from(phenomenonMap.values()).find(p =>
      p.name.toLowerCase().includes(name) || name.includes(p.name.toLowerCase())
    )

    if (existing) {
      if (segments.length > 1) {
        existing.alertContent = segments.slice(1).join(':').trim()
      }
    } else {
      phenomenonMap.set(`text-${index}`, {
        id: `text-${index}`,
        name: segments[0] || 'Alerta',
        category: 'alert',
        priority: 'critical',
        alertTitle: 'Alerta Detectada',
        alertContent: alert,
        recTitle: 'Acción Sugerida',
        recContent: 'Se recomienda monitoreo inmediato de la zona afectada y preparar medidas preventivas.'
      })
    }
  })

  return Array.from(phenomenonMap.values()).sort((a, b) => {
    const order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority] - order[b.priority]
  })
})

const hasPhenomena = computed(() => treatments.value.length > 0)
</script>

<template>
  <div class="treatment-panel">
    <template v-if="hasPhenomena">
      <div class="treatment-panel__grid">
        <div
          v-for="p in treatments"
          :key="p.id"
          class="phenomenon-group"
        >
          <!-- TARJETA DE ALERTA -->
          <div :class="['treatment-card', 'treatment-card--alert', `treatment-card--${p.priority}`]">
            <div class="treatment-card__header">
              <span class="treatment-card__icon">🚨</span>
              <span class="treatment-card__title">{{ p.alertTitle }}</span>
            </div>
            <p class="treatment-card__description">{{ p.alertContent }}</p>
          </div>

          <!-- TARJETA DE RECOMENDACIÓN -->
          <div :class="['treatment-card', 'treatment-card--rec', `treatment-card--${p.priority}`]">
            <div class="treatment-card__header">
              <span class="treatment-card__icon">💡</span>
              <span class="treatment-card__title">{{ p.recTitle }}</span>
            </div>
            <p class="treatment-card__description">{{ p.recContent }}</p>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="treatment-panel__empty">
      <div class="treatment-panel__empty-icon">🌿</div>
      <h3 class="treatment-panel__empty-title">Todo Bajo Control</h3>
      <p class="treatment-panel__empty-text">
        No se han detectado riesgos activos en este momento. El viñedo se encuentra en condiciones óptimas.
      </p>
    </div>
  </div>
</template>

<style scoped>
.treatment-panel {
  width: 100%;
}

.treatment-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  justify-content: center;
}

.phenomenon-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slide-up 0.5s ease-out forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.treatment-card {
  padding: 1.75rem 2rem;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Estilo para la Alerta */
.treatment-card--alert {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
}

.treatment-card--alert .treatment-card__title {
  color: #fca5a5;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

/* Estilo para la Recomendación */
.treatment-card--rec {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background: rgba(30, 41, 59, 0.3);
}

.treatment-card--rec .treatment-card__title {
  color: #6ee7b7;
}

.treatment-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(15, 23, 42, 0.7);
}

.treatment-card--critical {
  border-left: 8px solid #ef4444;
}

.treatment-card--high {
  border-left: 8px solid #f97316;
}

.treatment-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.treatment-card__icon {
  font-size: 1.5rem;
}

.treatment-card__title {
  font-weight: 800;
  font-size: 1.15rem;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.treatment-card__description {
  margin: 0;
  font-size: 1rem;
  color: #cbd5e1;
  line-height: 1.6;
  font-weight: 500;
}

.treatment-panel__empty {
  text-align: center;
  padding: 5rem 3rem;
  background: rgba(34, 197, 94, 0.05);
  border: 2px dashed rgba(34, 197, 94, 0.2);
  border-radius: 30px;
  max-width: 600px;
  margin: 0 auto;
}

.treatment-panel__empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.treatment-panel__empty-title {
  font-size: 1.75rem;
  color: #4ade80;
  margin-bottom: 0.75rem;
}

.treatment-panel__empty-text {
  color: #94a3b8;
  font-size: 1.1rem;
}

@media (max-width: 600px) {
  .treatment-panel__grid {
    grid-template-columns: 1fr;
  }
}

.treatment-panel__empty {
  text-align: center;
  padding: 5rem 3rem;
  background: rgba(34, 197, 94, 0.08);
  border: 2px dashed rgba(34, 197, 94, 0.4);
  border-radius: 30px;
  animation: pulse-subtle 4s infinite ease-in-out;
  max-width: 800px;
  margin: 0 auto;
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

.treatment-panel__empty-icon {
  font-size: 4.5rem;
  margin-bottom: 2rem;
  filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5));
}

.treatment-panel__empty-title {
  font-size: 2rem;
  font-weight: 900;
  color: #4ade80;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
}

.treatment-panel__empty-text {
  font-size: 1.15rem;
  color: #cbd5e1;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 850px) {
  .treatment-panel__list {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .treatment-card {
    padding: 1.5rem;
  }
  .treatment-card__title {
    font-size: 1.1rem;
  }
  .treatment-card__description {
    font-size: 0.95rem;
  }
}
</style>
