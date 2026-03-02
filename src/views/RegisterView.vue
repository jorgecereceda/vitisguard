<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
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
const { showError } = useToast()

async function handleRegister(data: FormData) {
  try {
    await authStore.register(data.name, data.email, data.password)
    router.push('/login')
  } catch {
    if (authStore.error) {
      showError(authStore.error)
      authStore.clearError()
    }
  }
}
</script>

<template>
  <AuthLayout>
    <div class="register-view">
      <AuthCard title="Create Account">
        <AuthForm mode="register" :loading="authStore.isLoading" @submit="handleRegister" />
        <br>
        <AuthSwitch
          text="Already have an account?"
          link-text="Login"
          to="/login"
        />
      </AuthCard>
    </div>
  </AuthLayout>
</template>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

@media (max-width: 640px) {
  .register-view {
    padding: 0;

  }
}
</style>
