<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  levels?: {
    current: number
    depth20: number
    depth40: number
    depth60: number
  }
}

const props = defineProps<Props>()

const currentLevel = computed(() => props.levels?.current ?? 0)
const depth20 = computed(() => props.levels?.depth20 ?? 0)
const depth40 = computed(() => props.levels?.depth40 ?? 0)
const depth60 = computed(() => props.levels?.depth60 ?? 0)

const status = computed(() => {
  const val = currentLevel.value
  if (val < 50) return { label: 'SUELO SECO', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
  if (val < 70) return { label: 'INICIO SECADO', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' }
  if (val < 90) return { label: 'ÓPTIMO', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' }
  return { label: 'SATURADO', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' }
})

const fillHeight = computed(() => `${Math.min(currentLevel.value, 100)}%`)
</script>

<template>
  <div class="soil-card">
    <div class="soil-card__header">
      <div class="soil-card__title-group">
        <span class="soil-card__icon">💧</span>
        <h3 class="soil-card__title">Humedad Suelo</h3>
      </div>
      <div class="soil-card__badge" :style="{ color: status.color, backgroundColor: status.bgColor }">
        {{ status.label }}
      </div>
    </div>

    <div class="soil-card__body">
      <!-- Col 1: Overall Stat (More compact) -->
      <div class="soil-card__column soil-card__column--left">
        <div class="main-stat">
          <span class="main-stat__value">{{ currentLevel }}<small>%</small></span>
          <span class="main-stat__label">OVERALL</span>
        </div>
      </div>

      <!-- Col 2: Large Graphical Meter (Hero Element) -->
      <div class="soil-card__column soil-card__column--center">
        <div class="pill-meter">
          <div class="pill-meter__fill" :style="{ height: fillHeight }">
            <div class="pill-meter__wave"></div>
          </div>
          <div class="pill-meter__markers">
            <span class="marker">SAT</span>
            <span class="marker">OPT</span>
            <span class="marker">WILT</span>
          </div>
        </div>
      </div>

      <!-- Col 3: Depth stats (More compact boxes) -->
      <div class="soil-card__column soil-card__column--right">
        <div class="depth-stats">
          <div class="depth-box">
            <span class="depth-box__label">20CM</span>
            <span class="depth-box__value">{{ depth20 }}%</span>
          </div>
          <div class="depth-box">
            <span class="depth-box__label">40CM</span>
            <span class="depth-box__value">{{ depth40 }}%</span>
          </div>
          <div class="depth-box">
            <span class="depth-box__label">60CM</span>
            <span class="depth-box__value">{{ depth60 }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.soil-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1rem 1.25rem;
  color: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  height: 100%;
}

.soil-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.3);
}

.soil-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.soil-card__title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.soil-card__icon {
  font-size: 1.1rem;
}

.soil-card__title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.soil-card__badge {
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 800;
}

.soil-card__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 0.5rem;
}

.soil-card__column {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.soil-card__column--center {
  flex: 0 0 110px; /* Wider space for the hero element */
}

/* Overall Stat Styling */
.main-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-stat__value {
  font-size: 2.25rem;
  font-weight: 900;
  line-height: 1;
  color: white;
}

.main-stat__value small {
  font-size: 1rem;
  font-weight: 700;
  color: #94a3b8;
  margin-left: 1px;
}

.main-stat__label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* LARGE Pill Meter Styling - Hero Element */
.pill-meter {
  width: 125px; /* Significantly wider */
  height: 180px; /* Taller hero element */
  background: rgba(15, 23, 42, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 45px;
  position: relative;
  overflow: hidden;
  box-shadow:
    inset 0 4px 15px rgba(0,0,0,0.4),
    0 0 20px rgba(59, 130, 246, 0.1);
  transform: translateY(-5px); /* Slight lift to make it pop */
}

.pill-meter__fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
  transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 -4px 15px rgba(37, 99, 235, 0.3);
}

.pill-meter__wave {
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 16px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  filter: blur(2px);
}

.pill-meter__markers {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 20px 0;
  pointer-events: none;
  z-index: 2;
}

.marker {
  font-size: 0.95rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.4);
  padding: 0 12px;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

/* Depth Box Styling */
.depth-stats {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.depth-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 0.4rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.depth-box__label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
}

.depth-box__value {
  font-size: 0.85rem;
  font-weight: 800;
  color: white;
}

/* Responsive */
@media (max-width: 640px) {
  .soil-card__body {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
