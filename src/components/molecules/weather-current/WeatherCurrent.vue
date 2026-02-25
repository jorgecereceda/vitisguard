<script setup lang="ts">
import { computed } from 'vue'
import { getWeatherCondition, getWindDirection } from '@/utils/weather-mappings'
import type { CurrentData } from '@/types/weather'

interface Props {
  current: CurrentData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const weatherCondition = computed(() => {
  if (!props.current?.weather_code) return getWeatherCondition(0, true)
  return getWeatherCondition(props.current.weather_code, true)
})

const windDirection = computed(() => {
  if (!props.current?.wind_direction_10m) return 'N/A'
  return getWindDirection(props.current.wind_direction_10m)
})

const formattedTime = computed(() => {
  if (!props.current?.time) return ''
  return new Date(props.current.time).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <div class="weather-current">
    <div v-if="loading" class="weather-current__loading">
      Cargando...
    </div>
    <template v-else-if="current">
      <div class="weather-current__main">
        <span class="weather-current__icon">{{ weatherCondition.icon }}</span>
        <div class="weather-current__temp">
          <span class="weather-current__value">{{ current.temperature_2m?.toFixed(0) ?? '--' }}</span>
          <span class="weather-current__unit">°C</span>
        </div>
      </div>
      <p class="weather-current__description">{{ weatherCondition.description }}</p>
      <div class="weather-current__details">
        <span class="weather-current__detail">
          <span class="weather-current__detail-icon">🌡️</span>
          Sensación: {{ current.apparent_temperature?.toFixed(0) ?? '--' }}°C
        </span>
        <span class="weather-current__detail">
          <span class="weather-current__detail-icon">💨</span>
          {{ current.wind_speed_10m?.toFixed(0) ?? '--' }} km/h {{ windDirection }}
        </span>
        <span class="weather-current__detail">
          <span class="weather-current__detail-icon">💧</span>
          {{ current.relative_humidity_2m ?? '--' }}%
        </span>
      </div>
      <p class="weather-current__time">Actualizado: {{ formattedTime }}</p>
    </template>
    <div v-else class="weather-current__empty">
      Sin datos disponibles
    </div>
  </div>
</template>

<style scoped>
.weather-current {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.weather-current__loading,
.weather-current__empty {
  text-align: center;
  padding: 2rem;
  opacity: 0.8;
}

.weather-current__main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.weather-current__icon {
  font-size: 4rem;
  line-height: 1;
}

.weather-current__temp {
  display: flex;
  align-items: flex-start;
}

.weather-current__value {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
}

.weather-current__unit {
  font-size: 1.5rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.weather-current__description {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.weather-current__details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.weather-current__detail {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
}

.weather-current__detail-icon {
  font-size: 1rem;
}

.weather-current__time {
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 1rem;
  margin-bottom: 0;
}

@media (prefers-color-scheme: dark) {
  .weather-current {
    background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  }
}
</style>
