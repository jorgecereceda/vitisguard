<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import { useAuthStore } from '@/stores/auth'
import LocationSelector from '@/components/molecules/LocationSelector.vue'

const router = useRouter()
const { alerts, fetchWeather } = useWeather()
const weatherStore = useWeatherStore()
const authStore = useAuthStore()

const threatsCount = computed(() => alerts.value.length)
const userInitial = computed(() => {
  const name = authStore.user?.name || 'User'
  return name.charAt(0).toUpperCase()
})

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
  <header class="desktop-header">
    <div class="desktop-header__left">
      <LocationSelector />
    </div>

    <div class="desktop-header__right">
      <button
        class="header-icon-btn header-icon-btn--notifications"
        :class="{ 'header-icon-btn--has-alerts': threatsCount > 0 }"
        title="Notifications"
        @click="router.push('/alerts')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        <span v-if="threatsCount > 0" class="notification-count">{{ threatsCount }}</span>
      </button>

      <div class="desktop-header__user-container" ref="dropdownRef">
        <div class="desktop-header__user-profile" @click="toggleDropdown">
          <div class="user-initial-avatar">
            {{ userInitial }}
          </div>
          <span class="user-arrow" :class="{ 'user-arrow--open': isDropdownOpen }">▼</span>
        </div>

        <div v-if="isDropdownOpen" class="user-dropdown">
          <div class="user-dropdown__header">
            <p class="user-dropdown__name">{{ authStore.user?.name || 'User' }}</p>
            <p class="user-dropdown__email">{{ authStore.user?.email || '' }}</p>
          </div>
          <div class="user-dropdown__divider"></div>
          <button class="user-dropdown__item user-dropdown__item--logout" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.desktop-header {
  height: 80px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 900;
  border-bottom: 1px solid #f3f4f6;
}

.desktop-header__right {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-direction: row-reverse;
}

.header-icon-btn--notifications {
  order: 2;
}

.desktop-header__user-container {
  position: relative;
  order: 1;
}

.desktop-header__user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 99px;
  transition: background-color 0.2s, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.desktop-header__user-profile:hover {
  background-color: #f9fafb;
}

.desktop-header__user-profile:active {
  transform: scale(1.05);
}

.user-initial-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #0e3124;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-arrow {
  font-size: 0.75rem;
  color: #9ca3af;
  transition: transform 0.2s;
}

.user-arrow--open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.user-dropdown__header {
  padding: 0.75rem 0.75rem;
}

.user-dropdown__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.user-dropdown__email {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.125rem 0 0;
}

.user-dropdown__divider {
  height: 1px;
  background-color: #f3f4f6;
  margin: 0.5rem 0;
}

.user-dropdown__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  background: none;
  border-radius: 8px;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-dropdown__item:hover {
  background-color: #f9fafb;
}

.user-dropdown__item svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.user-dropdown__item--logout {
  color: #ef4444;
}

.user-dropdown__item--logout svg {
  color: #ef4444;
}

.header-icon-btn {
  background: none;
  border: none;
  padding: 0.75rem;
  color: #4b5563;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  -webkit-tap-highlight-color: transparent;
}

.header-icon-btn:hover {
  color: #111827;
}

.header-icon-btn:active {
  transform: scale(1.05);
}

.header-icon-btn svg {
  width: 26px;
  height: 26px;
}

.header-icon-btn--has-alerts {
  color: #ef4444;
}

.header-icon-btn--has-alerts:hover {
  color: #dc2626;
}

.notification-count {
  font-size: 1rem;
  font-weight: 700;
  color: #ef4444;
  margin-left: 0.25rem;
}

@media (max-width: 1024px) {
  .desktop-header {
    display: none;
  }
}
</style>
