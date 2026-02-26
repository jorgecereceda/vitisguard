<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AnyRecommendation } from '@/types/disease'
import { BaseBadge } from '@/components/atoms/base-badge'

type TabType = 'alerts' | 'treatments'

interface Props {
  recommendations: AnyRecommendation[]
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 10,
})

const emit = defineEmits<{
  dismiss: [id: string]
}>()

const activeTab = ref<TabType>('alerts')

const getDescription = (rec: AnyRecommendation): string => {
  if ('description' in rec) {
    return rec.description
  }
  if ('conditions' in rec) {
    return rec.conditions.join(', ')
  }
  if ('reason' in rec) {
    return rec.reason
  }
  return ''
}

const getTitle = (rec: AnyRecommendation): string => {
  if ('disease' in rec) {
    return rec.disease.toUpperCase()
  }
  if ('title' in rec) {
    return rec.title
  }
  return 'Alerta'
}

const formatDate = (date: Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) {
    return `Hace ${diffMins} min`
  }
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `Hace ${diffHours} h`
  }
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays} días`
}

const levelVariant = (level: string) => {
  switch (level) {
    case 'critical':
      return 'danger'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    default:
      return 'normal'
  }
}

const categoryIcon = (category: string) => {
  switch (category) {
    case 'disease':
      return '🦠'
    case 'weather':
      return '🌧️'
    case 'irrigation':
      return '💧'
    default:
      return '⚠️'
  }
}

const displayedRecommendations = computed(() => 
  props.recommendations.slice(0, props.maxItems)
)
</script>

<template>
  <div class="alert-panel">
    <div class="alert-panel__header">
      <h3 class="alert-panel__title">
        ⚠️ Alertas y Tratamientos
      </h3>
    </div>

    <div class="alert-panel__tabs">
      <button
        :class="['alert-panel__tab', { 'alert-panel__tab--active': activeTab === 'alerts' }]"
        @click="activeTab = 'alerts'"
      >
        📢 Alertas
        <span class="alert-panel__tab-count">({{ recommendations.length }})</span>
      </button>
      <button
        :class="['alert-panel__tab', { 'alert-panel__tab--active': activeTab === 'treatments' }]"
        @click="activeTab = 'treatments'"
      >
        📋 Tratamientos
      </button>
    </div>

    <div v-if="activeTab === 'alerts'" class="alert-panel__content">
      <div v-if="recommendations.length === 0" class="alert-panel__empty">
        No hay alertas activas
      </div>

      <div v-else class="alert-panel__cards">
      <div
        v-for="rec in displayedRecommendations"
        :key="rec.id"
        :class="['alert-card', `alert-card--${rec.level}`]"
      >
        <div class="alert-card__header">
          <span class="alert-card__icon">{{ categoryIcon(rec.category) }}</span>
          <span class="alert-card__title">{{ getTitle(rec) }}</span>
          <BaseBadge :variant="levelVariant(rec.level)" size="sm">
            {{ rec.level.toUpperCase() }}
          </BaseBadge>
        </div>

        <p v-if="getDescription(rec)" class="alert-card__description">
          {{ getDescription(rec) }}
        </p>

        <p class="alert-card__recommendation">
          {{ rec.recommendation }}
        </p>

        <div class="alert-card__footer">
          <span class="alert-card__time">{{ formatDate(rec.detectedAt) }}</span>
          <button
            v-if="$attrs.onDismiss"
            class="alert-card__dismiss"
            @click="emit('dismiss', rec.id)"
          >
            ✕ Dismiss
          </button>
        </div>
      </div>
    </div>
    </div>

    <div v-if="recommendations.length > maxItems && activeTab === 'alerts'" class="alert-panel__more">
      +{{ recommendations.length - maxItems }} más
    </div>
  </div>
</template>

<style scoped>
.alert-panel {
  background-color: var(--color-surface, #ffffff);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.alert-panel__header {
  margin-bottom: 16px;
}

.alert-panel__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.alert-panel__count {
  font-weight: 400;
  color: var(--color-text-secondary, #6b7280);
}

.alert-panel__empty {
  padding: 32px 20px;
  text-align: center;
  color: var(--color-text-muted, #9ca3af);
  background-color: var(--color-bg-secondary, #f9fafb);
  border-radius: 8px;
}

.alert-panel__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-card {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid;
  border-left-width: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.alert-card:last-child {
  margin-bottom: 0;
}

.alert-card--critical {
  background-color: #fef2f2;
  border-color: #fecaca;
  border-left-color: var(--color-danger, #ef4444);
}

.alert-card--high {
  background-color: #fffbeb;
  border-color: #fde68a;
  border-left-color: var(--color-warning, #f59e0b);
}

.alert-card--medium {
  background-color: #f0f9ff;
  border-color: #bae6fd;
  border-left-color: var(--color-info, #0ea5e9);
}

.alert-card--low {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  border-left-color: var(--color-text-muted, #9ca3af);
}

.alert-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.alert-card__icon {
  font-size: 18px;
}

.alert-card__title {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
}

.alert-card__description {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.5;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 8px;
  border-radius: 6px;
}

.alert-card__recommendation {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-primary, #111827);
  line-height: 1.5;
  font-weight: 500;
}

.alert-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.alert-card__time {
  font-size: 11px;
  color: var(--color-text-muted, #9ca3af);
}

.alert-card__dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted, #9ca3af);
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.alert-card__dismiss:hover {
  color: var(--color-text-primary, #111827);
  background-color: rgba(0, 0, 0, 0.05);
}

.alert-panel__more {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
}

.alert-panel__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  padding-bottom: 12px;
}

.alert-panel__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;
}

.alert-panel__tab:hover {
  background-color: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
}

.alert-panel__tab--active {
  background-color: var(--color-primary-light, #eff6ff);
  color: var(--color-primary, #3b82f6);
}

.alert-panel__tab-count {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.7;
}

.alert-panel__content {
  min-height: 200px;
}
</style>
