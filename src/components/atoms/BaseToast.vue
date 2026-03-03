<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  message: string
  type?: 'error' | 'success' | 'warning'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(false)

const close = () => {
  isVisible.value = false
  setTimeout(() => emit('close'), 300)
}

let timeoutId: ReturnType<typeof setTimeout>

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 10)

  timeoutId = setTimeout(() => {
    close()
  }, props.duration)
})

onUnmounted(() => {
  clearTimeout(timeoutId)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="isVisible" :class="['base-toast', `toast-${type}`]" role="alert">
        <span class="toast-icon">
          <svg v-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
        <span class="toast-message">{{ message }}</span>
        <button class="toast-close" @click="close" aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-width: 400px;
}

.toast-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.toast-success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.toast-warning {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.toast-icon {
  display: flex;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@media (max-width: 640px) {
  .base-toast {
    top: auto;
    bottom: 20px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
