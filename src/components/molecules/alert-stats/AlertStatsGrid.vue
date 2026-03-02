<script setup lang="ts">
import type { AlertStats } from '@/types/alert'
import AlertStatCard from './AlertStatCard.vue'

interface Props {
  stats: AlertStats | null
}

defineProps<Props>()
</script>

<template>
  <div class="alert-stats-grid">
    <AlertStatCard :stats="stats" category="disease" />
    <AlertStatCard :stats="stats" category="weather" />
    <AlertStatCard :stats="stats" category="irrigation" />
  </div>
</template>

<style scoped>
.alert-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
</style>
