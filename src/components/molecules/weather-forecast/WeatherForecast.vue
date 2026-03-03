<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatDate, isToday, getUVIndexLevel } from '@/utils/weather-mappings'
import type { DailyData } from '@/types/weather'

interface Props {
  daily: DailyData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  selectDay: [index: number]
}>()

const selectedDayIndex = ref(0)

const forecastDays = computed(() => {
  if (!props.daily?.time) return []

  return props.daily.time.slice(0, 7).map((date, index) => {
    const uvData = getUVIndexLevel(props.daily?.uv_index_max?.[index] ?? 0)
    return {
      date,
      index,
      formattedDate: formatDate(date),
      isToday: isToday(date),
      tempMax: props.daily?.temperature_2m_max?.[index] ?? 0,
      tempMin: props.daily?.temperature_2m_min?.[index] ?? 0,
      precipitation: props.daily?.precipitation_sum?.[index] ?? 0,
      uvIndex: props.daily?.uv_index_max?.[index] ?? 0,
      uvLevel: uvData.level,
    }
  })
})

const maxPrecip = computed(() => {
  if (!props.daily?.precipitation_sum) return 1
  const max = Math.max(...props.daily.precipitation_sum.slice(0, 7))
  return max > 0 ? max : 1
})

const maxUV = computed(() => {
  if (!props.daily?.uv_index_max) return 1
  const max = Math.max(...props.daily.uv_index_max.slice(0, 7))
  return max > 0 ? max : 1
})

const getPrecipWidth = (precip: number) => {
  return (precip / maxPrecip.value) * 100
}

const getUVWidth = (uv: number) => {
  return (uv / maxUV.value) * 100
}

const getDayIcon = (precipitation: number): string => {
  if (precipitation > 10) return '🌧️'
  if (precipitation > 0) return '🌦️'
  return '☀️'
}

const selectDay = (index: number) => {
  selectedDayIndex.value = index
  emit('selectDay', index)
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
        :class="{
          'weather-forecast__day--today': day.isToday,
          'weather-forecast__day--selected': day.index === selectedDayIndex
        }"
        @click="selectDay(day.index)"
      >
        <span class="weather-forecast__day-name">
          {{ day.isToday ? 'Hoy' : day.formattedDate }}
        </span>
        <span class="weather-forecast__day-icon">{{ getDayIcon(day.precipitation) }}</span>
        <div class="weather-forecast__temps">
          <span class="weather-forecast__temp-max">{{ day.tempMax?.toFixed(1) }}°</span>
          <span class="weather-forecast__temp-min">{{ day.tempMin?.toFixed(1) }}°</span>
        </div>
        <div class="weather-forecast__bar">
          <span class="weather-forecast__bar-label">🌧️</span>
          <div class="weather-forecast__bar-fill" :style="{ width: getPrecipWidth(day.precipitation) + '%' }"></div>
          <span class="weather-forecast__bar-value">{{ day.precipitation.toFixed(1) }}mm</span>
        </div>
        <div class="weather-forecast__bar">
          <span class="weather-forecast__bar-label">☀️</span>
          <div class="weather-forecast__bar-fill weather-forecast__bar-fill--uv" :style="{ width: getUVWidth(day.uvIndex) + '%' }"></div>
          <span class="weather-forecast__bar-value">{{ day.uvIndex.toFixed(1) }}</span>
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
  background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  border-radius: 16px;
  padding: 1.25rem;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
}

.weather-forecast__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.weather-forecast__loading,
.weather-forecast__empty {
  text-align: center;
  padding: 1rem;
  opacity: 0.9;
}

.weather-forecast__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
}

.weather-forecast__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.6rem 0.3rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.weather-forecast__day:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.weather-forecast__day--today {
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
}

.weather-forecast__day--selected {
  background: rgba(34, 197, 94, 0.3);
  border: 1.5px solid #22c55e;
}

.weather-forecast__day-name {
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  text-align: center;
}

.weather-forecast__day-icon {
  font-size: 1.2rem;
  margin: 0.1rem 0;
}

.weather-forecast__temps {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  align-items: baseline;
}

.weather-forecast__temp-max {
  font-weight: 700;
  color: white;
  font-size: 1rem;
}

.weather-forecast__temp-min {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
}

.weather-forecast__bar {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  font-size: 0.5rem;
}

.weather-forecast__bar-label {
  width: 12px;
  text-align: center;
}

.weather-forecast__bar-fill {
  flex: 1;
  height: 4px;
  background: rgba(59, 130, 246, 0.5);
  border-radius: 2px;
  min-width: 4px;
}

.weather-forecast__bar-fill--uv {
  background: rgba(251, 191, 36, 0.5);
}

.weather-forecast__bar-value {
  width: 22px;
  text-align: right;
  font-size: 0.45rem;
}

@media (max-width: 768px) {
  .weather-forecast {
    padding: 1rem;
  }

  .weather-forecast__list {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.35rem;
  }

  .weather-forecast__day {
    padding: 0.5rem 0.25rem;
    min-width: auto;
  }

  .weather-forecast__day-name {
    font-size: 0.6rem;
  }

  .weather-forecast__day-icon {
    font-size: 1rem;
  }

  .weather-forecast__temp-max {
    font-size: 0.8rem;
  }

  .weather-forecast__temp-min {
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .weather-forecast__list {
    grid-template-columns: repeat(2, 1fr);
  }

  .weather-forecast__day {
    gap: 0.2rem;
  }
}

@media (prefers-color-scheme: dark) {
  .weather-forecast {
    background: linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 100%);
  }
}
</style>
