<script setup lang="ts">
import { computed } from 'vue'
import { DataCard, DataCardHeader, DataCardValue, DataCardUnit } from '@/components/atoms/data-card'
import type { CurrentData } from '@/types/weather'

export type MetricType =
  | 'temperature'
  | 'humidity'
  | 'soilTemperature'
  | 'soilMoisture'
  | 'precipitation'
  | 'evapotranspiration'
  | 'windSpeed'
  | 'cloudCover'
  | 'sunshine'

interface Props {
  type: MetricType
  data: CurrentData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const metricConfig = computed(() => {
  const configs: Record<MetricType, { title: string; unit: string; icon: string; decimals: number; key: keyof CurrentData }> = {
    temperature: { title: 'Temperatura', unit: '°C', icon: '🌡️', decimals: 1, key: 'temperature_2m' },
    humidity: { title: 'Humedad Ambiental', unit: '%', icon: '💧', decimals: 0, key: 'relative_humidity_2m' },
    soilTemperature: { title: 'Temperatura Suelo', unit: '°C', icon: '🌱', decimals: 1, key: 'temperature_2m' },
    soilMoisture: { title: 'Humedad Suelo', unit: '%', icon: '🪴', decimals: 0, key: 'relative_humidity_2m' },
    precipitation: { title: 'Precipitación', unit: 'mm', icon: '🌧️', decimals: 1, key: 'precipitation' },
    evapotranspiration: { title: 'Evapotranspiración', unit: 'mm', icon: '☀️', decimals: 2, key: 'precipitation' },
    windSpeed: { title: 'Velocidad Viento', unit: 'km/h', icon: '💨', decimals: 1, key: 'wind_speed_10m' },
    cloudCover: { title: 'Nubosidad', unit: '%', icon: '☁️', decimals: 0, key: 'cloud_cover' },
    sunshine: { title: 'Horas Sol', unit: 'h', icon: '🌞', decimals: 1, key: 'precipitation' },
  }
  return configs[props.type]
})

const currentValue = computed(() => {
  if (!props.data) return null
  const value = props.data[metricConfig.value.key as keyof CurrentData]
  return typeof value === 'number' ? value : null
})

const status = computed(() => {
  if (!currentValue.value) return 'normal'
  
  switch (props.type) {
    case 'temperature':
      if (currentValue.value < 0 || currentValue.value > 35) return 'danger'
      if (currentValue.value < 5 || currentValue.value > 30) return 'warning'
      return 'normal'
    case 'humidity':
      if (currentValue.value > 90) return 'danger'
      if (currentValue.value > 80) return 'warning'
      return 'normal'
    case 'precipitation':
      if (currentValue.value > 50) return 'danger'
      if (currentValue.value > 20) return 'warning'
      return 'normal'
    default:
      return 'normal'
  }
})
</script>

<template>
  <DataCard :title="metricConfig.title" :status="status" :loading="loading">
    <template #header>
      <DataCardHeader :title="metricConfig.title" :icon="metricConfig.icon" />
    </template>

    <div class="weather-metric-card__value">
      <DataCardValue :value="currentValue" :decimals="metricConfig.decimals" />
      <DataCardUnit :unit="metricConfig.unit" />
    </div>

    <template #footer>
      <slot name="footer"></slot>
    </template>
  </DataCard>
</template>

<style scoped>
.weather-metric-card__value {
  display: flex;
  align-items: baseline;
}
</style>
