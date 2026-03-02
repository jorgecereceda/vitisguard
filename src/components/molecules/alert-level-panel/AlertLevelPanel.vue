<script setup lang="ts">
import type { RiskLevel, DiseaseType, WeatherAlertType } from '@/types/disease'
import { BaseBadge } from '@/components/atoms/base-badge'

interface DiseaseInfo {
  id: string
  type: DiseaseType
  name: string
  level: RiskLevel
  probability: number
  conditions: string[]
}

interface WeatherRiskInfo {
  id: string
  type: WeatherAlertType
  name: string
  level: RiskLevel
  conditions: string[]
  isActive: boolean
}

interface Props {
  diseases: DiseaseInfo[]
  weatherRisks: WeatherRiskInfo[]
}

defineProps<Props>()

const diseaseNames: Record<DiseaseType, string> = {
  mildiu: 'Mildiú',
  botrytis: 'Botrytis',
  oidio: 'Oídio',
  excoriosis: 'Excoriosis',
}

const weatherRiskNames: Record<WeatherAlertType, string> = {
  frost: 'Helada',
  lateFrost: 'Helada Tardía',
  heatwave: 'Ola de Calor',
  storm: 'Tormenta',
  drought: 'Sequía',
  excessiveRain: 'Exceso de Lluvia',
}

const levelVariant = (level: RiskLevel): 'success' | 'info' | 'warning' | 'danger' => {
  switch (level) {
    case 'critical':
      return 'danger'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    default:
      return 'success'
  }
}

const levelLabel = (level: RiskLevel): string => {
  return level.charAt(0).toUpperCase() + level.slice(1)
}
</script>

<template>
  <div class="alert-level-panel">
    <div class="alert-level-panel__section">
      <h3 class="alert-level-panel__section-title">
        <span class="alert-level-panel__section-icon">🦠</span>
        Riesgos por Enfermedades
      </h3>
      <div class="alert-level-panel__grid">
        <div
          v-for="disease in diseases"
          :key="disease.id"
          :class="['disease-card', `disease-card--${disease.level}`]"
        >
          <div class="disease-card__header">
            <span class="disease-card__name">{{ diseaseNames[disease.type] }}</span>
            <BaseBadge :variant="levelVariant(disease.level)" size="sm">
              {{ levelLabel(disease.level) }}
            </BaseBadge>
          </div>
          <div class="disease-card__probability">
            <span class="disease-card__probability-value">{{ disease.probability }}%</span>
            <span class="disease-card__probability-label">probabilidad</span>
          </div>
          <ul v-if="disease.conditions.length > 0" class="disease-card__conditions">
            <li v-for="(condition, idx) in disease.conditions" :key="idx">
              {{ condition }}
            </li>
          </ul>
          <p v-else class="disease-card__conditions-empty">
            Condiciones desfavorables
          </p>
        </div>
      </div>
    </div>

    <div class="alert-level-panel__section">
      <h3 class="alert-level-panel__section-title">
        <span class="alert-level-panel__section-icon">🌧️</span>
        Riesgos Climáticos
      </h3>
      <div class="alert-level-panel__grid alert-level-panel__grid--weather">
        <div
          v-for="risk in weatherRisks"
          :key="risk.id"
          :class="['weather-card', `weather-card--${risk.level}`, { 'weather-card--active': risk.isActive }]"
        >
          <div class="weather-card__header">
            <span class="weather-card__name">{{ weatherRiskNames[risk.type] }}</span>
            <BaseBadge :variant="levelVariant(risk.level)" size="sm">
              {{ levelLabel(risk.level) }}
            </BaseBadge>
          </div>
          <ul v-if="risk.conditions.length > 0" class="weather-card__conditions">
            <li v-for="(condition, idx) in risk.conditions" :key="idx">
              {{ condition }}
            </li>
          </ul>
          <p v-else class="weather-card__conditions-empty">
            Sin riesgo activo
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-level-panel {
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.alert-level-panel__section {
  margin-bottom: 2rem;
}

.alert-level-panel__section:last-child {
  margin-bottom: 0;
}

.alert-level-panel__section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: #94a3b8;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.alert-level-panel__section-icon {
  font-size: 1.25rem;
}

.alert-level-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.alert-level-panel__grid--weather {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.disease-card,
.weather-card {
  padding: 1.25rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left-width: 5px; /* Semaforo style */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.disease-card:hover,
.weather-card:hover {
  transform: translateY(-4px);
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.6);
}

.disease-card--critical,
.weather-card--critical {
  border-left-color: #ef4444; /* Red */
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.disease-card--high,
.weather-card--high {
  border-left-color: #f97316; /* Orange */
  background: linear-gradient(145deg, rgba(249, 115, 22, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.disease-card--medium,
.weather-card--medium {
  border-left-color: #f59e0b; /* Yellow/Amber */
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.disease-card--low,
.weather-card--low {
  border-left-color: #22c55e; /* Green */
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.weather-card--active {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
  }
}

.disease-card__header,
.weather-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.disease-card__name,
.weather-card__name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.disease-card__probability {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.disease-card__probability-value {
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
}

.disease-card__probability-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.disease-card__conditions,
.weather-card__conditions {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 500;
}

.disease-card__conditions li,
.weather-card__conditions li {
  padding: 0.35rem 0;
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.4;
}

.disease-card__conditions li::before,
.weather-card__conditions li::before {
  content: '•';
  position: absolute;
  left: 0.25rem;
  color: #94a3b8;
  font-weight: 900;
}

.disease-card__conditions-empty,
.weather-card__conditions-empty {
  font-size: 0.75rem;
  color: #4ade80;
  font-style: italic;
  margin: 0;
  font-weight: 600;
}

@media (max-width: 640px) {
  .alert-level-panel__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .alert-level-panel {
    padding: 1rem;
  }

  .alert-level-panel__grid {
    grid-template-columns: 1fr;
  }
}
</style>
