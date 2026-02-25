<script setup lang="ts">
import { watch } from 'vue'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import DataCard from '@/components/atoms/DataCard.vue'
import PannelLauyout from '@/layout/PannelLauyout.vue'

const weatherStore = useWeatherStore()
const { weatherData, isLoading: isWeatherLoading, error: weatherError, fetchWeather } = useWeather()

// Watch for coordinate changes in the store to fetch weather
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
</script>

<template>
  <PannelLauyout>
    <div class="dashboard">
      <header class="dashboard__header">
        <h1 class="dashboard__title">VitisGuard Dashboard</h1>
        <p class="dashboard__subtitle">Monitoreo y Alerta Temprana en Tiempo Real</p>
        <div class="dashboard__location">
          Ubicación: {{ weatherStore.userLocation.name }} ({{ weatherStore.userLocation.latitude.toFixed(4) }}, {{ weatherStore.userLocation.longitude.toFixed(4) }})
        </div>
      </header>

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

      <div v-else-if="weatherData" class="dashboard__grid">
        <!-- Metrics Cards Scenario 1 + Missing Metrics -->
        <DataCard
          label="Temperatura Aire"
          :value="weatherData.temperature"
          unit="°C"
          icon="🌡️"
        />
        <DataCard
          label="Humedad Aire"
          :value="weatherData.humidity"
          unit="%"
          icon="💧"
        />
        <DataCard
          label="Humedad Suelo"
          :value="weatherData.soilHumidity"
          unit="%"
          icon="🌱"
        />
        <DataCard
          label="Precipitación"
          :value="weatherData.precipitation"
          unit="mm"
          icon="🌧️"
        />
        <DataCard
          label="Evapotranspiración"
          :value="weatherData.et0.toFixed(2)"
          unit="mm"
          icon="☀️"
        />
        <DataCard
          label="Cobertura Nubes"
          :value="weatherData.cloudCover"
          unit="%"
          icon="☁️"
        />
        <DataCard
          label="Horas de Sol"
          :value="(weatherData.sunshineDuration / 3600).toFixed(1)"
          unit="h"
          icon="⌛"
        />
      </div>
    </main>
  </div>

  </PannelLauyout>

</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #2c3e50;
}

.dashboard__header {
  margin-bottom: 3rem;
  text-align: center;
}

.dashboard__title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dashboard__subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.dashboard__alerts {
  background: #fff5f5;
  border-left: 5px solid #e53e3e;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.dashboard__alerts-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #c53030;
  margin-bottom: 1rem;
}

.dashboard__alerts-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard__alert-item {
  color: #9b2c2c;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard__alert-item::before {
  content: "•";
  font-weight: bold;
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

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .dashboard {
    color: #ecf0f1;
  }
  .dashboard__alerts {
    background: rgba(197, 48, 48, 0.1);
  }
}

.dashboard__location {
  font-size: 1.2rem;
  font-weight: 700;
  color: #27ae60;
  margin-bottom: 1rem;
}
</style>
