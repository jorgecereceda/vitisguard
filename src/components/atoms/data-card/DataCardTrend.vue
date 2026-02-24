<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction: 'up' | 'down' | 'stable'
  label?: string
}

const props = defineProps<Props>()

const icon = computed(() => {
  switch (props.direction) {
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    default:
      return '→'
  }
})
</script>

<template>
  <div :class="['data-card-trend', `data-card-trend--${direction}`]">
    <span class="data-card-trend__icon">{{ icon }}</span>
    <span v-if="label" class="data-card-trend__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.data-card-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.data-card-trend--up {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success, #22c55e);
}

.data-card-trend--down {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger, #ef4444);
}

.data-card-trend--stable {
  background-color: rgba(107, 114, 128, 0.1);
  color: var(--color-text-secondary, #6b7280);
}

.data-card-trend__icon {
  font-size: 14px;
}
</style>
