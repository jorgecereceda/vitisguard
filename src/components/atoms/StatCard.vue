<script setup lang="ts">
interface Props {
  label: string
  value: number | string
  icon?: string
  variant?: 'normal' | 'warning' | 'danger'
}

withDefaults(defineProps<Props>(), {
  variant: 'normal'
})
</script>

<template>
  <div class="stat-card" :class="`stat-card--${variant}`">
    <div class="stat-card__header">
      <span v-if="icon" class="stat-card__icon">{{ icon }}</span>
      <h3 class="stat-card__label">{{ label }}</h3>
    </div>
    <div class="stat-card__body">
      <span class="stat-card__value">{{ value }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: #6b7280;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: white;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.stat-card--normal {
  background: #6b7280;
}

.stat-card--warning {
  background: #d97706;
}

.stat-card--danger {
  background: #dc2626;
}

.stat-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-card__icon {
  font-size: 1.25rem;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
}

.stat-card__label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #d1d5db;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-card__body {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.stat-card__value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
}
</style>
