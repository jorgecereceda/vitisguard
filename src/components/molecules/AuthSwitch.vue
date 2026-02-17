<script setup lang="ts">
import BaseLink from '@/components/atoms/BaseLink.vue'

interface Props {
  text: string
  linkText: string
  to: string
}

defineProps<Props>()
</script>

<template>
  <p class="auth-switch">
    {{ text }}
    <BaseLink :to="to">{{ linkText }}</BaseLink>
  </p>
</template>

<style scoped>
.auth-switch {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}
</style>
