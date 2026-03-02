<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import AlertStatsGrid from '@/components/molecules/alert-stats/AlertStatsGrid.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'

const alertsStore = useAlertsStore()

const periods = [
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 6 meses', value: '6m' },
  { label: 'Último año', value: '1y' }
]

const selectedPeriod = ref('30d')

async function loadStats(period: string) {
  await alertsStore.fetchStatsByPeriod(period)
}

onMounted(() => {
  loadStats(selectedPeriod.value)
})

watch(selectedPeriod, (newPeriod) => {
  loadStats(newPeriod)
})
</script>

<template>
  <section class="alert-stats-section">
    <div class="alert-stats-section__header">
      <h2 class="alert-stats-section__title">Estadísticas Históricas</h2>
      <BaseSelect
        id="period-select"
        name="period"
        v-model="selectedPeriod"
        :options="periods"
        :disabled="alertsStore.isLoading"
      />
    </div>
    <div v-if="alertsStore.isLoading" class="alert-stats-section__loading">
      Cargando estadísticas...
    </div>
    <div v-else-if="alertsStore.error" class="alert-stats-section__error">
      {{ alertsStore.error }}
    </div>
    <AlertStatsGrid v-else :stats="alertsStore.currentStats" />
  </section>
</template>

<style scoped>
.alert-stats-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.alert-stats-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.alert-stats-section__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.alert-stats-section__loading,
.alert-stats-section__error {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.alert-stats-section__error {
  color: #dc2626;
}
</style>
