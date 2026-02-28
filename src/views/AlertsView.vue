<script setup lang="ts">
import { computed, watch } from 'vue'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import { useDiseaseDetection } from '@/composables/use-disease-detection'
import { generateWeatherAlerts } from '@/utils/weather-alerts'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import AlertLevelPanel from '@/components/molecules/alert-level-panel/AlertLevelPanel.vue'
import TreatmentPanel from '@/components/molecules/treatment-panel/TreatmentPanel.vue'
import type { DiseaseType, WeatherAlertType, RiskLevel, WeatherConditions } from '@/types/disease'

const weatherStore = useWeatherStore()
const { alerts, weatherData, weather, fetchWeather } = useWeather()
const { analyzeAllDiseases } = useDiseaseDetection()

const diseaseNames: Record<DiseaseType, string> = {
  mildiu: 'Mildiú',
  botrytis: 'Botrytis',
  oidio: 'Oídio',
  excoriosis: 'Excoriosis',
}

const weatherRiskNames: Record<WeatherAlertType, string> = {
  frost: 'Helada',
  lateFrost: 'Helada Tardía',
  heatwave: 'Ola de Calor',
  storm: 'Tormenta',
  drought: 'Sequía',
  excessiveRain: 'Exceso de Lluvia',
}

watch(
  () => [weatherStore.userLocation.latitude, weatherStore.userLocation.longitude],
  ([lat, lon]) => {
    if (typeof lat === 'number' && typeof lon === 'number') {
      fetchWeather(lat, lon)
    }
  },
  { immediate: true }
)

const locationName = computed(() => weatherStore.userLocation.name)

const currentConditions = computed((): WeatherConditions => {
  if (!weather.value?.current) {
    return {
      temperature: null,
      humidity: null,
      precipitation: null,
      soilMoisture: null,
      soilTemperature: null,
      sunshineHours: null,
      windSpeed: null,
    }
  }
  const current = weather.value.current
  const hourly = weather.value.hourly
  return {
    temperature: current.temperature_2m ?? null,
    humidity: current.relative_humidity_2m ?? null,
    precipitation: current.precipitation ?? null,
    soilMoisture: hourly?.soil_moisture_0_to_7cm?.[0] ?? null,
    soilTemperature: hourly?.soil_temperature_0_to_7cm?.[0] ?? null,
    sunshineHours: hourly?.sunshine_duration?.[0] ?? null,
    windSpeed: current.wind_speed_10m ?? null,
  }
})

const diseaseRisks = computed(() => {
  const conditions = currentConditions.value
  return analyzeAllDiseases(conditions).map(risk => ({
    id: `disease-${risk.disease}`,
    type: risk.disease,
    name: diseaseNames[risk.disease],
    level: risk.level,
    probability: risk.probability,
    conditions: risk.conditions,
  }))
})

const weatherRiskTypes: WeatherAlertType[] = ['frost', 'heatwave', 'storm', 'drought', 'excessiveRain']

const weatherRisks = computed(() => {
  const conditions = currentConditions.value
  const daily = weather.value?.daily

  const weatherAlerts = generateWeatherAlerts(
    conditions.temperature,
    conditions.humidity,
    conditions.precipitation,
    conditions.windSpeed,
    daily?.temperature_2m_min?.[0] ?? null,
    daily?.temperature_2m_max?.[0] ?? null,
    conditions.soilMoisture
  )

  return weatherRiskTypes.map(type => {
    const alert = weatherAlerts.find(a => a.type === type)

    const isActive = alert !== undefined && alert.level !== 'low' && alert.level !== 'medium'
    const level = alert?.level ?? 'low'
    const conditionsList = alert?.description ? [alert.description] : []

    return {
      id: `weather-${type}`,
      type,
      name: weatherRiskNames[type],
      level,
      conditions: conditionsList,
      isActive,
    }
  })
})
</script>

<template>
  <PannelLauyout>
  <div class="alerts-view">
    <header class="alerts-view__header">
      <h1 class="alerts-view__title">⚠️ Alertas de Riesgo</h1>
      <p class="alerts-view__location">📍 {{ locationName }}</p>
    </header>

    <!-- Alerts Section - Dashboard Style -->
    <section v-if="alerts.length > 0" class="alerts-view__alerts">
      <h2 class="alerts-view__alerts-title">Alertas Activas ({{ alerts.length }})</h2>
      <ul class="alerts-view__alerts-list">
        <li v-for="(alert, index) in alerts" :key="index" class="alerts-view__alert-item">
          {{ alert }}
        </li>
      </ul>
    </section>

    <div v-else class="alerts-view__empty">
      <div class="alerts-view__empty-icon">✅</div>
      <h2 class="alerts-view__empty-title">Sin alertas activas</h2>
      <p class="alerts-view__empty-text">
        Las condiciones climáticas actuales no presentan riesgos para tus viñedos.
      </p>
    </div>

    <section v-if="weatherData" class="alerts-view__conditions">
      <h3 class="alerts-view__conditions-title">Condiciones actuales</h3>
      <div class="alerts-view__conditions-grid">
        <div class="condition-item">
          <span class="condition-item__label">Temperatura</span>
          <span class="condition-item__value">{{ weatherData.temperature.toFixed(1) }}°C</span>
        </div>
        <div class="condition-item">
          <span class="condition-item__label">Humedad</span>
          <span class="condition-item__value">{{ weatherData.humidity.toFixed(0) }}%</span>
        </div>
        <div class="condition-item">
          <span class="condition-item__label">Precipitación</span>
          <span class="condition-item__value">{{ weatherData.precipitation.toFixed(1) }} mm</span>
        </div>
        <div class="condition-item">
          <span class="condition-item__label">Nubosidad</span>
          <span class="condition-item__value">{{ weatherData.cloudCover.toFixed(0) }}%</span>
        </div>
      </div>
    </section>

    <AlertLevelPanel
      :diseases="diseaseRisks"
      :weather-risks="weatherRisks"
    />

    <TreatmentPanel
      :diseases="diseaseRisks"
      :weather-risks="weatherRisks"
    />

  </div>
  </PannelLauyout>
</template>

<style scoped>
.alerts-view {
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #2c3e50;
}

.alerts-view__header {
  margin-bottom: 2rem;
}

.alerts-view__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.alerts-view__location {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.alerts-view__alerts {
  background: #fff5f5;
  border-left: 5px solid #e53e3e;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.alerts-view__alerts-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #c53030;
  margin-bottom: 1rem;
}

.alerts-view__alerts-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alerts-view__alert-item {
  color: #9b2c2c;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alerts-view__alert-item::before {
  content: "•";
  font-weight: bold;
}

.alerts-view__empty {
  text-align: center;
  padding: 3rem;
  background: #f0fdf4;
  border-left: 5px solid #22c55e;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.alerts-view__empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.alerts-view__empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #16a34a;
  margin: 0 0 0.5rem;
}

.alerts-view__empty-text {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.alerts-view__conditions {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.alerts-view__conditions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem;
}

.alerts-view__conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.condition-item {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.condition-item__label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.condition-item__value {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

@media (max-width: 768px) {
  .alerts-view {
    padding: 1rem;
  }

  .alerts-view__title {
    font-size: 1.5rem;
  }
}
</style>
