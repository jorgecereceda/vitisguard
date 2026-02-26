<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import { getWindDirection, getUVIndexLevel, getWeatherCondition } from '@/utils/weather-mappings'
import DataCard from '@/components/atoms/DataCard.vue'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import WeatherCurrent from '@/components/molecules/weather-current/WeatherCurrent.vue'
import WeatherForecast from '@/components/molecules/weather-forecast/WeatherForecast.vue'
import EvapotranspirationCard from '@/components/molecules/evapotranspiration-card/EvapotranspirationCard.vue'

const weatherStore = useWeatherStore()
const { weather, weatherData, isLoading: isWeatherLoading, error: weatherError, fetchWeather } = useWeather()

const selectedDayIndex = ref(0)

watch(
  () => [weatherStore.userLocation.latitude, weatherStore.userLocation.longitude],
  ([lat, lon]) => {
    if (typeof lat === 'number' && typeof lon === 'number') {
      fetchWeather(lat, lon)
    }
  },
  { immediate: true }
)

const retryFetch = () => {
  if (weatherStore.userLocation.latitude && weatherStore.userLocation.longitude) {
    fetchWeather(weatherStore.userLocation.latitude, weatherStore.userLocation.longitude)
  }
}

const currentData = () => weather.value?.current ?? null
const dailyData = () => weather.value?.daily ?? null
const hourlyData = () => weather.value?.hourly ?? null

const selectedDayData = computed(() => {
  if (!weather.value?.daily) return null
  
  const dayStart = selectedDayIndex.value * 24
  const dayEnd = dayStart + 24
  
  const hourlyHumidity = weather.value.hourly.relative_humidity_2m?.slice(dayStart, dayEnd) ?? []
  const avgHumidity = hourlyHumidity.length > 0 
    ? hourlyHumidity.reduce((a, b) => a + b, 0) / hourlyHumidity.length 
    : 0

  return {
    tempMax: weather.value.daily.temperature_2m_max?.[selectedDayIndex.value] ?? 0,
    tempMin: weather.value.daily.temperature_2m_min?.[selectedDayIndex.value] ?? 0,
    apparentTempMax: weather.value.daily.temperature_2m_max?.[selectedDayIndex.value] ?? 0,
    apparentTempMin: weather.value.daily.temperature_2m_min?.[selectedDayIndex.value] ?? 0,
    precipitation: weather.value.daily.precipitation_sum?.[selectedDayIndex.value] ?? 0,
    windSpeedMax: weather.value.daily.wind_speed_10m_max?.[selectedDayIndex.value] ?? 0,
    uvIndex: weather.value.daily.uv_index_max?.[selectedDayIndex.value] ?? 0,
    cloudCover: selectedDayIndex.value === 0 
      ? (weather.value.current?.cloud_cover ?? 0) 
      : null,
    et0: weather.value.daily.et0_fao_evapotranspiration?.[selectedDayIndex.value] ?? 0,
    humidity: selectedDayIndex.value === 0 
      ? (weather.value.current?.relative_humidity_2m ?? 0)
      : avgHumidity,
  }
})

const selectedDayForecast = computed(() => {
  if (!weather.value?.hourly || !weather.value?.daily) return null
  
  const dayStart = selectedDayIndex.value * 24
  const dayEnd = dayStart + 24
  
  return {
    time: weather.value.hourly.time?.slice(dayStart, dayEnd) ?? [],
    temperature_2m: weather.value.hourly.temperature_2m?.slice(dayStart, dayEnd) ?? [],
    relative_humidity_2m: weather.value.hourly.relative_humidity_2m?.slice(dayStart, dayEnd) ?? [],
    apparent_temperature: weather.value.hourly.apparent_temperature?.slice(dayStart, dayEnd) ?? [],
    cloud_cover: weather.value.hourly.cloud_cover?.slice(dayStart, dayEnd) ?? [],
    precipitation: weather.value.hourly.precipitation?.slice(dayStart, dayEnd) ?? [],
    wind_speed_10m: weather.value.hourly.wind_speed_10m?.slice(dayStart, dayEnd) ?? [],
    wind_direction_10m: weather.value.hourly.wind_direction_10m?.slice(dayStart, dayEnd) ?? [],
    uv_index: weather.value.hourly.uv_index?.slice(dayStart, dayEnd) ?? [],
  } as any
})

const handleSelectDay = (index: number) => {
  selectedDayIndex.value = index
}

const windSpeed = () => weather.value?.current?.wind_speed_10m?.toFixed(0) ?? '--'

const windDirection = () => {
  const dir = weather.value?.current?.wind_direction_10m
  return dir !== undefined ? getWindDirection(dir) : 'N/A'
}

const uvIndex = () => weather.value?.daily?.uv_index_max?.[0] ?? 0
const uvLevel = () => getUVIndexLevel(uvIndex())

const sunshineDuration = computed(() => {
  return weather.value?.daily?.sunshine_duration?.[selectedDayIndex.value] ?? 0
})
</script>

<template>
  <PannelLauyout>
    <div class="dashboard">
      <main class="dashboard__content">
        <!-- Loading state -->
        <div v-if="isWeatherLoading" class="dashboard__loading">
          Cargando datos meteorológicos...
        </div>

        <!-- Error Handling -->
        <div v-else-if="weatherError" class="dashboard__error">
          <p>{{ weatherError.message || weatherError }}</p>
          <button @click="retryFetch" class="dashboard__retry-btn">Reintentar</button>
        </div>

        <div v-else-if="weatherData" class="dashboard__weather">
          <!-- Weather Current & Forecast Section -->
          <section class="dashboard__weather-main">
            <WeatherCurrent 
              :current="currentData()" 
              :hourly="selectedDayIndex === 0 ? hourlyData() : selectedDayForecast" 
              :selected-day="selectedDayData"
              :sunshine-duration="sunshineDuration"
              :is-today="selectedDayIndex === 0"
              :loading="isWeatherLoading" 
            />
            <WeatherForecast 
              :daily="dailyData()" 
              :loading="isWeatherLoading"
              @select-day="handleSelectDay"
            />
          </section>

          <!-- Metrics Cards -->
          <div class="dashboard__grid">
            <DataCard
              label="Humedad Suelo"
              :value="weatherData.soilHumidity"
              unit="%"
              icon="🌱"
            />
            <EvapotranspirationCard
              v-if="selectedDayData"
              :et0="selectedDayData.et0"
              :precipitation="selectedDayData.precipitation"
              :humidity="selectedDayData.humidity"
            />
          </div>
        </div>


      </main>
    </div>

  </PannelLauyout>

</template>

<style scoped>
.dashboard {
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #2c3e50;
}

.dashboard__weather {
  margin-bottom: 2rem;
}

.dashboard__weather-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}




.dashboard__loading, .dashboard__error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.dashboard__retry-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard__weather-main {
    grid-template-columns: 1fr;
  }
}
</style>
