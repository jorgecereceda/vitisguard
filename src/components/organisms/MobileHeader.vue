<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import logoUrl from '@/assets/img/Logo.png'
import LocationSelector from '@/components/molecules/LocationSelector.vue'

const router = useRouter()
const { alerts, fetchWeather } = useWeather()
const weatherStore = useWeatherStore()

const threatsCount = computed(() => alerts.value.length)

const navigateToAlerts = () => {
  router.push('/alerts')
}

watch(
  () => [weatherStore.userLocation.latitude, weatherStore.userLocation.longitude],
  ([lat, lon]) => {
    if (typeof lat === 'number' && typeof lon === 'number') {
      fetchWeather(lat, lon)
    }
  },
  { immediate: true }
)
</script>

<template>
  <header class="mobile-header">
    <div class="mobile-header__left">
      <img :src="logoUrl" alt="VitisGuard" class="mobile-header__logo-img" />
    </div>

    <div class="mobile-header__center">
      <LocationSelector />
    </div>

    <div class="mobile-header__right">
      <button
        class="mobile-header__icon-btn"
        :class="{ 'mobile-header__icon-btn--has-alerts': threatsCount > 0 }"
        aria-label="Notifications"
        @click="navigateToAlerts"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        <span v-if="threatsCount > 0" class="notification-count">{{ threatsCount }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 1000;
  gap: 0.5rem;
}

.mobile-header__left {
  display: flex;
  align-items: center;
  min-width: 32px;
}

.mobile-header__logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.mobile-header__logo-img:active {
  transform: scale(0.95);
}

.mobile-header__center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

/* Enhancing LocationSelector prominence on mobile */
.mobile-header__center :deep(.location-selector__trigger) {
  padding: 8px 16px;
  min-width: 160px;
  max-width: 220px;
  background-color: #f9fafb;
}

.mobile-header__right {
  display: flex;
  align-items: center;
}

.mobile-header__icon-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  color: #4b5563;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mobile-header__icon-btn:active {
  transform: scale(1.05);
}

.mobile-header__icon-btn svg {
  width: 24px;
  height: 24px;
}

.mobile-header__icon-btn--has-alerts {
  color: #ef4444;
}

.notification-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: #ef4444;
  margin-left: 1px;
}

@media (min-width: 1025px) {
  .mobile-header {
    display: none;
  }
}
</style>
