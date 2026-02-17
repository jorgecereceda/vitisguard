<script setup lang="ts">
import { reactive } from 'vue'
import FormField from '@/components/molecules/FormField.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

interface FormData {
  name: string
  email: string
  password: string
}

interface FormErrors {
  name: string
  email: string
  password: string
}

interface Props {
  mode: 'login' | 'register'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: FormData]
}>()

const formData = reactive<FormData>({
  name: '',
  email: '',
  password: ''
})

const touched = reactive({
  name: false,
  email: false,
  password: false
})

const errors = reactive<FormErrors>({
  name: '',
  email: '',
  password: ''
})

function validateName(): boolean {
  if (!formData.name) {
    errors.name = 'Name is required'
    return false
  }
  if (formData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
    return false
  }
  if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
    errors.name = 'Name must contain only letters'
    return false
  }
  errors.name = ''
  return true
}

function validateEmail(): boolean {
  if (!formData.email) {
    errors.email = 'Email is required'
    return false
  }
  if (!/.+@.+\..+/.test(formData.email)) {
    errors.email = 'Invalid email format'
    return false
  }
  errors.email = ''
  return true
}

function validatePassword(): boolean {
  if (!formData.password) {
    errors.password = 'Password is required'
    return false
  }
  if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    return false
  }
  errors.password = ''
  return true
}

function validateField(field: 'name' | 'email' | 'password') {
  touched[field] = true
  switch (field) {
    case 'name':
      validateName()
      break
    case 'email':
      validateEmail()
      break
    case 'password':
      validatePassword()
      break
  }
}

function handleSubmit() {
  touched.name = props.mode === 'register'
  touched.email = true
  touched.password = true

  const nameValid = props.mode === 'register' ? validateName() : true
  const emailValid = validateEmail()
  const passwordValid = validatePassword()

  if (nameValid && emailValid && passwordValid) {
    emit('submit', { ...formData })
  }
}

function getFieldError(field: 'name' | 'email' | 'password'): string {
  return touched[field] ? errors[field] : ''
}
</script>

<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <FormField
      v-if="mode === 'register'"
      id="name"
      v-model="formData.name"
      name="name"
      label="Name"
      type="text"
      placeholder="Enter your name"
      required
      :error="getFieldError('name')"
      :disabled="loading"
      @blur="validateField('name')"
    />

    <FormField
      id="email"
      v-model="formData.email"
      name="email"
      label="Email"
      type="email"
      placeholder="Enter your email"
      required
      :error="getFieldError('email')"
      :disabled="loading"
      @blur="validateField('email')"
    />

    <FormField
      id="password"
      v-model="formData.password"
      name="password"
      label="Password"
      type="password"
      placeholder="Enter your password"
      required
      :error="getFieldError('password')"
      :disabled="loading"
      @blur="validateField('password')"
    />

    <BaseButton type="submit" :loading="loading">
      {{ mode === 'login' ? 'Login' : 'Register' }}
    </BaseButton>
  </form>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
