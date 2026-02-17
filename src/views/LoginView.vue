<script setup lang="ts">
import { ref } from 'vue'
import AuthCard from '@/components/organisms/AuthCard.vue'
import AuthForm from '@/components/organisms/AuthForm.vue'
import AuthSwitch from '@/components/molecules/AuthSwitch.vue'

interface FormData {
  name: string
  email: string
  password: string
}

const loading = ref(false)

function handleLogin(data: FormData) {
  loading.value = true
  console.log('Login submitted:', data)
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="login-view">
    <AuthCard title="Welcome Back">
      <AuthForm mode="login" :loading="loading" @submit="handleLogin" />
      <br>
      <AuthSwitch
        text="Don't have an account?"
        link-text="Register"
        to="/register"
      />
    </AuthCard>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9fafb;
}

@media (max-width: 640px) {
  .login-view {
    padding: 0;
    background-color: #fff;
  }
}
</style>
