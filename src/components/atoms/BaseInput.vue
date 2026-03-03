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
  className?: string
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
    :class="[
      { 'has-error': error}, 
      className
    ]"
    class="base-input"
    @input="handleInput"
    @blur="emit('blur', $event)"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  padding: 0.8rem 1.1rem;
  font-size: 1rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  box-sizing: border-box;
  backdrop-filter: blur(5px);
}

.base-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.base-input:focus {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
  transform: translateY(-1px);
}

.base-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(255, 255, 255, 0.02);
}

.base-input.has-error {
  border-color: rgba(239, 68, 68, 0.6);
  background-color: rgba(239, 68, 68, 0.05);
}

.base-input.has-error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.input-claro{
  color: rgb(104, 104, 104);
  border: 1px solid rgb(104, 104, 104);
}

@media (max-width: 640px) {
  .base-input {
    padding: 0.9rem 1.1rem;
  }
}
</style>
