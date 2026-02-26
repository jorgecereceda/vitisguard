import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Parcel, WeatherData, WeatherOptions } from '@/types/weather'
import { fetchWeatherData } from '@/services/weather-api'
import * as plotApi from '@/services/plot-api'
import { useAuthStore } from './auth'

export const useWeatherStore = defineStore('weather', () => {
  const parcels = ref<Parcel[]>([])
  const weatherByParcel = ref<Map<string, WeatherData>>(new Map())
  const selectedParcelId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const selectedParcel = computed(() =>
    parcels.value.find(p => p.id === selectedParcelId.value) ?? null
  )

  const currentWeather = computed(() =>
    selectedParcelId.value
      ? weatherByParcel.value.get(selectedParcelId.value) ?? null
      : null
  )

  const hasParcels = computed(() => parcels.value.length > 0)

  async function loadParcels(): Promise<void> {
    const authStore = useAuthStore()
    const userId = authStore.user?.id

    if (!userId) {
      error.value = new Error('User not authenticated')
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await plotApi.getPlotsByUserId(userId)
      parcels.value = data

      if (data.length > 0 && !selectedParcelId.value) {
        selectedParcelId.value = data[0]?.id ?? null
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to load parcels')
    } finally {
      isLoading.value = false
    }
  }

  async function addParcel(parcel: Omit<Parcel, 'id'>): Promise<Parcel | null> {
    isLoading.value = true
    error.value = null

    const authStore = useAuthStore()
    const userId = authStore.user?.id

    if (!userId) {
      error.value = new Error('User not authenticated')
      isLoading.value = false
      return null
    }

    try {
      const newParcel = await plotApi.createPlot({ ...parcel, userId })
      parcels.value.push(newParcel)

      if (!selectedParcelId.value) {
        selectedParcelId.value = newParcel.id
      }

      return newParcel
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to create parcel')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function removeParcel(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await plotApi.deletePlot(id)

      parcels.value = parcels.value.filter(p => p.id !== id)
      weatherByParcel.value.delete(id)

      if (selectedParcelId.value === id) {
        selectedParcelId.value = parcels.value[0]?.id ?? null
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to delete parcel')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateParcel(
    id: string,
    updates: Partial<Omit<Parcel, 'id'>>
  ): Promise<Parcel | null> {
    isLoading.value = true
    error.value = null

    try {
      const updatedParcel = await plotApi.updatePlot(id, updates)

      const index = parcels.value.findIndex(p => p.id === id)
      if (index !== -1) {
        parcels.value[index] = updatedParcel
      }

      return updatedParcel
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to update parcel')
      return null
    } finally {
      isLoading.value = false
    }
  }

  function selectParcel(id: string): void {
    if (parcels.value.some(p => p.id === id)) {
      selectedParcelId.value = id
    }
  }

  async function loadWeatherForParcel(
    parcelId: string,
    options?: WeatherOptions
  ): Promise<WeatherData | null> {
    const parcel = parcels.value.find(p => p.id === parcelId)
    if (!parcel) {
      error.value = new Error('Parcel not found')
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await fetchWeatherData(
        { latitude: parcel.latitude, longitude: parcel.longitude },
        options
      )
      weatherByParcel.value.set(parcelId, data)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function loadAllParcels(options?: WeatherOptions): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await Promise.all(
        parcels.value.map(async parcel => {
          const data = await fetchWeatherData(
            { latitude: parcel.latitude, longitude: parcel.longitude },
            options
          )
          weatherByParcel.value.set(parcel.id, data)
        })
      )
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error')
    } finally {
      isLoading.value = false
    }
  }

  async function refreshCurrentParcel(options?: WeatherOptions): Promise<void> {
    if (selectedParcelId.value) {
      await loadWeatherForParcel(selectedParcelId.value, options)
    }
  }

  function clearError(): void {
    error.value = null
  }

  function clearAllData(): void {
    weatherByParcel.value.clear()
    selectedParcelId.value = null
    error.value = null
  }

  return {
    parcels,
    weatherByParcel,
    selectedParcelId,
    selectedParcel,
    currentWeather,
    hasParcels,
    isLoading,
    error,
    loadParcels,
    addParcel,
    removeParcel,
    updateParcel,
    selectParcel,
    loadWeatherForParcel,
    loadAllParcels,
    refreshCurrentParcel,
    clearError,
    clearAllData,
  }
})
