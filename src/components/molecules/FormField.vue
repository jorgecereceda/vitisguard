<script setup lang="ts">
import BaseInput from '@/components/atoms/BaseInput.vue'

interface Props {
  label: string
  modelValue: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  error?: string
  id: string
  name: string
  required?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  error: '',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()
</script>

<template>
  <div class="form-field">
    <label :for="id" class="label">
      {{ label }}<span v-if="required" class="required">*</span>
    </label>
    <BaseInput
      :id="id"
      :name="name"
      :type="type"
      :model-value="modelValue"
      :placeholder="placeholder"
      :error="error"
      :required="required"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
      @blur="emit('blur', $event)"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
  min-height: 16px;
}
</style>
