<script setup lang="ts">
import logoUrl from '@/assets/img/Logo.png'

interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="auth-card">
    <div class="brand">
      <img :src="logoUrl" alt="VitisGuard Logo" class="logo-img" />
      <div>
        <h1 class="title"> VitisGuard</h1>
        <h2 class="sub-title">Intelligent Vineyard Management</h2>
      </div>
    </div>
    <div class="card-content">
      <h2 class="title2">{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.brand {
  padding: 2rem 2rem 0 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  place-items: center;
  gap: 1rem;
}

.logo-img {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.card-content {
  padding: 2rem;
}

.title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
}

.title2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

.sub-title {
  color: #475569;
  font-size: 1rem;
}

@media (max-width: 640px) {
  .auth-card {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .brand {
    padding: 1rem 1rem 0 1rem;
  }

  .logo {
    font-size: 3rem;
  }

  .card-content {
    padding: 1rem 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .title2 {
    font-size: 1.5rem;
  }

  .sub-title {
    font-size: 1rem;
  }
}
</style>
