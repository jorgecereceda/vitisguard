<script setup lang="ts">
import { ref } from 'vue'
import { useNavigation } from '@/composables/useNavigation'

const { setNavigation } = useNavigation()

const navItems = ref([
  { icon: '📊', label: 'Dashboard', subtitle: 'Operational real-time overview', active: true },
  { icon: '🔔', label: 'Alerts', subtitle: 'Hondarrabi Zuri • Txakoli DOs', active: false },
  { icon: '📈', label: 'Analytics', subtitle: 'Detailed production metrics', active: false },
  { icon: '🗺️', label: 'Parcel Maps', subtitle: 'Geospatial vineyard tracking', active: false },
  { icon: '📦', label: 'Inventory', subtitle: 'Supply and resource management', active: false },
])

const user = ref({
  name: 'Mikel Etxebarria',
  role: 'Vigneron Principal',
  avatar: 'ME'
})

const selectItem = (index: number) => {
  const item = navItems.value[index]
  if (item) {
    navItems.value.forEach((it, i) => it.active = i === index)
    setNavigation(item.label === 'Alerts' ? 'Alerts & Prevention' : item.label, item.subtitle)
  }
}

// Initial sync
selectItem(0)
</script>

<template>
  <aside class="side-navigation">
    <div class="side-navigation__header">
      <div class="side-navigation__logo">
        <span class="side-navigation__logo-icon">🍇</span>
        <h1 class="side-navigation__logo-text">VitisGuard</h1>
      </div>
    </div>

    <nav class="side-navigation__menu">
      <ul class="side-navigation__list">
        <li v-for="(item, index) in navItems" :key="item.label"
            class="side-navigation__item"
            :class="{ 'side-navigation__item--active': item.active }"
            @click="selectItem(index)">
          <span class="side-navigation__icon">{{ item.icon }}</span>
          <span class="side-navigation__label">{{ item.label }}</span>
          <div v-if="item.active" class="side-navigation__active-indicator"></div>
        </li>
      </ul>
    </nav>

    <div class="side-navigation__footer">
      <div class="side-navigation__user">
        <div class="side-navigation__avatar">{{ user.avatar }}</div>
        <div class="side-navigation__user-info">
          <p class="side-navigation__user-name">{{ user.name }}</p>
          <p class="side-navigation__user-role">{{ user.role }}</p>
        </div>
        <button class="side-navigation__settings-btn" title="Configuración">
          ⚙️
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.side-navigation {
  width: 260px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  padding: 1.5rem;
}

.side-navigation__header {
  margin-bottom: 2.5rem;
}

.side-navigation__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.side-navigation__logo-icon {
  background-color: #22c55e;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.side-navigation__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
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
  gap: 0.5rem;
}

.side-navigation__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-weight: 500;
  position: relative;
}

.side-navigation__item:hover {
  background-color: #f8fafc;
  color: #1e293b;
}

.side-navigation__item--active {
  background-color: #f0fdf4;
  color: #22c55e;
}

.side-navigation__active-indicator {
  position: absolute;
  right: -1.5rem;
  width: 4px;
  height: 24px;
  background-color: #22c55e;
  border-radius: 4px 0 0 4px;
}

.side-navigation__icon {
  font-size: 1.25rem;
}

.side-navigation__label {
  font-size: 0.95rem;
}

.side-navigation__footer {
  margin-top: auto;
  padding-bottom: 2rem; /* Move up slightly */
}

.side-navigation__user {
  background-color: #f8fafc;
  padding: 0.75rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.side-navigation__avatar {
  width: 40px;
  height: 40px;
  background-color: #e2e8f0;
  color: #475569;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.side-navigation__user-info {
  flex: 1;
  min-width: 0;
}

.side-navigation__user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-navigation__user-role {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.side-navigation__settings-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;
}

.side-navigation__settings-btn:hover {
  color: #1e293b;
}

@media (max-width: 1024px) {
  .side-navigation {
    display: none;
  }
}
</style>
