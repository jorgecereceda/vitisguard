<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger'
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleCancel() {
  emit('cancel')
  emit('update:show', false)
}

function handleConfirm() {
  emit('confirm')
  emit('update:show', false)
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click="handleBackdropClick">
      <div class="modal-container" @click.stop>
        <header class="modal-header">
          <h2>{{ title }}</h2>
          <button type="button" class="close-btn" @click="handleCancel">
            ×
          </button>
        </header>

        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>

        <div class="modal-actions">
          <BaseButton type="button" variant="secondary" @click="handleCancel">
            {{ cancelText }}
          </BaseButton>
          <BaseButton type="button" :variant="variant" @click="handleConfirm">
            {{ confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  margin: auto;
  padding: 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.modal-message {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #4b5563;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(1.1);
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
    margin: 16px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
