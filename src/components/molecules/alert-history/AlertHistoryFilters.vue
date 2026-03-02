<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'

interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:category': [value: string]
  'update:period': [value: string]
}>()

const categories = [
  { label: 'Todas las categorías', value: 'all' },
  { label: 'Enfermedades', value: 'disease' },
  { label: 'Clima', value: 'weather' },
  { label: 'Riego', value: 'irrigation' }
]

const periods = [
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 6 meses', value: '6m' },
  { label: 'Último año', value: '1y' },
  { label: 'Todo', value: 'all' }
]

const selectedCategory = ref('all')
const selectedPeriod = ref('30d')

watch(selectedCategory, (value) => {
  emit('update:category', value)
})

watch(selectedPeriod, (value) => {
  emit('update:period', value)
})
</script>

<template>
  <div class="alert-history-filters">
    <BaseSelect
      id="category-filter"
      name="category"
      v-model="selectedCategory"
      :options="categories"
      :disabled="disabled"
    />
    <BaseSelect
      id="period-filter"
      name="period"
      v-model="selectedPeriod"
      :options="periods"
      :disabled="disabled"
    />
  </div>
</template>

<style scoped>
.alert-history-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.alert-history-filters > * {
  min-width: 180px;
}
</style>
