<script setup lang="ts">
import type { RiskLevel } from '@/types/disease'
import { BaseBadge } from '@/components/atoms/base-badge'

interface IrrigationData {
  soilMoisture: number | null
  et0: number | null
  precipitationDaily: number | null
  precipitationWeek: number | null
  temperature: number | null
  humidity: number | null
}

interface Props {
  data: IrrigationData
}

const props = defineProps<Props>()

type IrrigationAction = 'increase' | 'decrease' | 'maintain'
type IrrigationStatus = 'urgent' | 'needed' | 'optimal' | 'excess'

interface IrrigationResult {
  status: IrrigationStatus
  level: RiskLevel
  action: IrrigationAction
  title: string
  recommendation: string
  conditions: string[]
}

function calculateIrrigation(data: IrrigationData): IrrigationResult {
  const conditions: string[] = []
  let status: IrrigationStatus = 'optimal'
  let level: RiskLevel = 'low'
  let action: IrrigationAction = 'maintain'
  let title = 'Riego Óptimo'
  let recommendation = 'Mantener la rutina de riego actual.'

  const soilMoisture = data.soilMoisture ?? -1
  const et0 = data.et0 ?? 0
  const precipWeek = data.precipitationWeek ?? 0
  const temp = data.temperature ?? 20

  if (soilMoisture < 0) {
    conditions.push('Datos de humedad del suelo no disponibles')
  }

  if (soilMoisture >= 0 && soilMoisture < 20) {
    status = 'urgent'
    level = 'critical'
    action = 'increase'
    title = 'Riego Urgente'
    recommendation = 'Humedad del suelo crítica. Aplicar riego inmediatamente.'
    conditions.push(`Humedad del suelo: ${soilMoisture.toFixed(0)}% (crítico)`)
  } else if (soilMoisture >= 20 && soilMoisture < 35) {
    status = 'needed'
    level = 'high'
    action = 'increase'
    title = 'Riego Necesario'
    recommendation = 'Incrementar frecuencia y cantidad de riego.'
    conditions.push(`Humedad del suelo: ${soilMoisture.toFixed(0)}% (baja)`)
  } else if (soilMoisture >= 35 && soilMoisture < 65) {
    status = 'optimal'
    level = 'low'
    action = 'maintain'
    title = 'Riego Óptimo'
    recommendation = 'Mantener la rutina de riego actual.'
    conditions.push(`Humedad del suelo: ${soilMoisture.toFixed(0)}% (óptimo)`)
  } else if (soilMoisture >= 65 && soilMoisture < 80) {
    status = 'excess'
    level = 'medium'
    action = 'decrease'
    title = 'Reducir Riego'
    recommendation = 'Reducir frecuencia de riego. Monitorear drenaje.'
    conditions.push(`Humedad del suelo: ${soilMoisture.toFixed(0)}% (elevada)`)
  } else if (soilMoisture >= 80) {
    status = 'excess'
    level = 'high'
    action = 'decrease'
    title = 'Exceso de Riego'
    recommendation = 'Suspender riego. Verificar sistema de drenaje.'
    conditions.push(`Humedad del suelo: ${soilMoisture.toFixed(0)}% (excesivo)`)
  }

  if (et0 > 5 && soilMoisture >= 0 && soilMoisture < 50) {
    conditions.push(`Alta evapotranspiración: ${et0.toFixed(1)} mm/día`)
    if (status === 'optimal') {
      status = 'needed'
      level = 'medium'
      action = 'increase'
      title = 'Alta Demanda'
      recommendation = 'Alta demanda evapotranspirativa. Considerar riego adicional.'
    }
  }

  if (et0 > 7) {
    conditions.push(`Muy alta evapotranspiración: ${et0.toFixed(1)} mm/día - Estrés térmico`)
  }

  if (precipWeek > 30) {
    conditions.push(`Precipitación semanal: ${precipWeek.toFixed(1)} mm`)
    if (status === 'optimal' || status === 'needed') {
      status = 'excess'
      level = 'medium'
      action = 'decrease'
      title = 'Precipitación Reciente'
      recommendation = 'Lluvia reciente cubre necesidades. Suspender riego.'
    }
  } else if (precipWeek > 10) {
    conditions.push(`Precipitación semanal: ${precipWeek.toFixed(1)} mm`)
  }

  if (temp > 32) {
    conditions.push(`Temperatura alta: ${temp.toFixed(0)}°C - Aumentar riego`)
    if (status === 'optimal') {
      status = 'needed'
      level = 'medium'
      action = 'increase'
      title = 'Protección Térmica'
      recommendation = 'Temperaturas extremas. Riego matutino recomendado.'
    }
  }

  if (data.humidity !== null && data.humidity < 30) {
    conditions.push(`Humedad relativa baja: ${data.humidity.toFixed(0)}%`)
  }

  return { status, level, action, title, recommendation, conditions }
}

const irrigation = calculateIrrigation(props.data)

