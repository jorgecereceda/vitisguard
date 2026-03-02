<script setup lang="ts">
import type { AlertStats } from '@/types/alert'
import StatCard from '@/components/atoms/StatCard.vue'

interface Props {
  stats: AlertStats | null
  category: 'disease' | 'weather' | 'irrigation'
}

const props = defineProps<Props>()

const categoryConfig = {
  disease: {
    label: 'Alertas de Enfermedades',
    icon: '🦠',
    totalKey: 'diseaseAlerts' as const,
    subKeys: ['mildiu', 'botrytis', 'oidio', 'excoriosis'] as const
  },
  weather: {
    label: 'Alertas Climáticas',
    icon: '🌤️',
    totalKey: 'weatherAlerts' as const,
    subKeys: ['frosts', 'lateFrosts', 'heatwaves', 'droughts', 'excessiveRain'] as const
  },
  irrigation: {
    label: 'Alertas de Riego',
    icon: '💧',
    totalKey: 'irrigationAlerts' as const,
    subKeys: [] as const
  }
}

const config = categoryConfig[props.category]

function getTotal(stats: AlertStats | null): number {
  if (!stats) return 0
  return stats[config.totalKey] as number
}

function getVariant(total: number): 'normal' | 'warning' | 'danger' {
  if (total === 0) return 'normal'
  if (total <= 5) return 'warning'
  return 'danger'
}

function getSubStats(stats: AlertStats | null): { key: string; value: number }[] {
  if (!stats) return []
  return config.subKeys
    .map((key) => ({ key, value: (stats[key as keyof AlertStats] as number) || 0 }))
    .filter((item) => item.value > 0)
}
</script>

<template>
  <div class="alert-stat-card">
    <StatCard
      :label="config.label"
      :value="getTotal(stats)"
      :icon="config.icon"
      :variant="getVariant(getTotal(stats))"
    />
    <div v-if="getSubStats(stats).length > 0" class="alert-stat-card__details">
      <div
        v-for="sub in getSubStats(stats)"
        :key="sub.key"
        class="alert-stat-card__detail"
      >
        <span class="alert-stat-card__detail-key">{{ sub.key }}</span>
        <span class="alert-stat-card__detail-value">{{ sub.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-stat-card__details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.alert-stat-card__detail {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.alert-stat-card__detail-key {
  color: #d1d5db;
  text-transform: capitalize;
}

.alert-stat-card__detail-value {
  color: #ffffff;
  font-weight: 600;
}
</style>
