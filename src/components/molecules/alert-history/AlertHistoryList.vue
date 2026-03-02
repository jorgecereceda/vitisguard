<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Alert, AlertCategory } from '@/types/alert'
import AlertHistoryItem from '@/components/atoms/AlertHistoryItem.vue'
import AlertHistoryFilters from './AlertHistoryFilters.vue'

interface Props {
  alerts: Alert[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

const emit = defineEmits<{
  'refresh': []
}>()

const selectedCategory = ref<string>('all')
const selectedPeriod = ref<string>('30d')

const filteredAlerts = computed(() => {
  let result = [...props.alerts]

  if (selectedCategory.value !== 'all') {
    result = result.filter((alert) => alert.category === selectedCategory.value)
  }

  if (selectedPeriod.value !== 'all') {
    const now = new Date()
    let pastDate: Date

    switch (selectedPeriod.value) {
      case '30d':
        pastDate = new Date(now.setDate(now.getDate() - 30))
        break
      case '6m':
        pastDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case '1y':
        pastDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        pastDate = new Date(0)
    }

    result = result.filter((alert) => new Date(alert.detectedAt) >= pastDate)
  }

  return result.sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  )
})

function handleCategoryChange(category: string) {
  selectedCategory.value = category
}

function handlePeriodChange(period: string) {
  selectedPeriod.value = period
}
</script>

<template>
  <div class="alert-history-list">
    <AlertHistoryFilters
      @update:category="handleCategoryChange"
      @update:period="handlePeriodChange"
    />

    <div v-if="loading" class="alert-history-list__loading">
      Cargando alertas...
    </div>

    <div v-else-if="error" class="alert-history-list__error">
      <p>{{ error }}</p>
      <button @click="emit('refresh')" class="alert-history-list__retry">
        Reintentar
      </button>
    </div>

    <div v-else-if="filteredAlerts.length === 0" class="alert-history-list__empty">
      <p>No se encontraron alertas para los filtros seleccionados.</p>
    </div>

    <div v-else class="alert-history-list__grid">
      <AlertHistoryItem
        v-for="alert in filteredAlerts"
        :key="alert.id"
        :alert="alert"
      />
    </div>
  </div>
</template>

<style scoped>
.alert-history-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.alert-history-list__loading,
.alert-history-list__error,
.alert-history-list__empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.alert-history-list__error {
  color: #dc2626;
}

.alert-history-list__retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.alert-history-list__retry:hover {
  background: #4338ca;
}

.alert-history-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
</style>
