<script setup lang="ts">
import { ref, computed } from 'vue'
import { getWeatherCondition, getWindDirection, getUVIndexLevel } from '@/utils/weather-mappings'
import type { CurrentData, HourlyData } from '@/types/weather'

interface SelectedDayData {
  tempMax: number
  tempMin: number
  apparentTempMax: number
  apparentTempMin: number
  precipitation: number
  windSpeedMax: number
  uvIndex: number
  cloudCover: number | null
}

interface Props {
  current: CurrentData | null
  hourly: HourlyData | null
  selectedDay: SelectedDayData | null
  sunshineDuration?: number
  isToday?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isToday: true,
  loading: false,
})

const activeTab = ref<'temp' | 'precip' | 'wind'>('temp')
const selectedHourIndex = ref<number | null>(null)

const currentHourIndex = computed(() => {
  const now = new Date()
  return now.getHours()
})

const displayHourIndex = computed(() => {
  if (selectedHourIndex.value !== null) {
    return selectedHourIndex.value
  }
  return currentHourIndex.value
})

const selectHour = (index: number) => {
  selectedHourIndex.value = selectedHourIndex.value === index ? null : index
}

const weatherCondition = computed(() => {
  if (!props.current?.weather_code) return getWeatherCondition(0, true)
  return getWeatherCondition(props.current.weather_code, true)
})

const cloudCover = computed(() => {
  if (!props.hourly?.cloud_cover) return props.current?.cloud_cover ?? 0
  const idx = displayHourIndex.value
  return props.hourly.cloud_cover[idx] ?? 0
})