const actionIcon = (action: IrrigationAction) => {
  switch (action) {
    case 'increase': return '⬆️'
    case 'decrease': return '⬇️'
    default: return '➡️'
  }
}

const statusVariant = (status: IrrigationStatus): 'success' | 'info' | 'warning' | 'danger' => {
  switch (status) {
    case 'urgent': return 'danger'
    case 'needed': return 'warning'
    case 'optimal': return 'success'
    case 'excess': return 'info'
  }
}

const statusLabel = (status: IrrigationStatus): string => {
  switch (status) {
    case 'urgent': return 'URGENTE'
    case 'needed': return 'NECESARIO'
    case 'optimal': return 'ÓPTIMO'
    case 'excess': return 'EXCESO'
  }
}

const levelLabel = (level: RiskLevel): string => {
  return level.charAt(0).toUpperCase() + level.slice(1)
}
</script>

<template>
  <div class="irrigation-panel">
    <h3 class="irrigation-panel__title">
      <span class="irrigation-panel__icon">💧</span>
      Recomendaciones de Riego
    </h3>

    <div :class="['irrigation-panel__status', `irrigation-panel__status--${irrigation.status}`]">
      <div class="irrigation-panel__status-header">
        <span class="irrigation-panel__action-icon">{{ actionIcon(irrigation.action) }}</span>
        <div class="irrigation-panel__status-info">
          <span class="irrigation-panel__status-title">{{ irrigation.title }}</span>
          <BaseBadge :variant="statusVariant(irrigation.status)" size="sm">
            {{ statusLabel(irrigation.status) }}
          </BaseBadge>
        </div>
      </div>
      <p class="irrigation-panel__recommendation">{{ irrigation.recommendation }}</p>
    </div>

    <div class="irrigation-panel__metrics">
      <h4 class="irrigation-panel__subtitle">Métricas Actuales</h4>
      <div class="irrigation-panel__metrics-grid">
        <div class="metric-card">
          <span class="metric-card__label">Humedad Suelo</span>
          <span :class="['metric-card__value', { 
            'metric-card__value--low': data.soilMoisture !== null && data.soilMoisture < 35,
            'metric-card__value--high': data.soilMoisture !== null && data.soilMoisture > 65
          }]">
            {{ data.soilMoisture !== null ? `${data.soilMoisture.toFixed(0)}%` : 'N/A' }}
          </span>
        </div>
        <div class="metric-card">
          <span class="metric-card__label">ET0</span>
          <span :class="['metric-card__value', { 
            'metric-card__value--high': data.et0 !== null && data.et0 > 5
          }]">
            {{ data.et0 !== null ? `${data.et0.toFixed(1)} mm/d` : 'N/A' }}
          </span>
        </div>
        <div class="metric-card">
          <span class="metric-card__label">Precip. Semana</span>
          <span class="metric-card__value">
            {{ data.precipitationWeek !== null ? `${data.precipitationWeek.toFixed(1)} mm` : 'N/A' }}
          </span>
        </div>
        <div class="metric-card">
          <span class="metric-card__label">Temperatura</span>
          <span :class="['metric-card__value', { 
            'metric-card__value--high': data.temperature !== null && data.temperature > 32
          }]">
            {{ data.temperature !== null ? `${data.temperature.toFixed(0)}°C` : 'N/A' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.irrigation-panel {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.irrigation-panel__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem;
}

.irrigation-panel__icon {
  font-size: 1.25rem;
}

.irrigation-panel__status {
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.irrigation-panel__status--urgent {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.irrigation-panel__status--needed {
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.irrigation-panel__status--optimal {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.irrigation-panel__status--excess {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}

.irrigation-panel__status-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.irrigation-panel__action-icon {
  font-size: 1.5rem;
}

.irrigation-panel__status-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.irrigation-panel__status-title {
  font-weight: 600;
  font-size: 1rem;
  color: #1e293b;
}

.irrigation-panel__recommendation {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
}

.irrigation-panel__subtitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem;
}

.irrigation-panel__metrics {
  margin-bottom: 1.5rem;
}

.irrigation-panel__metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.metric-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
}

.metric-card__label {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.metric-card__value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.metric-card__value--low {
  color: #dc2626;
}

.metric-card__value--high {
  color: #ea580c;
}

.irrigation-panel__conditions {
  margin-bottom: 1.5rem;
}

.irrigation-panel__conditions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.8rem;
  color: #475569;
}

.irrigation-panel__conditions-list li {
  padding: 0.375rem 0;
  padding-left: 1rem;
  position: relative;
}

.irrigation-panel__conditions-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #64748b;
}

.irrigation-panel__formula {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
}

.irrigation-panel__formula-text {
  font-size: 0.8rem;
  color: #475569;
  margin: 0 0 0.5rem;
}

.irrigation-panel__formula-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.irrigation-panel__formula-list li {
  padding: 0.25rem 0;
}

@media (max-width: 640px) {
  .irrigation-panel__metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
