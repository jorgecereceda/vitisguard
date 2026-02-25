<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { alerts, fetchWeather } = useWeather()
const weatherStore = useWeatherStore()

const threatsCount = computed(() => alerts.value.length)

const navItems = ref([
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
    active: true
  },
  {
    id: 'alerts',
    label: 'Alerts',
    route: '/alerts',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    active: false
  },
  {
    id: 'plots',
    label: 'Parcel',
    route: '/plots',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    active: false
  },
])

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

const navigateTo = (path: string) => {
  router.push(path)
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

watch(
  () => route.path,
  (path) => {
    navItems.value.forEach(item => {
      item.active = item.route === path
    })
  },
  { immediate: true }
)
</script>

<template>
  <nav class="mobile-nav">
    <div class="mobile-nav__items">
      <!-- Dashboard & Alerts -->
      <div v-for="item in navItems.slice(0, 2)" :key="item.label"
           class="mobile-nav__item"
           :class="{
             'mobile-nav__item--active': item.active,
             'mobile-nav__item--has-alerts': item.id === 'alerts' && threatsCount > 0
           }"
           @click="navigateTo(item.route)">
        <div class="mobile-nav__icon-wrapper">
          <span class="mobile-nav__icon" v-html="item.icon"></span>
          <span v-if="item.id === 'alerts' && threatsCount > 0" class="mobile-nav__badge">{{ threatsCount }}</span>
        </div>
        <span class="mobile-nav__label">{{ item.label }}</span>
      </div>

      <!-- FAB Spacer -->
      <div class="mobile-nav__fab-spacer"></div>

      <!-- Parcel -->
      <div v-for="item in navItems.slice(2, 3)" :key="item.label"
           class="mobile-nav__item"
           :class="{ 'mobile-nav__item--active': item.active }"
           @click="navigateTo(item.route)">
        <div class="mobile-nav__icon-wrapper">
          <span class="mobile-nav__icon" v-html="item.icon"></span>
        </div>
        <span class="mobile-nav__label">{{ item.label }}</span>
      </div>

      <!-- User Profile Container -->
      <div class="mobile-nav__item" ref="dropdownRef" @click="toggleDropdown">
        <div class="mobile-nav__user-avatar" :class="{ 'mobile-nav__user-avatar--active': isDropdownOpen }">
          {{ userInitial }}
        </div>
        <span class="mobile-nav__label">Perfil</span>

        <!-- Dropdown Menu (Upwards) -->
        <div v-if="isDropdownOpen" class="user-dropdown">
          <div class="user-dropdown__header">
            <p class="user-dropdown__name">{{ authStore.user?.name || 'User' }}</p>
            <p class="user-dropdown__email">{{ authStore.user?.email || '' }}</p>
          </div>
          <div class="user-dropdown__divider"></div>
          <button class="user-dropdown__item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Configuración
          </button>
          <button class="user-dropdown__item user-dropdown__item--logout" @click.stop="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="mobile-nav__fab" aria-label="Add new">
      <span class="mobile-nav__fab-icon">+</span>
    </button>
  </nav>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #0e3124; /* Dark green matching sidebar */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  padding: 0 0.5rem;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
}

.mobile-nav__items {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.mobile-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  cursor: pointer;
  color: #a1bfa1;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  padding: 8px 0;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  border-radius: 12px;
}

.mobile-nav__item:active {
  transform: scale(1.05); /* Popup effect */
}

.mobile-nav__item--active {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.08);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* Active indicator line (Mobile version) */
.mobile-nav__item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 40px;
  height: 3px;
  background-color: #22c55e;
  border-radius: 0 0 4px 4px;
  transition: transform 0.3s ease;
  transform-origin: center;
}

.mobile-nav__item--active::before {
  transform: translateX(-50%) scaleX(1);
}

.mobile-nav__item--active .mobile-nav__icon {
  transform: translateY(-1px) scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.mobile-nav__icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-nav__icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-nav__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.mobile-nav__badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0e3124;
}

.mobile-nav__item--has-alerts .mobile-nav__icon {
  color: #ef4444;
}

.mobile-nav__user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #1a4d3c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  border: 3px solid #0e3124;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-top: -15px; /* Overshoot effect */
}

.mobile-nav__user-avatar--active {
  background-color: #ffffff;
  color: #0e3124;
  border-color: #ffffff;
  transform: translateY(-5px) scale(1.1);
}

.mobile-nav__label {
  font-size: 0.65rem;
  font-weight: 500;
}

.mobile-nav__fab-spacer {
  width: 70px;
}

.mobile-nav__fab {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  background: #1a4d3c;
  border: 4px solid #0e3124;
  border-radius: 50%;
  color: white;
  font-size: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 1002;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s;
}

.mobile-nav__fab:active {
  transform: translateX(-50%) scale(0.9) translateY(2px);
  background-color: #24634d;
}

.mobile-nav__fab-icon {
  line-height: 1;
  margin-top: -2px;
}

/* User Dropdown (Upwards) */
.user-dropdown {
  position: absolute;
  bottom: calc(100% + 15px);
  right: -10px;
  width: 180px;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1010;
}

.user-dropdown__header {
  padding: 0.5rem 0.75rem;
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
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
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

@media (min-width: 1025px) {
  .mobile-nav {
    display: none;
  }
}
</style>
