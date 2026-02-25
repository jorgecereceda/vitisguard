<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWeather } from '@/composables/use-weather'
import { useWeatherStore } from '@/stores/weather'
import PannelLauyout from '@/layout/PannelLauyout.vue'

const router = useRouter()
const weatherStore = useWeatherStore()
const { alerts, weatherData, fetchWeather } = useWeather()

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

interface AlertInfo {
  type: 'mildew' | 'botrytis' | 'frost' | 'heat'
  title: string
  message: string
  icon: string
  color: string
  bgColor: string
}

const getAlertInfo = (alertText: string): AlertInfo => {
  if (alertText.includes('Mildiú')) {
    return {
      type: 'mildew',
      title: 'Riesgo de Mildiú',
      message: 'Humedad alta y temperaturas moderadas favorecen el desarrollo del hongo.',
      icon: '🍄',
      color: '#d97706',
      bgColor: '#fef3c7'
    }
  }
  if (alertText.includes('Botrytis')) {
    return {
      type: 'botrytis',
      title: 'Riesgo de Botrytis',
      message: 'Niveles de humedad críticos detectados. Alto riesgo de podredumbre gris.',
      icon: '🍇',
      color: '#7c2d12',
      bgColor: '#fed7aa'
    }
  }
  if (alertText.includes('Helada')) {
    return {
      type: 'frost',
      title: 'Riesgo de Helada',
      message: 'Temperaturas bajo cero detectadas. Protección antiheladas recomendada.',
      icon: '❄️',
      color: '#0369a1',
      bgColor: '#e0f2fe'
    }
  }
  if (alertText.includes('calor')) {
    return {
      type: 'heat',
      title: 'Riesgo de Ola de Calor',
      message: 'Temperaturas extremadamente altas. Asegurar riego adecuado.',
      icon: '🔥',
      color: '#dc2626',
      bgColor: '#fee2e2'
    }
  }
  return {
    type: 'mildew',
    title: 'Alerta',
    message: alertText,
    icon: '⚠️',
    color: '#7c2d12',
    bgColor: '#fed7aa'
  }
}

const alertsWithInfo = computed(() => {
  return alerts.value.map(alertText => ({
    text: alertText,
    ...getAlertInfo(alertText)
  }))
})

const goToDashboard = () => {
  router.push('/')
}
</script>

<template>
  <PannelLauyout>
 <div class="alerts-view">
    <header class="alerts-view__header">
      <div class="alerts-view__header-content">
        <h1 class="alerts-view__title">⚠️ Alertas de Riesgo</h1>
        <p class="alerts-view__location">📍 {{ locationName }}</p>
      </div>
      <div class="alerts-view__badge" :class="{ 'alerts-view__badge--active': alerts.length > 0 }">
        {{ alerts.length }} {{ alerts.length === 1 ? 'alerta activa' : 'alertas activas' }}
      </div>
    </header>

    <div v-if="alerts.length > 0" class="alerts-view__grid">
      <article
        v-for="(alert, index) in alertsWithInfo"
        :key="index"
        class="alert-card"
        :style="{ '--alert-color': alert.color, '--alert-bg': alert.bgColor }"
      >
        <div class="alert-card__header">
          <span class="alert-card__icon">{{ alert.icon }}</span>
          <h2 class="alert-card__title">{{ alert.title }}</h2>
        </div>
        <p class="alert-card__message">{{ alert.message }}</p>
        <div class="alert-card__details">
          <p class="alert-card__full-text">{{ alert.text }}</p>
        </div>
      </article>
    </div>

    <div v-else class="alerts-view__empty">
      <div class="alerts-view__empty-icon">✅</div>
      <h2 class="alerts-view__empty-title">Sin alertas activas</h2>
      <p class="alerts-view__empty-text">
        Las condiciones climáticas actuales no presentan riesgos para tus viñedos.
      </p>
      <button class="alerts-view__back-btn" @click="goToDashboard">
        Volver al Dashboard
      </button>
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
  </div>
  </PannelLauyout>
</template>

<style scoped>
.alerts-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.alerts-view__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
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

.alerts-view__badge {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 600;
}

.alerts-view__badge--active {
  background-color: #fef2f2;
  color: #dc2626;
}

.alerts-view__grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.alert-card {
  background: var(--alert-bg);
  border-left: 4px solid var(--alert-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.alert-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alert-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.alert-card__icon {
  font-size: 1.5rem;
}

.alert-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--alert-color);
  margin: 0;
}

.alert-card__message {
  font-size: 0.9rem;
  color: #475569;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.alert-card__details {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.alert-card__full-text {
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
  margin: 0;
}

.alerts-view__empty {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 3rem;
}

.alerts-view__empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.alerts-view__empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #22c55e;
  margin: 0 0 0.5rem;
}

.alerts-view__empty-text {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 1.5rem;
}

.alerts-view__back-btn {
  background-color: #22c55e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.alerts-view__back-btn:hover {
  background-color: #16a34a;
}

.alerts-view__conditions {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

  .alerts-view__header {
    flex-direction: column;
    gap: 1rem;
  }

  .alerts-view__title {
    font-size: 1.5rem;
  }
}
</style>
