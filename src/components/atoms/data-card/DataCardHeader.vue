<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  icon?: string
}

defineProps<Props>()
</script>

<template>
  <div class="data-card-header">
    <div class="data-card-header__icon-wrapper">
      <slot name="icon">
        <span v-if="icon" class="data-card-header__icon">{{ icon }}</span>
      </slot>
    </div>
    <div class="data-card-header__content">
      <h3 class="data-card-header__title">{{ title }}</h3>
      <p v-if="subtitle" class="data-card-header__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<style scoped>
.data-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-card-header__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: var(--color-primary-light, #f0f9ff);
  color: var(--color-primary, #0ea5e9);
}

.data-card-header__icon {
  font-size: 20px;
}

.data-card-header__content {
  flex: 1;
  min-width: 0;
}

.data-card-header__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-card-header__subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-text-muted, #9ca3af);
}
</style>
