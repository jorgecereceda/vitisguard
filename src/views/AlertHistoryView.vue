<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'
import {
  getAlertLog,
  createAlertLog,
  updateAlertLog,
  shouldRefresh,
  calculateHistoricalDateRange
} from '@/services/alert-log-api'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import AlertStatsSection from '@/components/organisms/alert-stats/AlertStatsSection.vue'
import AlertHistoryList from '@/components/molecules/alert-history/AlertHistoryList.vue'

const alertsStore = useAlertsStore()
const authStore = useAuthStore()
const isRefreshing = ref(false)
const lastQueryInfo = ref<string>('')

async function checkAndRefreshAlerts() {
  const alertLog = await getAlertLog()

  if (!alertLog) {
    await generateNewAlerts()
    return
  }

  if (shouldRefresh(alertLog.lastQueryDate)) {
    await generateNewAlerts()
    return
  }

  const lastDate = new Date(alertLog.lastQueryDate)
  lastQueryInfo.value = `Última actualización: ${lastDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`
}

async function generateNewAlerts() {
  isRefreshing.value = true

  try {
    const { startDate, endDate, year } = calculateHistoricalDateRange()
    const userId = authStore.user?.id

    if (!userId) {
      alertsStore.error = 'Usuario no autenticado'
      return
    }

    await alertsStore.clearAllAlerts()

    await alertsStore.generateHistoricalAlerts(userId, startDate, endDate, year)

    const existingLog = await getAlertLog()
    if (existingLog) {
      await updateAlertLog(year)
    } else {
      await createAlertLog(year)
    }

    lastQueryInfo.value = `Actualizado: ${new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`
  } catch (e) {
    console.error('Error al generar alertas históricas:', e)
  } finally {
    isRefreshing.value = false
  }
}

async function handleRefresh() {
  await generateNewAlerts()
  await alertsStore.fetchAlerts()
}

onMounted(async () => {
  await alertsStore.fetchAlerts()
  await checkAndRefreshAlerts()
})
</script>

<template>
  <PannelLauyout>
    <div class="alert-history-view">
      <AlertStatsSection />
      <section class="alert-history-view__list">
        <div class="alert-history-view__header">
          <h2 class="alert-history-view__title">Historial de Alertas</h2>
          <div class="alert-history-view__actions">
            <span v-if="lastQueryInfo" class="alert-history-view__info">
              {{ lastQueryInfo }}
            </span>
            <button
              class="alert-history-view__refresh"
              :disabled="isRefreshing"
              @click="handleRefresh"
            >
              {{ isRefreshing ? 'Actualizando...' : 'Actualizar' }}
            </button>
          </div>
        </div>
        <AlertHistoryList
          :alerts="alertsStore.alerts"
          :loading="alertsStore.isLoading || isRefreshing"
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

.alert-history-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.alert-history-view__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.alert-history-view__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-history-view__info {
  font-size: 0.875rem;
  color: #6b7280;
}

.alert-history-view__refresh {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.alert-history-view__refresh:hover:not(:disabled) {
  background-color: #2563eb;
}

.alert-history-view__refresh:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
