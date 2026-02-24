<script setup lang="ts">
interface Props {
  variant?: 'normal' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  variant: 'normal',
  size: 'md',
})
</script>

<template>
  <span :class="['base-badge', `base-badge--${variant}`, `base-badge--${size}`]">
    <slot></slot>
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.base-badge--sm {
  font-size: 10px;
  padding: 1px 6px;
}

.base-badge--md {
  font-size: 12px;
}

.base-badge--lg {
  font-size: 14px;
  padding: 4px 12px;
}

.base-badge--normal {
  background-color: var(--color-bg-secondary, #f3f4f6);
  color: var(--color-text-secondary, #6b7280);
}

.base-badge--success {
  background-color: rgba(34, 197, 94, 0.15);
  color: var(--color-success, #16a34a);
}

.base-badge--warning {
  background-color: rgba(245, 158, 11, 0.15);
  color: var(--color-warning, #d97706);
}

.base-badge--danger {
  background-color: rgba(239, 68, 68, 0.15);
  color: var(--color-danger, #dc2626);
}

.base-badge--info {
  background-color: rgba(14, 165, 233, 0.15);
  color: var(--color-info, #0284c7);
}
</style>
