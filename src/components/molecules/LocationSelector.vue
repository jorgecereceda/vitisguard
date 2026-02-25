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
          placeholder="Search location..."
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
          {{ geoState.isLoading ? 'Locating...' : 'Use current location' }}
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
  transform: scale(1.05);
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
  width: 320px;
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
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #5eba7d;
}

.search-loader {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #5eba7d;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  to { transform: translateY(-50%) rotate(360deg); }
}

.location-selector__results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #f3f4f6;
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
  background-color: #f9fafb;
}

.result-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
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

.location-selector__actions {
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
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

