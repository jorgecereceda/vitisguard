<script setup lang="ts">
/**
 * DataCard.vue - Atomic Component (Atom)
 * Displays a single weather metric with a label and value.
 * Following BEM methodology for styling.
 */
interface Props {
  label: string
  value: string | number
  unit?: string
  icon?: string
}

defineProps<Props>()
</script>

<template>
  <div class="data-card">
    <div class="data-card__header">
      <span v-if="icon" class="data-card__icon">{{ icon }}</span>
      <h3 class="data-card__label">{{ label }}</h3>
    </div>
    <div class="data-card__body">
      <span class="data-card__value">{{ value }}</span>
      <span v-if="unit" class="data-card__unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.data-card {
  background: rgba(235, 11, 11, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.data-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.data-card__icon {
  font-size: 1.2rem;
}

.data-card__label {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-card__body {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.data-card__value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.data-card__unit {
  font-size: 1rem;
  color: #7f8c8d;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .data-card {
    background: rgba(30, 30, 30, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .data-card__label {
    color: #aaa;
  }
  .data-card__value {
    color: #ecf0f1;
  }
}
</style>
