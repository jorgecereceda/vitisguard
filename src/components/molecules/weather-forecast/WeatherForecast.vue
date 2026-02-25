<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, isToday } from '@/utils/weather-mappings'
import type { DailyData } from '@/types/weather'

interface Props {
  daily: DailyData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const forecastDays = computed(() => {
  if (!props.daily?.time) return []

  return props.daily.time.slice(0, 7).map((date, index) => {
    return {
      date,
      formattedDate: formatDate(date),
      isToday: isToday(date),
      tempMax: props.daily?.temperature_2m_max?.[index] ?? 0,
      tempMin: props.daily?.temperature_2m_min?.[index] ?? 0,
      precipitation: props.daily?.precipitation_sum?.[index] ?? 0,
      uvIndex: props.daily?.uv_index_max?.[index] ?? 0,
    }
  })
})

const getDayIcon = (precipitation: number): string => {
  if (precipitation > 10) return '🌧️'
  if (precipitation > 0) return '🌦️'
  return '☀️'
}
</script>

<template>
  <div class="weather-forecast">
    <h3 class="weather-forecast__title">Pronóstico 7 días</h3>
    <div v-if="loading" class="weather-forecast__loading">
      Cargando...
    </div>
    <ul v-else-if="forecastDays.length > 0" class="weather-forecast__list">
      <li
        v-for="day in forecastDays"
        :key="day.date"
        class="weather-forecast__day"
        :class="{ 'weather-forecast__day--today': day.isToday }"
      >
        <span class="weather-forecast__day-name">
          {{ day.isToday ? 'Hoy' : day.formattedDate }}
        </span>
        <span class="weather-forecast__day-icon">{{ getDayIcon(day.precipitation) }}</span>
        <div class="weather-forecast__temps">
          <span class="weather-forecast__temp-max">{{ day.tempMax?.toFixed(0) }}°</span>
          <span class="weather-forecast__temp-min">{{ day.tempMin?.toFixed(0) }}°</span>
        </div>
        <div class="weather-forecast__precip" v-if="day.precipitation > 0">
          <span>🌧️</span>
          <span>{{ day.precipitation.toFixed(0) }}mm</span>
        </div>
      </li>
    </ul>
    <div v-else class="weather-forecast__empty">
      Sin datos de pronóstico disponibles
    </div>
  </div>
</template>

<style scoped>
.weather-forecast {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.weather-forecast__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.weather-forecast__loading,
.weather-forecast__empty {
  text-align: center;
  padding: 1.5rem;
  color: #6b7280;
}

.weather-forecast__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.weather-forecast__day {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.weather-forecast__day:hover {
  background-color: #f3f4f6;
}

.weather-forecast__day--today {
  background-color: #eff6ff;
}

.weather-forecast__day-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
  min-width: 70px;
}

.weather-forecast__day-icon {
  font-size: 1.5rem;
}

.weather-forecast__temps {
  display: flex;
  gap: 0.5rem;
  min-width: 60px;
  justify-content: flex-end;
}

.weather-forecast__temp-max {
  font-weight: 600;
  color: #1f2937;
}

.weather-forecast__temp-min {
  color: #6b7280;
}

.weather-forecast__precip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #3b82f6;
  min-width: 55px;
  justify-content: flex-end;
}

@media (prefers-color-scheme: dark) {
  .weather-forecast {
    background: #1f2937;
  }

  .weather-forecast__title {
    color: #f3f4f6;
  }

  .weather-forecast__day-name {
    color: #e5e7eb;
  }

  .weather-forecast__temp-max {
    color: #f3f4f6;
  }

  .weather-forecast__temp-min {
    color: #9ca3af;
  }
}
</style>
