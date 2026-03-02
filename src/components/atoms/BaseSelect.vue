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
  className?: string
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
    <label v-if="label" :for="id" :class="['base-select__label', className]">
      {{ label }}<span v-if="required" class="required">*</span>
    </label>
    <select
      :id="id"
      :name="name"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :class="['base-select__input', className]"
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
  gap: 0.75rem;
}

.base-select__label {
  font-size: 0.85rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.required {
  color: #ef4444;
  margin-left: 4px;
}

.base-select__input {
  padding: 0.8rem 1.1rem;
  font-size: 1rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  padding-right: 45px;
  backdrop-filter: blur(5px);
}

.base-select__input:focus {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
  transform: translateY(-1px);
}

.base-select.has-error .base-select__input {
  border-color: rgba(239, 68, 68, 0.6);
  background-color: rgba(239, 68, 68, 0.05);
}

.base-select.has-error .base-select__input:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.base-select__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(255, 255, 255, 0.02);
}

.base-select__error {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fca5a5;
  min-height: 18px;
  padding-left: 0.5rem;
  letter-spacing: 0.01em;
}

/* Custom styling for options if rendered by the browser */
option {
  background: #1e3a5f;
  color: white;
  padding: 10px;
}
</style>
