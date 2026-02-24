<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '@/components/organisms/AuthCard.vue'
import AuthForm from '@/components/organisms/AuthForm.vue'
import AuthSwitch from '@/components/molecules/AuthSwitch.vue'
import AuthLayout from '@/layout/AuthLayout.vue'

interface FormData {
  name: string
  email: string
  password: string
}

const router = useRouter()
const authStore = useAuthStore()

async function handleLogin(data: FormData) {
  try {
    await authStore.login(data.email, data.password)
    router.push('/dashboard')
  } catch {
    // Error handled by store
  }
}
</script>

<template>
  <AuthLayout>
    <div class="login-view">
      <AuthCard title="Welcome Back">
        <AuthForm mode="login" :loading="authStore.isLoading" @submit="handleLogin" />
        <br>
        <AuthSwitch
          text="Don't have an account?"
          link-text="Register"
          to="/register"
        />
      </AuthCard>
    </div>
  </AuthLayout>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

@media (max-width: 640px) {
  .login-view {
    padding: 0;
  }
}
</style>
