import { computed, watch } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { useWeather } from './use-weather'
import type { Parcel } from '@/types/weather'

export function useParcelLocation() {
  const weatherStore = useWeatherStore()
  const { alerts, fetchWeather, weather, isLoading, error } = useWeather()

  const selectedParcel = computed(() => {
    const parcels = weatherStore.parcels
    const location = weatherStore.userLocation
    
    return parcels.find(p => 
      p.latitude === location.latitude && 
      p.longitude === location.longitude
    ) ?? null
  })

  const locationName = computed(() => weatherStore.userLocation.name)

  const alertsCount = computed(() => alerts.value.length)

  async function selectParcel(parcel: Parcel) {
    const displayName = `${parcel.name} (${parcel.denomination})`
    weatherStore.setLocation(parcel.latitude, parcel.longitude, displayName)
    await fetchWeather(parcel.latitude, parcel.longitude)
  }

  async function initializeParcelLocation() {
    if (weatherStore.isLocationInitialized) return
    
    await weatherStore.loadParcels()
    weatherStore.setLocationInitialized(true)
    
    if (weatherStore.parcels.length > 0) {
      const firstParcel = weatherStore.parcels[0]
      if (firstParcel) {
        const displayName = `${firstParcel.name} (${firstParcel.denomination})`
        weatherStore.setLocation(firstParcel.latitude, firstParcel.longitude, displayName)
        await fetchWeather(firstParcel.latitude, firstParcel.longitude)
      }
    } else {
      const { latitude, longitude } = weatherStore.userLocation
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        await fetchWeather(latitude, longitude)
      }
    }
  }

  watch(
    () => [weatherStore.userLocation.latitude, weatherStore.userLocation.longitude],
    async ([lat, lon]) => {
      if (typeof lat === 'number' && typeof lon === 'number') {
        await fetchWeather(lat, lon)
      }
    },
    { immediate: true }
  )

  return {
    alerts,
    alertsCount,
    weather,
    isLoading,
    error,
    selectedParcel,
    locationName,
    selectParcel,
    initializeParcelLocation,
  }
}
