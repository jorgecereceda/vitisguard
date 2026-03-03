import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Alert, AlertStats } from '@/types/alert'
import {
  getAlerts,
  getAlertStats,
  getAlertStatsByPeriod,
  deleteAlert,
  createAlert,
  generateHistoricalAlertsForUser
} from '@/services/alert-api'
import type { HistoricalAlertOptions } from '@/types/alert'

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref<Alert[]>([])
  const stats = ref<AlertStats[]>([])
  const currentStats = ref<AlertStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAlerts() {
    isLoading.value = true
    error.value = null
    try {
      alerts.value = await getAlerts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch alerts'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStats() {
    isLoading.value = true
    error.value = null
    try {
      stats.value = await getAlertStats()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch stats'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStatsByPeriod(period: string) {
    isLoading.value = true
    error.value = null
    try {
      currentStats.value = await getAlertStatsByPeriod(period)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch stats'
    } finally {
      isLoading.value = false
    }
  }

  async function removeAlert(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await deleteAlert(id)
      alerts.value = alerts.value.filter((a) => a.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete alert'
    } finally {
      isLoading.value = false
    }
  }

  async function addAlert(alert: Omit<Alert, 'id'>) {
    isLoading.value = true
    error.value = null
    try {
      const created = await createAlert(alert)
      alerts.value.push(created)
      return created
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create alert'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function generateHistoricalAlerts(userId: string, options: HistoricalAlertOptions) {
    isLoading.value = true
    error.value = null
    try {
      const generatedAlerts = await generateHistoricalAlertsForUser(userId, options)
      return generatedAlerts
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate historical alerts'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    alerts,
    stats,
    currentStats,
    isLoading,
    error,
    fetchAlerts,
    fetchStats,
    fetchStatsByPeriod,
    removeAlert,
    addAlert,
    generateHistoricalAlerts,
    clearError
  }
})
