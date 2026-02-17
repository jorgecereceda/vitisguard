<script setup lang="ts">
interface Props {
  title: string
  status?: 'normal' | 'warning' | 'danger'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'normal',
  loading: false,
})
</script>

<template>
  <div :class="['data-card', `data-card--${props.status}`]">
    <div v-if="props.loading" class="data-card__loader">
      <div class="data-card__skeleton"></div>
    </div>
    <template v-else>
      <div class="data-card__header">
        <slot name="header"></slot>
      </div>
      <div class="data-card__body">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" class="data-card__footer">
        <slot name="footer"></slot>
      </div>
    </template>
  </div>
</template>

<style scoped>
.data-card {
  background-color: var(--color-surface, #ffffff);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.data-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.data-card--normal {
  border-left: 4px solid var(--color-success, #22c55e);
}

.data-card--warning {
  border-left: 4px solid var(--color-warning, #f59e0b);
}

.data-card--danger {
  border-left: 4px solid var(--color-danger, #ef4444);
}

.data-card__header {
  margin-bottom: 12px;
}

.data-card__body {
  min-height: 48px;
}

.data-card__footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.data-card__loader {
  padding: 20px 0;
}

.data-card__skeleton {
  height: 48px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
