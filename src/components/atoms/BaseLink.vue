<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  to?: string
  variant?: 'default' | 'primary'
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
})
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="['base-link', `variant-${variant}`]">
    <slot />
  </RouterLink>
  <a v-else :class="['base-link', `variant-${variant}`]">
    <slot />
  </a>
</template>

<style scoped>
.base-link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.base-link:hover {
  text-decoration: underline;
}

.base-link.variant-primary {
  color: #fff;
}

.base-link.variant-primary:hover {
  text-decoration: underline;
}
</style>
