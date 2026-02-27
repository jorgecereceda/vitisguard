<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import WeatherCurrent from '@/components/molecules/weather-current/WeatherCurrent.vue'
import WeatherForecast from '@/components/molecules/weather-forecast/WeatherForecast.vue'
import EvapotranspirationCard from '@/components/molecules/evapotranspiration-card/EvapotranspirationCard.vue'
import SoilMoistureCard from '@/components/molecules/SoilMoistureCard.vue'

const weatherStore = useWeatherStore()
const { weather, weatherData, isLoading: isWeatherLoading, error: weatherError, fetchWeather } = useWeather()

const selectedDayIndex = ref(0)

onMounted(() => {
  weatherStore.loadParcels()
})

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
    humidity: avgHumidity,
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
  }
})

const handleSelectDay = (index: number) => {
  selectedDayIndex.value = index
}

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

        <!-- Main Content -->
        <div v-else-if="weatherData" class="dashboard__weather-container">
          <div class="dashboard__cards">
            <!-- Weather Current Section -->
            <section class="dashboard__weather-main">
              <WeatherCurrent
                :current="currentData()"
                :hourly="selectedDayIndex === 0 ? hourlyData() : selectedDayForecast"
                :selected-day="selectedDayData"
                :sunshine-duration="sunshineDuration"
                :is-today="selectedDayIndex === 0"
                :loading="isWeatherLoading"
              />
            </section>

            <!-- Main Forecast -->
            <WeatherForecast
              :daily="dailyData()"
              :selected-index="selectedDayIndex"
              @select-day="handleSelectDay"
            />

            <!-- Metrics Cards -->
            <div class="dashboard__grid">
              <SoilMoistureCard
                v-if="weatherData && weatherData.allDaysSoilMoisture"
                :levels="weatherData.allDaysSoilMoisture[selectedDayIndex]"
              />
              <EvapotranspirationCard
                v-if="selectedDayData"
                :et0="selectedDayData.et0"
                :precipitation="selectedDayData.precipitation"
                :humidity="selectedDayData.humidity"
                :soilMoisture40_60="weatherData?.allDaysSoilMoisture?.[selectedDayIndex]?.depth40 ?? 0"
                :selectedDO="weatherStore.selectedParcel?.denomination ?? 'Getaria'"
              />
            </div>
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

.dashboard__retry-btn:active {
  transform: translateY(0);
}

/* DO Selector Bar Styling */
.do-selector-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.75rem;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.do-selector-bar__label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.15em;
}

.do-selector-bar__options {
  display: flex;
  gap: 0.75rem;
}

.do-option {
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
}

.do-option:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.02);
}

.do-option--active {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  transform: scale(1.05);
}

.do-selector-bar__info {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.do-selector-bar__info::before {
  content: '📍';
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard__weather-main {
    grid-template-columns: 1fr;
  }
  .do-selector-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
  }
  .do-selector-bar__info {
    margin-left: 0;
  }
}
</style>
