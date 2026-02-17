<script setup lang="ts">
interface Props {
  type?: 'submit' | 'button'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false
})
</script>

<template>
  <button
    :type="type"
    :class="['base-button', `variant-${variant}`, { loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.base-button:active:not(:disabled) {
  transform: scale(0.98);
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.variant-primary {
  background-color: #4f46e5;
  color: #fff;
}

.variant-primary:hover:not(:disabled) {
  background-color: #4338ca;
}

.variant-secondary {
  background-color: transparent;
  color: #4f46e5;
  border: 1px solid #4f46e5;
}

.variant-secondary:hover:not(:disabled) {
  background-color: #f5f3ff;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .base-button {
    padding: 14px 20px;
  }
}
</style>
