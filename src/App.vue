<script setup lang="ts">
import { RouterView } from 'vue-router'
import SideNavigation from '@/components/organisms/SideNavigation.vue'
import MobileBottomNav from '@/components/organisms/MobileBottomNav.vue'
import MobileHeader from '@/components/organisms/MobileHeader.vue'
import DesktopHeader from '@/components/organisms/DesktopHeader.vue'
</script>

<template>
  <div class="app-layout">
    <SideNavigation />
    <MobileHeader />
    <div class="app-content">
      <DesktopHeader />
      <Suspense>
        <template #default>
          <RouterView />
        </template>
        <template #fallback>
          <div class="loading-overlay">Cargando aplicación...</div>
        </template>
      </Suspense>
    </div>
    <MobileBottomNav />
  </div>
</template>

<style scoped>
/* Global styles for the app */
body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* @media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
  }
} */

.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  padding-left: 260px; /* Width of the sidebar */
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

@media (max-width: 1024px) {
  .app-content {
    padding-left: 0;
    padding-top: 64px; /* Space for mobile header */
    padding-bottom: 70px; /* Space for mobile nav */
  }
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  font-weight: 600;
  color: #22c55e;
}
</style>