const cloudDescription = computed(() => {
  const cover = cloudCover.value
  if (cover <= 10) return 'Despejado'
  if (cover <= 30) return 'Mayormente despejado'
  if (cover <= 50) return 'Parcialmente nublado'
  if (cover <= 70) return 'Nuboso'
  if (cover <= 90) return 'Mayormente nublado'
  return 'Cubierto'
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

const uvIndex = computed(() => {
  if (!props.hourly?.uv_index) return 0
  const now = new Date()
  const currentHour = now.getHours()
  return props.hourly.uv_index[currentHour] ?? props.hourly.uv_index[0] ?? 0
})

const uvLevel = computed(() => getUVIndexLevel(uvIndex.value))

const displayTemp = computed(() => {
  if (!props.hourly?.temperature_2m) return props.current?.temperature_2m ?? 0
  const idx = displayHourIndex.value
  return props.hourly.temperature_2m[idx] ?? 0
})

const displayApparentTemp = computed(() => {
  if (!props.hourly?.apparent_temperature) return props.current?.apparent_temperature ?? 0
  const idx = displayHourIndex.value
  return props.hourly.apparent_temperature[idx] ?? 0
})

const displayHumidity = computed(() => {
  if (!props.hourly?.relative_humidity_2m) return props.current?.relative_humidity_2m ?? 0
  const idx = displayHourIndex.value
  return props.hourly.relative_humidity_2m[idx] ?? 0
})

const displayWindSpeed = computed(() => {
  if (!props.hourly?.wind_speed_10m) return props.current?.wind_speed_10m ?? 0
  const idx = displayHourIndex.value
  return props.hourly.wind_speed_10m[idx] ?? 0
})

const displayUV = computed(() => {
  if (!props.hourly?.uv_index) return props.selectedDay?.uvIndex ?? 0
  const idx = displayHourIndex.value
  return props.hourly.uv_index[idx] ?? 0
})

const sunshineHours = computed(() => {
  if (!props.sunshineDuration) return '--'
  const hours = props.sunshineDuration / 3600
  return hours.toFixed(1)
})

const getHourRange = (data: number[], threshold: number, check: (v: number) => boolean) => {
  const hours: number[] = []
  let maxVal = 0
  let maxHour = -1

  data.forEach((val, i) => {
    if (val != null && check(val)) {
      hours.push(i)
      if (val > maxVal) {
        maxVal = val
        maxHour = i
      }
    }
  })

  if (hours.length === 0) return null

  const start = hours[0]
  const end = hours[hours.length - 1]
  const range = start === end ? `${start}h` : `${start}h-${end}h`

  return { range, peak: maxHour >= 0 ? `${maxHour}h` : '', value: maxVal }
}

const uvAlert = computed(() => {
  if (!props.hourly?.uv_index) return null
  const uvData = props.hourly.uv_index.slice(0, 24)
  const result = getHourRange(uvData, 6, (v) => v >= 6)
  if (!result) return null
  if (result.value >= 8) return { level: 'extremo', icon: '⚠️', range: result.range, peak: result.peak, value: result.value }
  if (result.value >= 6) return { level: 'alto', icon: '☀️', range: result.range, peak: result.peak, value: result.value }
  return null
})

const heatAlert = computed(() => {
  if (!props.hourly?.temperature_2m) return null
  const tempData = props.hourly.temperature_2m.slice(0, 24)
  const result = getHourRange(tempData, 35, (v) => v >= 35)
  if (!result) return null
  if (result.value >= 38) return { level: 'extrema', icon: '🔥', range: result.range, peak: result.peak, value: result.value }
  if (result.value >= 35) return { level: 'alta', icon: '🌡️', range: result.range, peak: result.peak, value: result.value }
  return null
})

const snowAlert = computed(() => {
  if (!props.hourly?.weather_code && !props.current?.weather_code) return null
  const weatherCodes = props.hourly?.weather_code?.slice(0, 24) ?? []
  const codes = [...Array(24)].map((_, i) => weatherCodes[i] ?? props.current?.weather_code ?? 0)
  const SNOW_CODES = [71, 73, 75, 77, 85, 86]
  const hours: number[] = []
  codes.forEach((code, i) => { if (SNOW_CODES.includes(code ?? 0)) hours.push(i) })
  if (hours.length === 0) return null
  const start = hours[0]; const end = hours[hours.length - 1]
  const range = start === end ? `${start}h` : `${start}h-${end}h`
  return { level: 'nevada', icon: '🌨️', range, peak: `${hours[0]}h`, value: hours.length }
})

const stormAlert = computed(() => {
  if (!props.hourly?.weather_code && !props.current?.weather_code) return null
  const weatherCodes = props.hourly?.weather_code?.slice(0, 24) ?? []
  const codes = [...Array(24)].map((_, i) => weatherCodes[i] ?? props.current?.weather_code ?? 0)
  const STORM_CODES = [95, 96, 99]; const HAIL_CODES = [96, 99]
  const hours: number[] = []; let hasHail = false
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i] ?? 0
    if (HAIL_CODES.includes(code)) { hours.push(i); hasHail = true }
    else if (STORM_CODES.includes(code)) { hours.push(i) }
  }
  if (hours.length === 0) return null
  const start = hours[0]; const end = hours[hours.length - 1]
  const range = start === end ? `${start}h` : `${start}h-${end}h`
  return { level: hasHail ? 'granizo' : 'tormenta', icon: hasHail ? '🧊' : '⛈️', range, peak: `${hours[0]}h`, value: 0 }
})

const humidityAlert = computed(() => {
  if (!props.hourly?.relative_humidity_2m) return null
  const humData = props.hourly.relative_humidity_2m.slice(0, 24)
  const result = getHourRange(humData, 90, (v) => v >= 90)
  if (!result) return null
  return { level: result.value >= 95 ? 'extrema' : 'alta', icon: result.value >= 95 ? '💧' : '💦', range: result.range, peak: result.peak, value: result.value }
})

const windAlert = computed(() => {
  if (!props.hourly?.wind_speed_10m) return null
  const windData = props.hourly.wind_speed_10m.slice(0, 24)
  const result = getHourRange(windData, 30, (v) => v >= 30)
  if (!result) return null
  return { level: result.value >= 50 ? 'muy fuerte' : 'fuerte', icon: result.value >= 50 ? '🌪️' : '💨', range: result.range, peak: result.peak, value: result.value }
})

const chartData = computed(() => {
  if (!props.hourly?.time) return { temp: [], precip: [], wind: [], windDirs: [], labels: [], isCurrentHour: [], isSelectedHour: [] }
  const labels = Array.from({ length: 24 }, (_, i) => `${i}h`)
  const temp = props.hourly.temperature_2m?.slice(0, 24) ?? []
  const precip = props.hourly.precipitation?.slice(0, 24) ?? []
  const wind = props.hourly.wind_speed_10m?.slice(0, 24) ?? []
  const windDirs = props.hourly.wind_direction_10m?.slice(0, 24) ?? []
  const isCurrentHour = Array.from({ length: 24 }, (_, i) => i === currentHourIndex.value)
  const isSelectedHour = Array.from({ length: 24 }, (_, i) => i === displayHourIndex.value)
  return { temp, precip, wind, windDirs, labels, isCurrentHour, isSelectedHour }
})


