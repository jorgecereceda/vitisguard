<script setup lang="ts">
interface Option {
  label: string
  value: string
}

interface Props {
  id: string
  name: string
  modelValue: string
  options: Option[]
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  error: '',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="base-select" :class="{ 'has-error': error }">
    <label v-if="label" :for="id" class="base-select__label">
      {{ label }}<span v-if="required" class="required">*</span>
    </label>
    <select
      :id="id"
      :name="name"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      class="base-select__input"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="base-select__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.base-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.base-select__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.base-select__input {
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
}

.base-select__input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.base-select.has-error .base-select__input {
  border-color: #ef4444;
}

.base-select.has-error .base-select__input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-select__input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.base-select__error {
  font-size: 12px;
  color: #ef4444;
  min-height: 16px;
}
</style>
