<script setup lang="ts">
interface Props {
  unit: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <span class="data-card-unit" :title="description">
    {{ unit }}
  </span>
</template>

<style scoped>
.data-card-unit {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
  margin-left: 4px;
}
</style>
