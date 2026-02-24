<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigation } from '@/composables/useNavigation'
import { useWeather } from '@/composables/use-weather'
import { useGeolocation } from '@/composables/useGeolocation'

const router = useRouter()
const { activeTitle, activeSubtitle } = useNavigation()

const { alerts, fetchWeather } = useWeather()
const { state: geoState } = useGeolocation()

const threatsCount = computed(() => alerts.value.length)

const location = computed(() => {
  if (geoState.value.latitude && geoState.value.longitude) {
    return `${geoState.value.latitude.toFixed(2)}, ${geoState.value.longitude.toFixed(2)}`
  }
  return 'Getaria DO'
})

const goToAlerts = () => {
  router.push('/alerts')
}

watch(
  () => [geoState.value.latitude, geoState.value.longitude],
  ([lat, lon]) => {
    if (typeof lat === 'number' && typeof lon === 'number') {
      fetchWeather(lat, lon)
    }
  },
  { immediate: true }
)
</script>

<template>
  <header class="desktop-header">
    <div class="desktop-header__left">
      <div class="desktop-header__info">
        <h2 class="desktop-header__title">{{ activeTitle }}</h2>
        <p v-if="activeSubtitle" class="desktop-header__subtitle">{{ activeSubtitle }}</p>
      </div>
    </div>

    <div class="desktop-header__actions">
      <div class="desktop-header__badge" @click="goToAlerts">
        <span class="badge-dot"></span>
        {{ threatsCount }} CRITICAL THREATS
      </div>

      <div class="desktop-header__location">
        <span class="location-icon">📍</span>
        <span class="location-text">{{ location }}</span>
        <span class="location-arrow">▼</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.desktop-header {
  height: 80px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  position: sticky;
  top: 0;
  z-index: 900;
}

.desktop-header__left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.desktop-header__info {
  padding-left: 2rem;
  border-left: 1px solid #f1f5f9;
}

.desktop-header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  letter-spacing: -0.01em;
}

.desktop-header__subtitle {
  font-size: 0.85rem;
  color: #718096;
  margin: 0.1rem 0 0;
  font-weight: 500;
}

.desktop-header__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.desktop-header__badge {
  background-color: #fef2f2;
  color: #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #fee2e2;
  cursor: pointer;
  transition: all 0.2s;
}

.desktop-header__badge:hover {
  background-color: #fee2e2;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.desktop-header__location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.desktop-header__location:hover {
  background-color: #f1f5f9;
}

.location-icon {
  font-size: 1rem;
}

.location-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.location-arrow {
  font-size: 0.75rem;
  color: #94a3b8;
}

@media (max-width: 1024px) {
  .desktop-header {
    display: none;
  }
}
</style>
