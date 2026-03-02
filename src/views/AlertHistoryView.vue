<script setup lang="ts">
import { onMounted } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import AlertStatsSection from '@/components/organisms/alert-stats/AlertStatsSection.vue'
import AlertHistoryList from '@/components/molecules/alert-history/AlertHistoryList.vue'

const alertsStore = useAlertsStore()

onMounted(() => {
  alertsStore.fetchAlerts()
})

function handleRefresh() {
  alertsStore.fetchAlerts()
}
</script>

<template>
  <PannelLauyout>
    <div class="alert-history-view">
      <AlertStatsSection />
      <section class="alert-history-view__list">
        <h2 class="alert-history-view__title">Historial de Alertas</h2>
        <AlertHistoryList
          :alerts="alertsStore.alerts"
          :loading="alertsStore.isLoading"
          :error="alertsStore.error"
          @refresh="handleRefresh"
        />
      </section>
    </div>
  </PannelLauyout>
</template>

<style scoped>
.alert-history-view {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.alert-history-view__list {
  margin-top: 2rem;
}

.alert-history-view__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem;
}
</style>
