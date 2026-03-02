<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNavigation } from '@/composables/useNavigation'
import logoUrl from '@/assets/img/Logo.png'

const router = useRouter()
const route = useRoute()
const { setNavigation } = useNavigation()

const navItems = ref([
  {
    id: 'dashboard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
    label: 'Dashboard',
    route: '/dashboard',
    active: true
  },
  {
    id: 'alerts',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    label: 'Alerts',
    route: '/alerts',
    active: false
  },
  {
    id: 'plots',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    label: 'Parcel',
    route: '/plots',
    active: false
  },
  {
    id: 'alertHistory',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    label: 'Alert History',
    route: '/alert-history',
    active: false
  }
])

const selectItem = (index: number) => {
  const item = navItems.value[index]
  if (item) {
    router.push(item.route)
  }
}

watch(
  () => route.path,
  (path) => {
    navItems.value.forEach((item) => {
      item.active = item.route === path
      if (item.active) {
        setNavigation(item.label, '')
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <aside class="side-navigation">
    <div class="side-navigation__header">
      <div class="side-navigation__logo">
        <img :src="logoUrl" alt="VitisGuard Logo" class="side-navigation__logo-img" />
        <h1 class="side-navigation__logo-text">VitisGuard</h1>
      </div>
    </div>

    <nav class="side-navigation__menu">
      <ul class="side-navigation__list">
        <li v-for="(item, index) in navItems" :key="item.label"
            class="side-navigation__item"
            :class="{ 'side-navigation__item--active': item.active }"
            @click="selectItem(index)">
          <span class="side-navigation__icon" v-html="item.icon"></span>
          <span class="side-navigation__label">{{ item.label }}</span>
        </li>
      </ul>
    </nav>

    <div class="side-navigation__footer">
      <div class="side-navigation__bottom-logo">
        <img :src="logoUrl" alt="VitisGuard" class="side-navigation__bottom-logo-img" />
        <span class="side-navigation__bottom-logo-text">VitisGuard</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.side-navigation {
  width: 240px;
  height: 100vh;
  background-color: #0e3124;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  padding: 2rem 1rem;
  color: #a1bfa1;
}

.side-navigation__header {
  margin-bottom: 3rem;
  padding-left: 0.5rem;
}

.side-navigation__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ffffff;
}

.side-navigation__logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.side-navigation__logo-img:active {
  transform: scale(1.08); /* Making it look bigger */
}

.side-navigation__logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
}

.side-navigation__menu {
  flex: 1;
}

.side-navigation__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.side-navigation__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.side-navigation__item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  padding-left: 1.25rem; /* Slight slide on hover */
}

.side-navigation__item--active {
  background-color: #24634d; /* Brighter active state */
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.side-navigation__item:active {
  transform: scale(1.05); /* Popup effect */
}

/* Active indicator line */
.side-navigation__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleX(0);
  width: 4px;
  height: 20px;
  background-color: #22c55e;
  border-radius: 0 4px 4px 0;
  transition: transform 0.3s ease;
  transform-origin: left;
}

.side-navigation__item--active::before {
  transform: translateY(-50%) scaleX(1);
}

.side-navigation__icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.side-navigation__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.side-navigation__footer {
  margin-top: auto;
  padding-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.side-navigation__bottom-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  color: #ffffff;
}

.side-navigation__bottom-logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.side-navigation__bottom-logo-img:active {
  transform: scale(1.08);
}

.side-navigation__bottom-logo-text {
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .side-navigation {
    display: none;
  }
}
</style>

