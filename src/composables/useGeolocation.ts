import { ref, onMounted } from 'vue'

export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  isLoading: boolean
}

export function useGeolocation() {
  const state = ref<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true
  })

  const onSuccess = (position: GeolocationPosition) => {
    state.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      error: null,
      isLoading: false
    }
  }

  const onError = (error: GeolocationPositionError) => {
    state.value = {
      ...state.value,
      error: error.message,
      isLoading: false
    }
  }

  const getLocation = () => {
    state.value.isLoading = true
    if (!navigator.geolocation) {
      state.value.error = 'Geolocation is not supported by your browser'
      state.value.isLoading = false
      return
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    })
  }

  onMounted(() => {
    getLocation()
  })

  return {
    state,
    getLocation
  }
}
