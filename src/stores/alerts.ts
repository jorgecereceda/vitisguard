import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Alert, AlertStats } from '@/types/alert'
import {
  getAlerts,
  getAlertStats,
  deleteAlert,
  deleteAllAlerts,
  createAlert,
  generateHistoricalAlertsForUser
} from '@/services/alert-api'

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

  function calculateStatsLocally(period: string): AlertStats {
    const now = new Date()
    const startDate = new Date()

    if (period === '30d') {
      startDate.setDate(now.getDate() - 30)
    } else if (period === '6m') {
      startDate.setMonth(now.getMonth() - 6)
    } else if (period === '1y') {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    const filteredAlerts = alerts.value.filter((alert) => {
      const alertDate = new Date(alert.detectedAt)
      return alertDate >= startDate && alertDate <= now
    })

    const initialStats: AlertStats = {
      id: `local-${period}`,
      period,
      diseaseAlerts: 0,
      weatherAlerts: 0,
      irrigationAlerts: 0,
      mildiu: 0,
      botrytis: 0,
      oidio: 0,
      excoriosis: 0,
      frosts: 0,
      lateFrosts: 0,
      heatwaves: 0,
      droughts: 0,
      excessiveRain: 0
    }

    return filteredAlerts.reduce((acc, alert) => {
      if (alert.category === 'disease') {
        acc.diseaseAlerts++
        const disease = alert.disease as keyof AlertStats
        if (Object.prototype.hasOwnProperty.call(acc, disease)) {
          ; (acc[disease] as number)++
        }
      } else if (alert.category === 'weather') {
        acc.weatherAlerts++
        const typeMap: Record<string, keyof AlertStats> = {
          frost: 'frosts',
          lateFrost: 'lateFrosts',
          heatwave: 'heatwaves',
          drought: 'droughts',
          excessiveRain: 'excessiveRain'
        }
        const key = typeMap[alert.type]
        if (key && Object.prototype.hasOwnProperty.call(acc, key)) {
          ; (acc[key] as number)++
        }
      } else if (alert.category === 'irrigation') {
        acc.irrigationAlerts++
      }
      return acc
    }, initialStats)
  }

  async function fetchStatsByPeriod(period: string) {
    isLoading.value = true
    error.value = null
    try {
      // En lugar de fetch, calculamos localmente para mayor precisión con datos simulados
      currentStats.value = calculateStatsLocally(period)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to calculate stats'
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

  async function generateHistoricalAlerts(
    userId: string,
    startDate: string,
    endDate: string,
    year: number
  ) {
    isLoading.value = true
    error.value = null
    try {
      const generatedAlerts = await generateHistoricalAlertsForUser(
        userId,
        startDate,
        endDate,
        year
      )
      return generatedAlerts
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate historical alerts'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function clearAllAlerts() {
    isLoading.value = true
    error.value = null
    try {
      await deleteAllAlerts()
      alerts.value = []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to clear alerts'
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
    clearAllAlerts,
    clearError
  }
})
