<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { searchAddress, reverseGeocode, type GeocodingResult } from '@/services/geocoding'
import { useGeolocation } from '@/composables/useGeolocation'

const weatherStore = useWeatherStore()
const { state: geoState, getLocation } = useGeolocation()

const isOpen = ref(false)
const searchQuery = ref('')
const results = ref<GeocodingResult[]>([])
const isSearching = ref(false)
const selectorRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleSearch = async () => {
  if (searchQuery.value.length < 3) {
    results.value = []
    return
  }
  isSearching.value = true
  results.value = await searchAddress(searchQuery.value)
  isSearching.value = false
}

const selectLocation = (result: GeocodingResult) => {
  weatherStore.setLocation(result.latitude, result.longitude, result.name)
  isOpen.value = false
  searchQuery.value = ''
  results.value = []
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
      <span class="location-icon">📍</span>
      <span class="location-text">{{ weatherStore.userLocation.name }}</span>
      <span class="location-arrow" :class="{ 'location-arrow--open': isOpen }">▼</span>
    </div>

    <div v-if="isOpen" class="location-selector__dropdown">
      <div class="location-selector__search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar dirección o lugar..."
          class="search-input"
          @input="handleSearch"
        />
        <div v-if="isSearching" class="search-loader"></div>
      </div>

      <div class="location-selector__results" v-if="results.length > 0">
        <div
          v-for="result in results"
          :key="result.displayName"
          class="result-item"
          @click="selectLocation(result)"
        >
          <span class="result-name">{{ result.name }}</span>
          <span class="result-full">{{ result.displayName }}</span>
        </div>
      </div>

      <div class="location-selector__actions">
        <button class="gps-btn" @click="useMyGeolocation" :disabled="geoState.isLoading">
          <span class="gps-icon">🎯</span>
          {{ geoState.isLoading ? 'Obteniendo...' : 'Usar mi ubicación actual' }}
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
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.location-selector__trigger:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.location-icon {
  font-size: 1rem;
}

.location-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.location-arrow {
  font-size: 0.75rem;
  color: #94a3b8;
  transition: transform 0.2s;
}

.location-arrow--open {
  transform: rotate(180deg);
}

.location-selector__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #27ae60;
}

.search-loader {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #27ae60;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  to { transform: translateY(-50%) rotate(360deg); }
}

.location-selector__results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
}

.result-item {
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f8fafc;
}

.result-item:not(:last-child) {
  border-bottom: 1px solid #f1f5f9;
}

.result-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.result-full {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-selector__actions {
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.gps-btn {
  width: 100%;
  padding: 0.625rem;
  background-color: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 8px;
  color: #166534;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.gps-btn:hover:not(:disabled) {
  background-color: #dcfce7;
}

.gps-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
