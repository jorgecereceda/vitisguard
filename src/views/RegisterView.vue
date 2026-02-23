<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '@/components/organisms/AuthCard.vue'
import AuthForm from '@/components/organisms/AuthForm.vue'
import AuthSwitch from '@/components/molecules/AuthSwitch.vue'

interface FormData {
  name: string
  email: string
  password: string
}

const router = useRouter()
const authStore = useAuthStore()

async function handleRegister(data: FormData) {
  try {
    await authStore.register(data.name, data.email, data.password)
    router.push('/login')
  } catch {
    // Error handled by store
  }
}
</script>

<template>
  <div class="register-view">
    <AuthCard title="Create Account">
      <AuthForm mode="register" :loading="authStore.isLoading" @submit="handleRegister" />
      <AuthSwitch
        text="Already have an account?"
        link-text="Login"
        to="/login"
      />
    </AuthCard>
  </div>
</template>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9fafb;
}

@media (max-width: 640px) {
  .register-view {
    padding: 0;
    background-color: #fff;
  }
}
</style>
