import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Parcel, WeatherData, WeatherOptions } from '@/types/weather'
import { fetchWeatherData } from '@/services/weather-api'

const STORAGE_KEY = 'vitisguard_parcels'

function loadParcelsFromStorage(): Parcel[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveParcelsToStorage(parcels: Parcel[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels))
}

export const useWeatherStore = defineStore('weather', () => {
  const parcels = ref<Parcel[]>(loadParcelsFromStorage())
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

  function addParcel(parcel: Parcel): void {
    if (parcels.value.some(p => p.id === parcel.id)) {
      return
    }
    parcels.value.push(parcel)
    saveParcelsToStorage(parcels.value)
  }

  function removeParcel(id: string): void {
    parcels.value = parcels.value.filter(p => p.id !== id)
    weatherByParcel.value.delete(id)
    saveParcelsToStorage(parcels.value)

    if (selectedParcelId.value === id) {
      selectedParcelId.value = parcels.value[0]?.id ?? null
    }
  }

  function updateParcel(id: string, updates: Partial<Omit<Parcel, 'id'>>): void {
    const index = parcels.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const current = parcels.value[index]
      if (!current) return
      parcels.value[index] = {
        id: current.id,
        name: updates.name ?? current.name,
        latitude: updates.latitude ?? current.latitude,
        longitude: updates.longitude ?? current.longitude,
      }
      saveParcelsToStorage(parcels.value)
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

  if (parcels.value.length > 0 && !selectedParcelId.value) {
    const firstParcel = parcels.value[0]
    if (firstParcel) {
      selectedParcelId.value = firstParcel.id
    }
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
