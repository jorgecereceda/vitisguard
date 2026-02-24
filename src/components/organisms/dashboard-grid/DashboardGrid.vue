<script setup lang="ts">
interface Props {
  columns?: number
  gap?: string
}

withDefaults(defineProps<Props>(), {
  columns: 3,
  gap: '16px',
})
</script>

<template>
  <div :class="['dashboard-grid']" :style="{ '--grid-columns': columns, '--grid-gap': gap }">
    <slot></slot>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 3), 1fr);
  gap: var(--grid-gap, 16px);
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
