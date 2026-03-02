<script setup lang="ts">
import { computed } from 'vue'
import type { Denomination } from '@/types/weather'

interface Props {
  et0: number
  precipitation: number
  humidity: number // Air humidity
  soilMoisture40_60: number // For context
  selectedDO: Denomination // 'Getaria', 'Bizkaia', 'Alava'
}

const props = defineProps<Props>()

// 1. AGRONOMIC PARAMETERS
const KC_TXAKOLI = 0.75

// Determine soil profile based on D.O. (used for absorption matrix)
// Bizkaia/Araba: Franco-Arcilloso | Getaria: Franco-Limoso
const isClayLoam = computed(() => {
  const zone = props.selectedDO?.toLowerCase()
  return zone === 'bizkaia' || zone === 'alava' || zone === 'araba'
})

// 2. INGRESOS (GAINS)
const irrigation = 0 // Placeholder

// ROCÍO: Estimación basada en humedad ambiental (común en costa vasca)
const dew = computed(() => {
  if (props.humidity > 90) return 0.3
  if (props.humidity > 80) return 0.1
  return 0
})

// ABSORCIÓN: Aporte de zona profunda (40-60cm) según matriz técnica
const absorptionGain = computed(() => {
  const val = props.soilMoisture40_60
  if (isClayLoam.value) { // Franco-Arcilloso (Bizkaia/Araba)
    if (val > 90) return 3.5 // Rango corregido (promedio 3-4)
    if (val >= 70) return 2.0 // Rango corregido (promedio 1.5-2.5)
    if (val >= 50) return 0.7 // Rango corregido (promedio 0.5-1.0)
    return 0
  } else { // Franco-Limoso (Getaria)
    if (val > 90) return 2.2 // Rango corregido (promedio 2-2.5)
    if (val >= 70) return 1.2 // Rango corregido (promedio 1-1.5)
    if (val >= 50) return 0.3 // Rango corregido (promedio 0.2-0.5)
    return 0
  }
})

const totalIngress = computed(() => props.precipitation + irrigation + dew.value + absorptionGain.value)

// 3. EGRESOS (LOSSES)
const etc = computed(() => props.et0 * KC_TXAKOLI)

// Drainage estimation based on soil type per D.O.
const drainage = computed(() => {
  const zone = props.selectedDO?.toLowerCase()
  if (zone === 'getaria') return 0.8 // High drainage (arenisca/laderas)
  if (zone === 'alava' || zone === 'araba') return 0.5   // Medium (caliza)
  return 0.3 // Low (bizkaia - franco arcillosa)
})

// Final derived values
const totalEgress = computed(() => etc.value + drainage.value)
const balance = computed(() => totalIngress.value - totalEgress.value)

// GAIN/LOSS PERCENTS FOR PROGRESS BARS (Increased for total gains)
const MAX_BAR_VALUE = 8
const gainPercent = computed(() => Math.min((totalIngress.value / MAX_BAR_VALUE) * 100, 100))
const lossPercent = computed(() => Math.min((totalEgress.value / MAX_BAR_VALUE) * 100, 100))

interface EvapStatus {
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
}

const getStatus = (balanceVal: number): EvapStatus => {
  if (balanceVal > 1.5) {
    return {
      label: 'Acumulación Hídrica',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      description: 'Crecimiento vigoroso. Vigilancia Mildiú.',
      icon: '🌿',
    }
  }
  if (balanceVal >= -1.0) {
    return {
      label: 'Equilibrio Óptimo',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      description: 'Desarrollo ideal de la canopia y fruto.',
      icon: '✨',
    }
  }
  if (balanceVal >= -3.0) {
    return {
      label: 'Estrés Moderado',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      description: 'Lento engorde. Posible riego de apoyo.',
      icon: '🐢',
    }
  }
  return {
    label: 'Déficit Crítico',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Riesgo de parada vegetativa inminente.',
    icon: '🔥',
  }
}

const status = computed(() => getStatus(balance.value))
</script>

