<script setup lang="ts">
import { computed, watch } from 'vue'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import { useDiseaseDetection } from '@/composables/use-disease-detection'
import { generateWeatherAlerts, analyzeWeatherForecastRisks } from '@/utils/weather-alerts'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import AlertLevelPanel from '@/components/molecules/alert-level-panel/AlertLevelPanel.vue'
import TreatmentPanel from '@/components/molecules/treatment-panel/TreatmentPanel.vue'
import type { DiseaseType, WeatherAlertType, RiskLevel, WeatherConditions, DailyForecastData, DiseaseForecastRisk, WeatherForecastRisk } from '@/types/disease'

const weatherStore = useWeatherStore()
const { alerts, weatherData, weather, fetchWeather } = useWeather()
const { analyzeAllDiseases, analyzeForecastRisks } = useDiseaseDetection()

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

interface DiseaseRisk {
  id: string
  type: DiseaseType
  name: string
  level: RiskLevel
  probability: number
  conditions: string[]
}

const diseaseRisks = computed((): DiseaseRisk[] => {
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

const activeWeatherRisks = computed(() => {
  return weatherRisks.value.filter(r => r.isActive)
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

const forecastRisks = computed((): DiseaseForecastRisk[] => {
  const daily = weather.value?.daily
  const hourly = weather.value?.hourly

  if (!daily?.time || !hourly?.relative_humidity_2m) {
    return []
  }

  const forecast: DailyForecastData[] = daily.time.map((date, index) => {
    const humidityValues = hourly.relative_humidity_2m?.slice(index * 24, (index + 1) * 24) ?? []
    const avgHumidity = humidityValues.length > 0
      ? humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length
      : null

    return {
      date,
      temperature: daily.temperature_2m_mean?.[index] ?? null,
      humidity: avgHumidity,
      precipitation: daily.precipitation_sum?.[index] ?? null,
    }
  })

  return analyzeForecastRisks(forecast)
})

const weatherForecastRisks = computed((): WeatherForecastRisk[] => {
  const daily = weather.value?.daily

  if (!daily?.time) {
    return []
  }

  const forecast = daily.time.map((date, index) => ({
    date,
    tempMin: daily.temperature_2m_min?.[index] ?? null,
    tempMax: daily.temperature_2m_max?.[index] ?? null,
    precipitation: daily.precipitation_sum?.[index] ?? null,
    windSpeed: daily.wind_speed_10m_max?.[index] ?? null,
  }))

  return analyzeWeatherForecastRisks(forecast)
})
</script>

<template>
  <PannelLauyout>
    <div class="alerts-view">

      <div class="alerts-view__content-grid">
        <!-- SECCIÓN 1: Alertas Activas y Tratamientos -->
        <section class="alerts-view__section alerts-view__section--main">
          <h2 class="alerts-view__section-title">
            <span class="alerts-view__section-icon">🚨</span>
            Alertas Activas y Recomendaciones
          </h2>

          <TreatmentPanel
            :diseases="diseaseRisks"
            :weather-risks="weatherRisks"
            :active-alerts="alerts"
            :active-weather-risks="activeWeatherRisks"
          />
        </section>

        <!-- SECCIÓN 3: Condiciones Actuales y Riesgos -->
        <section class="alerts-view__section alerts-view__section--side">
          <h2 class="alerts-view__section-title">
            <span class="alerts-view__section-icon">🌡️</span>
            Condiciones Actuales
          </h2>

          <div v-if="weatherData" class="alerts-view__conditions">
            <h3 class="alerts-view__conditions-title">Metodología Actual</h3>
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
                <span class="condition-item__label">Lluvia</span>
                <span class="condition-item__value">{{ weatherData.precipitation.toFixed(1) }}mm</span>
              </div>
              <div class="condition-item">
                <span class="condition-item__label">Nubes</span>
                <span class="condition-item__value">{{ weatherData.cloudCover.toFixed(0) }}%</span>
              </div>
            </div>
          </div>

          <AlertLevelPanel
            :diseases="diseaseRisks"
            :weather-risks="weatherRisks"
          />
        </section>

        <!-- SECCIÓN 2: Pronóstico 7 Días -->
        <section class="alerts-view__section alerts-view__section--forecast">
          <h2 class="alerts-view__section-title">
            <span class="alerts-view__section-icon">📅</span>
            Pronóstico 7 Días
          </h2>

          <div v-if="forecastRisks.length > 0 || weatherForecastRisks.length > 0" class="alerts-view__forecast-panel">
            <div class="forecast-panel__sections">
              <div v-if="forecastRisks.length > 0" class="forecast-panel__section">
                <h4 class="forecast-panel__subtitle">Enfermedades</h4>
                <div class="forecast-risks-grid">
                  <div
                    v-for="risk in forecastRisks"
                    :key="risk.disease"
                    class="forecast-risk-card"
                    :class="{
                      'forecast-risk-card--high': risk.highRiskDays > 0 || risk.criticalRiskDays > 0,
                      'forecast-risk-card--critical': risk.criticalRiskDays > 0
                    }"
                  >
                    <div class="forecast-risk-card__name">{{ risk.name }}</div>
                    <div class="forecast-risk-card__days">
                      <span v-if="risk.criticalRiskDays > 0" class="forecast-risk-card__count critical">
                        {{ risk.criticalRiskDays }} día{{ risk.criticalRiskDays > 1 ? 's' : '' }} crítico{{ risk.criticalRiskDays > 1 ? 's' : '' }}
                      </span>
                      <span v-if="risk.highRiskDays > 0" class="forecast-risk-card__count high">
                        {{ risk.highRiskDays }} día{{ risk.highRiskDays > 1 ? 's' : '' }} con riesgo alto
                      </span>
                      <span v-if="risk.criticalRiskDays === 0 && risk.highRiskDays === 0" class="forecast-risk-card__count low">
                        Sin riesgo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="weatherForecastRisks.length > 0" class="forecast-panel__section">
                <h4 class="forecast-panel__subtitle">Riesgos Climáticos</h4>
                <div class="forecast-risks-grid">
                  <div
                    v-for="risk in weatherForecastRisks"
                    :key="risk.type"
                    class="forecast-risk-card"
                    :class="{
                      'forecast-risk-card--high': risk.highRiskDays > 0 || risk.criticalRiskDays > 0,
                      'forecast-risk-card--critical': risk.criticalRiskDays > 0
                    }"
                  >
                    <div class="forecast-risk-card__name">{{ risk.name }}</div>
                    <div class="forecast-risk-card__days">
                      <span v-if="risk.criticalRiskDays > 0" class="forecast-risk-card__count critical">
                        {{ risk.criticalRiskDays }} día{{ risk.criticalRiskDays > 1 ? 's' : '' }} crítico{{ risk.criticalRiskDays > 1 ? 's' : '' }}
                      </span>
                      <span v-if="risk.highRiskDays > 0" class="forecast-risk-card__count high">
                        {{ risk.highRiskDays > 0 ? risk.highRiskDays : 0 }} día{{ risk.highRiskDays > 1 ? 's' : '' }} con riesgo alto
                      </span>
                      <span v-if="risk.criticalRiskDays === 0 && risk.highRiskDays === 0" class="forecast-risk-card__count low">
                        Sin riesgo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </PannelLauyout>
</template>

<style scoped>
.alerts-view {
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


.alerts-view__content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.alerts-view__section {
  background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* Semaforo Colors Planos */
.status-green {
  background-color: rgba(34, 197, 94, 0.15) !important;
  border-color: rgba(34, 197, 94, 0.4) !important;
}

.status-yellow {
  background-color: rgba(234, 179, 8, 0.2) !important;
  border-color: rgba(234, 179, 8, 0.5) !important;
}

.status-red {
  background-color: rgba(239, 68, 68, 0.25) !important;
  border-color: rgba(239, 68, 68, 0.5) !important;
}

.alerts-view__section--main {
  grid-column: 1 / -1;
}

.alerts-view__section--side {
  grid-column: 1;
}

.alerts-view__section--forecast {
  grid-column: 2;
}

.alerts-view__section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.alerts-view__section-icon {
  font-size: 1.5rem;
}

.alerts-view__conditions {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.alerts-view__conditions-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: #94a3b8;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.alerts-view__conditions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.condition-item {
  text-align: left;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.condition-item__label {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.condition-item__value {
  display: block;
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}

.alerts-view__forecast-panel {
  background: transparent;
}

.forecast-panel__sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.forecast-panel__subtitle {
  font-size: 0.8rem;
  font-weight: 800;
  color: #94a3b8;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.forecast-risks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.forecast-risk-card {
  padding: 1.25rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(34, 197, 94, 0.3);
  transition: all 0.3s ease;
}

.forecast-risk-card:hover {
  transform: translateY(-3px);
  background: rgba(15, 23, 42, 0.6);
}

.forecast-risk-card--high {
  border-color: rgba(245, 158, 11, 0.4);
}

.forecast-risk-card--critical {
  border-color: rgba(239, 68, 68, 0.4);
}

.forecast-risk-card__name {
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.forecast-risk-card__days {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.forecast-risk-card__count {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
}

.forecast-risk-card__count.critical {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.forecast-risk-card__count.high {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.forecast-risk-card__count.low {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .alerts-view__content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .alerts-view__section--main,
  .alerts-view__section--side,
  .alerts-view__section--forecast {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .alerts-view {
    padding: 1rem;
    gap: 1rem;
  }

  .alerts-view__section {
    padding: 1.25rem;
  }

  .forecast-risks-grid {
    grid-template-columns: 1fr;
  }

  .alerts-view__conditions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
