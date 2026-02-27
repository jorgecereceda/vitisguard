import { ref } from 'vue'

export type ToastType = 'error' | 'success' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const addToast = (message: string, type: ToastType = 'error') => {
    const id = nextId++
    toasts.value.push({ id, message, type })
  }

  const showError = (message: string) => {
    addToast(message, 'error')
  }

  const showSuccess = (message: string) => {
    addToast(message, 'success')
  }

  const showWarning = (message: string) => {
    addToast(message, 'warning')
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    toasts.value = []
  }

  return {
    toasts,
    showError,
    showSuccess,
    showWarning,
    removeToast,
    clearAll
  }
}
