<script setup lang="ts">
interface Props {
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

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :id="id"
    :type="type"
    :name="name"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :class="{ 'has-error': error }"
    class="base-input"
    @input="handleInput"
    @blur="emit('blur', $event)"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}

.base-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.base-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.base-input.has-error {
  border-color: #ef4444;
}

.base-input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

@media (max-width: 640px) {
  .base-input {
    padding: 14px 12px;
    font-size: 16px;
  }
}
</style>
