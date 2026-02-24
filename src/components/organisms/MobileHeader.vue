<script setup lang="ts">
const userAvatar = 'ME'
</script>

<template>
  <header class="mobile-header">
    <div class="mobile-header__logo">
      <span class="mobile-header__logo-icon">🍇</span>
      <h1 class="mobile-header__logo-text">VitisGuard</h1>
    </div>

    <button class="mobile-header__profile-btn" aria-label="Settings">
      <div class="mobile-header__avatar">{{ userAvatar }}</div>
    </button>
  </header>
</template>

<style scoped>
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  z-index: 1000;
}

.mobile-header__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-header__logo-icon {
  background-color: #22c55e;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.mobile-header__logo-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.mobile-header__profile-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.mobile-header__avatar {
  width: 36px;
  height: 36px;
  background-color: #e2e8f0;
  color: #475569;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

@media (min-width: 1025px) {
  .mobile-header {
    display: none;
  }
}
</style>
