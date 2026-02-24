<script setup lang="ts">
interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})
</script>

<template>
  <span :class="['base-icon', `base-icon--${size}`]">
    {{ name }}
  </span>
</template>

<style scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.base-icon--sm {
  font-size: 16px;
}

.base-icon--md {
  font-size: 20px;
}

.base-icon--lg {
  font-size: 24px;
}
</style>
