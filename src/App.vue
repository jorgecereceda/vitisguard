<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <Suspense>
    <template #default>
      <RouterView />
    </template>
    <template #fallback>
      <div class="loading-overlay">Cargando aplicación...</div>
    </template>
  </Suspense>
</template>

<style>
/* Global styles for the app */
body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
  }
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  font-weight: 600;
  color: #27ae60;
}
</style>

<style scoped></style>
