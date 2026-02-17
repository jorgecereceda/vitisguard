<script setup lang="ts">
import { computed } from 'vue'
import type { AnyRecommendation } from '@/types/disease'
import { BaseBadge } from '@/components/atoms/base-badge'

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
        ⚠️ Alertas Activas
        <span class="alert-panel__count">({{ recommendations.length }})</span>
      </h3>
    </div>

    <div v-if="recommendations.length === 0" class="alert-panel__empty">
      No hay alertas activas
    </div>

    <ul v-else class="alert-panel__list">
      <li
        v-for="rec in displayedRecommendations"
        :key="rec.id"
        :class="['alert-panel__item', `alert-panel__item--${rec.level}`]"
      >
        <div class="alert-panel__item-header">
          <span class="alert-panel__icon">{{ categoryIcon(rec.category) }}</span>
          <span class="alert-panel__item-title">
            {{ rec.category === 'disease' ? rec.disease.toUpperCase() : ('title' in rec ? rec.title : 'Alerta') }}
          </span>
          <BaseBadge :variant="levelVariant(rec.level)" size="sm">
            {{ rec.level.toUpperCase() }}
          </BaseBadge>
        </div>

        <p v-if="'description' in rec" class="alert-panel__description">
          {{ rec.description }}
        </p>

        <p class="alert-panel__recommendation">
          {{ rec.recommendation }}
        </p>

        <button
          v-if="$attrs.onDismiss"
          class="alert-panel__dismiss"
          @click="emit('dismiss', rec.id)"
        >
          ✕
        </button>
      </li>
    </ul>

    <div v-if="recommendations.length > maxItems" class="alert-panel__more">
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
  margin-bottom: 12px;
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
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted, #9ca3af);
}

.alert-panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.alert-panel__item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  position: relative;
  border-left: 4px solid;
}

.alert-panel__item:last-child {
  margin-bottom: 0;
}

.alert-panel__item--critical {
  background-color: rgba(239, 68, 68, 0.08);
  border-left-color: var(--color-danger, #ef4444);
}

.alert-panel__item--high {
  background-color: rgba(245, 158, 11, 0.08);
  border-left-color: var(--color-warning, #f59e0b);
}

.alert-panel__item--medium {
  background-color: rgba(14, 165, 233, 0.08);
  border-left-color: var(--color-info, #0ea5e9);
}

.alert-panel__item--low {
  background-color: rgba(107, 114, 128, 0.08);
  border-left-color: var(--color-text-muted, #9ca3af);
}

.alert-panel__item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.alert-panel__icon {
  font-size: 16px;
}

.alert-panel__item-title {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
}

.alert-panel__description {
  margin: 4px 0;
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
}

.alert-panel__recommendation {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--color-text-primary, #111827);
  line-height: 1.4;
}

.alert-panel__dismiss {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted, #9ca3af);
  font-size: 12px;
  padding: 4px;
  line-height: 1;
}

.alert-panel__dismiss:hover {
  color: var(--color-text-primary, #111827);
}

.alert-panel__more {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
}
</style>
