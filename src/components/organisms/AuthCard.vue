<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="auth-card">
    <div class="brand">
      <h1 class="logo">🍇 VitisGuard</h1>
    </div>
    <div class="card-content">
      <h2 class="title">{{ title }}</h2>
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
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 32px;
  text-align: center;
}

.logo {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.card-content {
  padding: 32px;
}

.title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  text-align: center;
}

@media (max-width: 640px) {
  .auth-card {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .brand {
    padding: 24px;
  }

  .logo {
    font-size: 24px;
  }

  .card-content {
    padding: 24px 20px;
  }

  .title {
    font-size: 20px;
  }
}
</style>
