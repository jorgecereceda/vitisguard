<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { searchAddress, reverseGeocode, parseCoordinates, type GeocodingResult } from '@/services/geocoding'
import { useGeolocation } from '@/composables/useGeolocation'

const weatherStore = useWeatherStore()
const { state: geoState, getLocation } = useGeolocation()

const isOpen = ref(false)
const searchQuery = ref('')
const results = ref<GeocodingResult[]>([])
const isSearching = ref(false)
const selectorRef = ref<HTMLElement | null>(null)
const coordResult = ref<{ lat: number; lon: number } | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleSearch = async () => {
  coordResult.value = parseCoordinates(searchQuery.value)

  if (searchQuery.value.length < 3) {
    results.value = []
    return
  }
  isSearching.value = true
  results.value = await searchAddress(searchQuery.value)
  isSearching.value = false
}

const selectCoordinateLocation = () => {
  if (coordResult.value) {
    weatherStore.setLocation(
      coordResult.value.lat,
      coordResult.value.lon,
      `${coordResult.value.lat.toFixed(4)}, ${coordResult.value.lon.toFixed(4)}`
    )
    isOpen.value = false
    searchQuery.value = ''
    coordResult.value = null
  }
}

const selectLocation = (result: GeocodingResult) => {
  weatherStore.setLocation(result.latitude, result.longitude, result.name)
  isOpen.value = false
  searchQuery.value = ''
  results.value = []
  coordResult.value = null
}

const useMyGeolocation = async () => {
  getLocation()
  // Wait for geoState to update
  const stopWatch = () => {
    if (!geoState.value.isLoading) {
      if (geoState.value.latitude !== null && geoState.value.longitude !== null) {
        reverseGeocode(geoState.value.latitude, geoState.value.longitude).then((name) => {
           // Extract city name if possible
           const cityName = name.split(',')[0]
           weatherStore.setLocation(geoState.value.latitude!, geoState.value.longitude!, cityName!)
        })
      }
      isOpen.value = false
      return true
    }
    return false
  }

  const interval = setInterval(() => {
    if (stopWatch()) clearInterval(interval)
  }, 500)
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="location-selector" ref="selectorRef">
    <div class="location-selector__trigger" @click="toggleDropdown">
      <div class="location-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <span class="location-text">{{ weatherStore.userLocation.name }}</span>
      <span class="location-arrow" :class="{ 'location-arrow--open': isOpen }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </span>
    </div>

    <div v-if="isOpen" class="location-selector__dropdown">
      <div class="location-selector__search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar ubicación o coordenadas..."
          class="search-input"
          @input="handleSearch"
        />
        <div v-if="isSearching" class="search-loader"></div>
      </div>

      <div class="location-selector__content">
        <!-- Coordinate result -->
        <div v-if="coordResult" class="location-selector__group">
          <h4 class="group-title">Coordenadas detectadas</h4>
          <div class="result-item result-item--highlight" @click="selectCoordinateLocation">
            <div class="result-icon">📍</div>
            <div class="result-info">
              <span class="result-name">Usar coordenadas</span>
              <span class="result-full">{{ coordResult.lat }}, {{ coordResult.lon }}</span>
            </div>
          </div>
        </div>

        <!-- Address results -->
        <div v-if="results.length > 0" class="location-selector__group">
          <h4 class="group-title">Direcciones</h4>
          <div class="location-selector__results">
            <div
              v-for="result in results"
              :key="result.displayName"
              class="result-item"
              @click="selectLocation(result)"
            >
              <div class="result-icon">🏢</div>
              <div class="result-info">
                <span class="result-name">{{ result.name }}</span>
                <span class="result-full">{{ result.displayName }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!coordResult && results.length === 0 && searchQuery.length >= 3 && !isSearching" class="no-results">
          No se encontraron resultados
        </div>
      </div>

      <div class="location-selector__actions">
        <button class="gps-btn" @click="useMyGeolocation" :disabled="geoState.isLoading">
          <span class="gps-icon">
             <svg v-if="!geoState.isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
               <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
             </svg>
             <span v-else class="gps-loader"></span>
          </span>
          {{ geoState.isLoading ? 'Localizando...' : 'Usar ubicación actual' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.location-selector {
  position: relative;
}

.location-selector__trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: #f9fbfc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-width: 180px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.location-selector__trigger:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.location-selector__trigger:active {
  transform: scale(0.98);
}

.location-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-icon svg {
  width: 100%;
  height: 100%;
}

.location-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.location-arrow {
  width: 12px;
  height: 12px;
  color: #9ca3af;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.location-arrow svg {
  width: 100%;
  height: 100%;
}

.location-arrow--open {
  transform: rotate(180deg);
}

.location-selector__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 340px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.location-selector__search {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
  background-color: #f9fafb;
}

.search-input:focus {
  border-color: #22c55e;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.search-loader {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  to { transform: translateY(-50%) rotate(360deg); }
}

.location-selector__content {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.location-selector__group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-left: 0.25rem;
}

.result-item {
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid transparent;
}

.result-item:hover {
  background-color: #f9fafb;
  border-color: #f1f5f9;
  transform: translateX(4px);
}

.result-item--highlight {
  background-color: #f0f9ff;
  border-color: #e0f2fe;
}

.result-item--highlight:hover {
  background-color: #e0f2fe;
}

.result-icon {
  font-size: 1.125rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.result-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.result-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.result-full {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  text-align: center;
  padding: 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.location-selector__actions {
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
}

.gps-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #22c55e;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.2);
}

.gps-btn:hover:not(:disabled) {
  background-color: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.3);
}

.gps-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.gps-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #9ca3af;
  box-shadow: none;
}

.gps-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gps-icon svg {
  width: 100%;
  height: 100%;
}

.gps-loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}
</style>

