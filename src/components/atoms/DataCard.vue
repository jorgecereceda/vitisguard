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
  background: #6b7280; /* Consistent slate-500/grey background */
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

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  background: #4b5563; /* Darken slightly on hover */
}

.data-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.data-card__icon {
  font-size: 1.25rem;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
}

.data-card__label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #d1d5db; /* Light grey text for label */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-card__body {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.data-card__value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
}

.data-card__unit {
  font-size: 1.1rem;
  font-weight: 600;
  color: #9ca3af; /* Clear, visible grey for units */
  opacity: 1; /* Ensure no transparency issues */
}

</style>
