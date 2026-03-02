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
  icon?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  error: '',
  required: false,
  disabled: false,
  icon: ''
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
  gap: 0.75rem;
}

.label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #a1bfa1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.required {
  color: #ef4444;
  margin-left: 4px;
}

.error-message {
  font-size: 0.75rem;
  font-weight: 600;
  color: #f87171;
  min-height: 18px;
  padding-left: 0.25rem;
}
</style>
