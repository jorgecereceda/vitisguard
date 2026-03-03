<script setup lang="ts">
import type { Alert, AlertCategory, RiskLevel } from '@/types/alert'
import { BaseBadge } from '@/components/atoms/base-badge'

interface Props {
  alert: Alert
}

const props = defineProps<Props>()

const categoryIcons: Record<AlertCategory, string> = {
  disease: '🦠',
  weather: '🌤️',
  irrigation: '💧'
}

const categoryLabels: Record<AlertCategory, string> = {
  disease: 'Enfermedad',
  weather: 'Clima',
  irrigation: 'Riego'
}

const levelVariants: Record<RiskLevel, 'success' | 'warning' | 'danger' | 'normal'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger'
}

const levelLabels: Record<RiskLevel, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getAlertTitle(alert: Alert): string {
  if (alert.category === 'disease') {
    const diseaseNames: Record<string, string> = {
      mildiu: 'Mildiú',
      botrytis: 'Botrytis',
      oidio: 'Oídio',
      excoriosis: 'Excoriosis'
    }
    return `Alerta de ${diseaseNames[alert.disease] || alert.disease}`
  }
  if (alert.category === 'weather') {
    return alert.title
  }
  return 'Alerta de Riego'
}

function getAlertDescription(alert: Alert): string {
  if (alert.category === 'disease') {
    return `Probabilidad: ${alert.probability}%`
  }
  if (alert.category === 'weather') {
    return alert.description
  }
  return alert.reason
}
</script>

<template>
  <div class="alert-history-item">
    <div class="alert-history-item__header">
      <span class="alert-history-item__icon">{{ categoryIcons[alert.category] }}</span>
      <span class="alert-history-item__category">{{ categoryLabels[alert.category] }}</span>
      <BaseBadge :variant="levelVariants[alert.level]" size="sm">
        {{ levelLabels[alert.level] }}
      </BaseBadge>
    </div>
    <h3 class="alert-history-item__title">{{ getAlertTitle(alert) }}</h3>
    <p class="alert-history-item__description">{{ getAlertDescription(alert) }}</p>
    <div class="alert-history-item__footer">
      <span class="alert-history-item__date">Detectado: {{ formatDate(alert.detectedAt) }}</span>
      <span v-if="alert.completed" class="alert-history-item__completed">
        ✓ Resuelto
      </span>
    </div>
    <p v-if="alert.recommendation" class="alert-history-item__recommendation">
      <strong>Recomendación:</strong> {{ alert.recommendation }}
    </p>
  </div>
</template>

<style scoped>
.alert-history-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.alert-history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.alert-history-item__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-history-item__icon {
  font-size: 1.25rem;
}

.alert-history-item__category {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex: 1;
}

.alert-history-item__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.alert-history-item__description {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.alert-history-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.alert-history-item__completed {
  color: #16a34a;
  font-weight: 500;
}

.alert-history-item__recommendation {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #374151;
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 6px;
}
</style>
