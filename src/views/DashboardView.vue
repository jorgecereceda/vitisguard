<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="dashboard-view">
    <h1>Welcome to VitisGuard</h1>
    <p>Hello, {{ authStore.user?.name }}!</p>
  </div>
</template>

<style scoped>
.dashboard-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9fafb;
}

h1 {
  color: #1f2937;
  margin-bottom: 8px;
}

p {
  color: #6b7280;
}
</style>