const tempRange = computed(() => {
  const temps = chartData.value.temp
  const max = temps.length > 0 ? Math.max(...temps, 5) : 10
  const min = temps.length > 0 ? Math.min(...temps, -5) : -5
  return { max, min, total: max - min }
})

const getTempBarStyles = (value: number) => {
  const { max, total } = tempRange.value
  const heightPercentage = (Math.abs(value) / total) * 100
  const topPosition = value >= 0 ? ((max - value) / total) * 100 : (max / total) * 100
  return {
    height: `${Math.max(heightPercentage, 2)}%`,
    top: `${topPosition}%`
  }
}

const zeroLineTop = computed(() => (tempRange.value.max / tempRange.value.total) * 100)

const maxPrecip = computed(() => Math.max(...chartData.value.precip, 1))
const maxWind = computed(() => Math.max(...chartData.value.wind.filter(w => w > 0), 5))

const getPrecipHeight = (value: number) => Math.max((value / maxPrecip.value) * 100, 3)
const getWindHeight = (value: number) => Math.max((value / maxWind.value) * 100, 3)
</script>

<template>
  <div class="weather-current">
    <div v-if="loading" class="weather-current__loading">
      Cargando...
    </div>
    <template v-else-if="current">
      <div class="weather-current__header">
        <div class="weather-current__main">
          <div class="weather-current__icons">
            <span class="weather-current__icon">{{ weatherCondition.icon }}</span>
            <div v-if="snowAlert" class="weather-current__alert" :title="`${snowAlert.level}`">
              <span class="weather-current__alert-icon">{{ snowAlert.icon }}</span>
              <span class="weather-current__alert-time">{{ snowAlert.range }}</span>
            </div>
            <div v-if="stormAlert" class="weather-current__alert" :title="`${stormAlert.level === 'granizo' ? 'Granizo' : 'Tormenta'}`">
              <span class="weather-current__alert-icon">{{ stormAlert.icon }}</span>
              <span class="weather-current__alert-time">{{ stormAlert.range }}</span>
            </div>
            <div v-if="heatAlert" class="weather-current__alert" :title="`Temperatura ${heatAlert.level} (${heatAlert.value}°C)`">
              <span class="weather-current__alert-icon">{{ heatAlert.icon }}</span>
              <span class="weather-current__alert-time">{{ heatAlert.range }}</span>
            </div>
            <div v-if="windAlert" class="weather-current__alert" :title="`Viento ${windAlert.level} (${windAlert.value} km/h)`">
              <span class="weather-current__alert-icon">{{ windAlert.icon }}</span>
              <span class="weather-current__alert-time">{{ windAlert.range }}</span>
            </div>
          </div>
          <div class="weather-current__temp-wrapper">
            <span class="weather-current__value">{{ displayTemp.toFixed(1) }}</span>
            <span class="weather-current__unit">°C</span>
          </div>
        </div>

        <div class="weather-current__meta">
          <p class="weather-current__description">
            {{ weatherCondition.description }}
          </p>

          <div class="weather-current__stats">
            <div class="weather-current__stat">
              <span class="weather-current__stat-icon">🌡️</span>
              <span class="weather-current__stat-value">{{ displayApparentTemp.toFixed(1) }}°</span>
              <span class="weather-current__stat-label">Sensación</span>
            </div>
            <div class="weather-current__stat">
              <span class="weather-current__stat-icon">🌞</span>
              <span class="weather-current__stat-value">{{ sunshineHours }}</span>
              <span class="weather-current__stat-label">h sol</span>
            </div>
            <div class="weather-current__stat">
              <span class="weather-current__stat-icon">☁️</span>
              <span class="weather-current__stat-value">{{ cloudCover }}</span>
              <span class="weather-current__stat-label">%</span>
            </div>
            <div class="weather-current__stat">
              <span class="weather-current__stat-icon">💨</span>
              <span class="weather-current__stat-value">{{ displayWindSpeed.toFixed(1) }}</span>
              <span class="weather-current__stat-label">km/h</span>
            </div>
            <div class="weather-current__stat">
              <span class="weather-current__stat-icon">💧</span>
              <span class="weather-current__stat-value">{{ displayHumidity.toFixed(1) }}</span>
              <span class="weather-current__stat-label">%</span>
            </div>
            <div class="weather-current__stat">
              <span class="weather-current__stat-icon">☀️</span>
              <span class="weather-current__stat-value">{{ displayUV.toFixed(1) }}</span>
              <span class="weather-current__stat-label">UV</span>
            </div>
          </div>
        </div>
      </div>

      <div class="weather-current__chart-section">
        <div class="weather-current__tabs">
          <button class="weather-current__tab" :class="{ 'weather-current__tab--active': activeTab === 'temp' }" @click="activeTab = 'temp'">🌡️ Temperatura</button>
          <button class="weather-current__tab" :class="{ 'weather-current__tab--active': activeTab === 'precip' }" @click="activeTab = 'precip'">🌧️ Precipitación</button>
          <button class="weather-current__tab" :class="{ 'weather-current__tab--active': activeTab === 'wind' }" @click="activeTab = 'wind'">💨 Viento</button>
        </div>

        <div class="weather-current__chart-container">
          <div v-show="activeTab === 'temp'" class="weather-current__chart">
            <div class="weather-current__chart-bars temperature-container">
              <div class="zero-axis" :style="{ top: zeroLineTop + '%' }"></div>
              <div
                v-for="(temp, i) in chartData.temp"
                :key="'t'+i"
                class="weather-current__bar weather-current__bar--temp"
                :class="{
                  'weather-current__bar--current': chartData.isCurrentHour[i],
                  'weather-current__bar--selected': chartData.isSelectedHour[i],
                  'weather-current__bar--negative': temp < 0
                }"
                :style="{
                  height: getTempBarStyles(temp).height,
                  top: getTempBarStyles(temp).top,
                  left: (i * (100 / 24)) + '%'
                }"
                @click="selectHour(i)"
              >
                <span class="weather-current__bar-value">{{ temp.toFixed(1) }}°</span>
                <span class="weather-current__bar-label">{{ chartData.labels[i] }}</span>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'precip'" class="weather-current__chart">
            <div class="weather-current__chart-bars">
              <div
                v-for="(precip, i) in chartData.precip"
                :key="'p'+i"
                class="weather-current__bar weather-current__bar--precip"
                :class="{
                  'weather-current__bar--current': chartData.isCurrentHour[i],
                  'weather-current__bar--selected': chartData.isSelectedHour[i]
                }"
                :style="{ height: getPrecipHeight(precip) + '%' }"
                @click="selectHour(i)"
              >
                <span class="weather-current__bar-value">{{ precip.toFixed(1) }}</span>
                <span class="weather-current__bar-label">{{ chartData.labels[i] }}</span>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'wind'" class="weather-current__chart">
            <div class="weather-current__chart-bars">
              <div
                v-for="(wind, i) in chartData.wind"
                :key="'w'+i"
                class="weather-current__bar weather-current__bar--wind"
                :class="{
                  'weather-current__bar--current': chartData.isCurrentHour[i],
                  'weather-current__bar--selected': chartData.isSelectedHour[i]
                }"
                :style="{ height: getWindHeight(wind) + '%' }"
                @click="selectHour(i)"
              >
                <span class="weather-current__bar-value">{{ wind.toFixed(0) }}</span>
                <span class="weather-current__bar-label">{{ chartData.labels[i] }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="weather-current__time">
        <template v-if="selectedHourIndex !== null">
          Hora seleccionada: {{ chartData.labels[selectedHourIndex] }}
        </template>
        <template v-else>
          Actualizado: {{ formattedTime }}
        </template>
      </p>
    </template>
    <div v-else class="weather-current__empty">
      Sin datos disponibles
    </div>
  </div>
</template>

<style scoped>
.weather-current {
  background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.weather-current__loading,
.weather-current__empty {
  text-align: center;
  padding: 2rem;
  opacity: 0.8;
}

.weather-current__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.weather-current__main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.weather-current__icon {
  font-size: 3.5rem;
  line-height: 1;
}

.weather-current__icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.weather-current__alert {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.weather-current__alert-icon {
  font-size: 2.2rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.weather-current__alert-time {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 100, 100, 0.4);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.weather-current__temp-wrapper {
  display: flex;
  align-items: flex-start;
}

.weather-current__value {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
}

.weather-current__unit {
  font-size: 1.25rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.weather-current__meta {
  flex: 1;
  min-width: 200px;
}

.weather-current__description {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.75rem 0;
  text-align: right;
}

.weather-current__stats {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.weather-current__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  min-width: 50px;
}

.weather-current__stat-icon { font-size: 0.9rem; }
.weather-current__stat-value { font-size: 0.85rem; font-weight: 700; }
.weather-current__stat-label { font-size: 0.55rem; opacity: 0.75; text-transform: uppercase; }

.weather-current__chart-section {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
}

.weather-current__tabs {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.25rem;
  z-index: 10;
}

.weather-current__tab {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.weather-current__tab:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.weather-current__tab--active {
  background: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.weather-current__chart-container {
  min-height: 180px;
  padding-top: 3rem;
}

/* --- ESTRUCTURA DE BARRAS --- */
.weather-current__chart-bars {
  display: flex;
  align-items: flex-end; /* Precip y Viento crecen desde abajo */
  justify-content: space-between;
  height: 130px;
  gap: 2px;
  padding: 0 0.25rem 1.5rem 1.5rem;
  position: relative;
}

/* Contenedor específico para temperatura */
.temperature-container {
  align-items: flex-start !important; /* Necesario para que 'top' mande */
}

/* Línea del horizonte (0°) */
.zero-axis {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 1;
  pointer-events: none;
}

.weather-current__bar {
  flex: 1;
  min-width: 8px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

/* Barras de temperatura usan posición absoluta para moverse en el eje */
.weather-current__bar--temp {
  position: absolute;
  width: calc(100% / 24 - 4px);
}

.weather-current__bar--temp:not(.weather-current__bar--negative) {
  background: linear-gradient(to top, #fbbf24, #f59e0b);
  border-radius: 4px 4px 0 0;
}

.weather-current__bar--temp.weather-current__bar--negative {
  background: linear-gradient(to bottom, #60a5fa, #3b82f6);
  border-radius: 0 0 4px 4px;
}

.weather-current__bar--precip { background: linear-gradient(to top, #60a5fa, #3b82f6); }
.weather-current__bar--wind { background: linear-gradient(to top, #34d399, #10b981); }

/* --- VALORES Y ETIQUETAS --- */
.weather-current__bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  position: absolute;
  top: -18px;
  width: 100%;
  text-align: center;
  white-space: nowrap;
}

/* Ajuste de valor para temperaturas negativas */
.weather-current__bar--negative .weather-current__bar-value {
  top: auto;
  bottom: -18px;
}

.weather-current__bar-label {
  position: absolute;
  bottom: -22px;
  width: 100%;
  text-align: center;
  font-size: 0.65rem;
  opacity: 0.7;
}

/* Forzar que las horas de temperatura siempre estén abajo fijas */
.weather-current__bar--temp .weather-current__bar-label {
  bottom: -45px;
}

/* --- ESTADOS SELECCIONADOS --- */
.weather-current__bar--current {
  box-shadow: 0 0 0 2px #22c55e, 0 0 10px rgba(34, 197, 94, 0.5);
}

.weather-current__bar--selected {
  box-shadow: 0 0 0 2px #f472b6, 0 0 15px rgba(244, 114, 182, 0.6);
  z-index: 5;
}

.weather-current__time {
  text-align: center;
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 1.5rem;
}

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .weather-current__header { flex-direction: column; text-align: center; }
  .weather-current__stats { justify-content: center; }
  .weather-current__tabs { position: relative; top: 0; right: 0; margin-bottom: 0.75rem; justify-content: center; }
  .weather-current__chart-container { padding-top: 0; }
}

@media (max-width: 480px) {
  .weather-current__value { font-size: 2.5rem; }
  .weather-current__bar-value { font-size: 0.55rem; }
}
</style>