<template>
  <div class="evap-card">
    <div class="evap-card__header">
      <div class="evap-card__title-group">
        <span class="evap-card__icon">☀️</span>
        <h3 class="evap-card__title">Balance Hídrico ({{ selectedDO }})</h3>
      </div>
    </div>

    <div class="evap-card__content">
      <div class="evap-card__stats-grid">
        <!-- INGRESOS -->
        <div class="evap-card__stat-column">
          <div class="evap-card__label">INGRESOS (SUMA)</div>
          <div class="evap-card__progress-wrapper">
            <div class="evap-card__progress-bg">
              <div
                class="evap-card__progress-fill evap-card__progress-fill--gain"
                :style="{ width: `${gainPercent}%` }"
              ></div>
            </div>
            <span class="evap-card__value-text">{{ totalIngress.toFixed(1) }} mm</span>
          </div>
          <div class="evap-card__detail-text">Rain: {{ precipitation.toFixed(1) }} | Abs: {{ absorptionGain.toFixed(1) }} | Dew: {{ dew.toFixed(1) }}</div>
        </div>

        <!-- BALANCE CIRCLE -->
        <div class="evap-card__balance-display">
          <div class="evap-card__circle" :class="{ 'evap-card__circle--negative': balance < 0 }">
            <div class="evap-card__circle-inner">
              <span class="evap-card__balance-value">
                {{ balance > 0 ? '+' : '' }}{{ balance.toFixed(1) }}
              </span>
              <span class="evap-card__balance-label">mm/día</span>
            </div>
          </div>
        </div>

        <!-- EGRESOS -->
        <div class="evap-card__stat-column">
          <div class="evap-card__label">EGRESOS (PÉRDIDA)</div>
          <div class="evap-card__progress-wrapper">
            <div class="evap-card__progress-bg">
              <div
                class="evap-card__progress-fill evap-card__progress-fill--loss"
                :style="{ width: `${lossPercent}%` }"
              ></div>
            </div>
            <span class="evap-card__value-text">{{ totalEgress.toFixed(1) }} mm</span>
          </div>
          <div class="evap-card__detail-text">Evapotranspiración + Drenaje</div>
        </div>
      </div>
    </div>

    <!-- STATUS MESSAGE -->
    <div class="evap-card__status-box" :style="{ borderColor: status.color, backgroundColor: status.bgColor }">
      <span class="evap-card__status-icon">{{ status.icon }}</span>
      <div class="evap-card__status-text">
        <div class="evap-card__status-title" :style="{ color: status.color }">{{ status.label }}</div>
        <div class="evap-card__status-description">{{ status.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evap-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
}

.evap-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
  border-color: rgb(255, 255, 255);
}

.evap-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.evap-card__header {
  margin-bottom: 1rem;
}

.evap-card__title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.evap-card__icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 5px rgba(250, 204, 21, 0.4));
}

.evap-card__title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.evap-card__reserve-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.evap-card__stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.evap-card__stat-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.evap-card__label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #f5f5f5;
  letter-spacing: 0.05em;
}

.evap-card__progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.evap-card__progress-bg {
  flex: 1;
  height: 25px;
  background: rgba(255, 255, 255, 0.158);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.evap-card__progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.evap-card__progress-fill--gain {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.evap-card__progress-fill--loss {
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
}

.evap-card__value-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #f8fafc;
  min-width: 55px;
  text-align: right;
}

.evap-card__detail-text {
  font-size: 0.65rem;
  color: #898a8b;
  font-style: italic;
}

.evap-card__balance-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

.evap-card__circle {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.evap-card__circle::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  border: 2px solid #22c55e;
  border-top-color: transparent;
  border-right-color: transparent;
  transform: rotate(-45deg);
  opacity: 0.5;
}

.evap-card__circle--negative::before {
  border-color: #ef4444;
  border-top-color: transparent;
  border-right-color: transparent;
}

.evap-card__circle-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.evap-card__balance-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  color: #22c55e;
}

.evap-card__circle--negative .evap-card__balance-value {
  color: #ef4444;
}

.evap-card__balance-label {
  font-size: 0.6rem;
  color: #64748b;
  margin-top: 0.2rem;
  text-transform: uppercase;
  font-weight: 600;
}

.evap-card__status-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left-width: 6px;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.evap-card__status-icon {
  font-size: 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.evap-card__status-text {
  display: flex;
  flex-direction: column;
}

.evap-card__status-title {
  font-size: 0.9rem;
  font-weight: 700;
}

.evap-card__status-description {
  font-size: 0.75rem;
  color: #94a3b8;
}

@media (max-width: 640px) {
  .evap-card__stats-grid {
    flex-direction: column;
    gap: 1.5rem;
  }

  .evap-card__stat-column {
    width: 100%;
  }

  .evap-card__balance-display {
    order: -1;
  }
}
</style>

