<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useToast } from '@/composables/useToast'
import BaseToast from '@/components/atoms/BaseToast.vue'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div>
    <RouterView />
    <BaseToast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      @close="removeToast(toast.id)"
    />
  </div>  
</template>

<style scoped>

</style>
