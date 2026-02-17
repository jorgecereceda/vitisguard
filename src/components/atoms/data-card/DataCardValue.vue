<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number | null
  decimals?: number
  prefix?: string
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  decimals: 1,
  prefix: '',
  fallback: '--',
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return props.fallback
  }
  const formatted = props.value.toFixed(props.decimals)
  return `${props.prefix}${formatted}`
})
</script>

<template>
  <span :class="['data-card-value', { 'data-card-value--empty': value === null }]">
    {{ formattedValue }}
  </span>
</template>

<style scoped>
.data-card-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
  line-height: 1.2;
}

.data-card-value--empty {
  color: var(--color-text-muted, #9ca3af);
}
</style>
