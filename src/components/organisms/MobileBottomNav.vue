<script setup lang="ts">
const navItems = [
  { icon: '📊', label: 'Dashboard', active: true },
  { icon: '🔔', label: 'Alerts', active: false },
  { icon: '📈', label: 'Insights', active: false },
  { icon: '🗺️', label: 'Parcels', active: false },
]
</script>

<template>
  <nav class="mobile-nav">
    <div class="mobile-nav__items">
      <!-- Nav items before FAB -->
      <template v-for="(item, index) in navItems" :key="item.label">
        <div v-if="index < 2"
             class="mobile-nav__item"
             :class="{ 'mobile-nav__item--active': item.active }">
          <span class="mobile-nav__icon">{{ item.icon }}</span>
          <span class="mobile-nav__label">{{ item.label }}</span>
        </div>

        <!-- Central FAB Spacer -->
        <div v-if="index === 2" class="mobile-nav__fab-spacer"></div>

        <div v-if="index >= 2"
             class="mobile-nav__item"
             :class="{ 'mobile-nav__item--active': item.active }">
          <span class="mobile-nav__icon">{{ item.icon }}</span>
          <span class="mobile-nav__label">{{ item.label }}</span>
        </div>
      </template>
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
  background: white;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  padding: 0 1rem;
}

.mobile-nav__items {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.mobile-nav__item--active {
  color: #22c55e;
}

.mobile-nav__icon {
  font-size: 1.25rem;
}

.mobile-nav__label {
  font-size: 0.65rem;
  font-weight: 600;
}

.mobile-nav__fab-spacer {
  width: 60px;
}

.mobile-nav__fab {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  background: #22c55e;
  border: 4px solid white;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  cursor: pointer;
  z-index: 1002;
}

.mobile-nav__fab-icon {
  line-height: 1;
  margin-top: -2px;
}

@media (min-width: 1025px) {
  .mobile-nav {
    display: none;
  }
}
</style>
