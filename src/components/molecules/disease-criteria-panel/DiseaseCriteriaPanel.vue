<script setup lang="ts">
import type { DiseaseType } from '@/types/disease'
import { DISEASE_CONFIGS } from '@/utils/disease-thresholds'

const diseaseNames: Record<DiseaseType, string> = {
  mildiu: 'Mildiú',
  botrytis: 'Botrytis',
  oidio: 'Oídio',
  excoriosis: 'Excoriosis',
}

const diseaseList: DiseaseType[] = ['mildiu', 'botrytis', 'oidio', 'excoriosis']

function getThresholds(d: DiseaseType) {
  return DISEASE_CONFIGS[d]?.thresholds ?? { tempMin: 0, tempMax: 0, humidityMin: 0, precipitationMin: 0 }
}

function getWeights(d: DiseaseType) {
  return DISEASE_CONFIGS[d]?.weights ?? { temperature: 0, humidity: 0, precipitation: 0 }
}
</script>

<template>
  <div class="criteria-panel">
    <h3 class="criteria-panel__title">
      <span class="criteria-panel__icon">📊</span>
      Criterios de Cálculo - Probabilidad de Enfermedad
    </h3>

    <div class="criteria-panel__info">
      <p class="criteria-panel__intro">
        La probabilidad se calcula en base a tres factores climáticos principales, 
        cada uno con un peso específico según la生物学 de cada enfermedad.
      </p>

      <div class="criteria-panel__formula">
        <h4 class="criteria-panel__subtitle">Fórmula</h4>
        <div class="criteria-panel__equation">
          <span class="criteria-panel__eq-label">Probabilidad =</span>
          <span class="criteria-panel__eq-term">(Temp × 0.35)</span>
          <span class="criteria-panel__eq-op">+</span>
          <span class="criteria-panel__eq-term">(Hum × 0.40)</span>
          <span class="criteria-panel__eq-op">+</span>
          <span class="criteria-panel__eq-term">(Precip × 0.25)</span>
        </div>
      </div>

      <div class="criteria-panel__thresholds">
        <h4 class="criteria-panel__subtitle">Umbrales por enfermedad</h4>
        <div class="criteria-panel__table-wrapper">
          <table class="criteria-panel__table">
            <thead>
              <tr>
                <th>Enfermedad</th>
                <th>Temp (°C)</th>
                <th>Humedad (%)</th>
                <th>Precipitación</th>
                <th>Peso Temp</th>
                <th>Peso Hum</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in diseaseList" :key="d">
                <td class="criteria-panel__disease-name">{{ diseaseNames[d] }}</td>
                <td>{{ getThresholds(d).tempMin }} - {{ getThresholds(d).tempMax }}</td>
                <td>{{ getThresholds(d).humidityMin }}{{ getThresholds(d).humidityMax ? `-${getThresholds(d).humidityMax}` : '+' }}%</td>
                <td>{{ getThresholds(d).precipitationMin ? `≥${getThresholds(d).precipitationMin}mm` : 'N/A' }}</td>
                <td>{{ getWeights(d).temperature }}</td>
                <td>{{ getWeights(d).humidity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="criteria-panel__levels">
        <h4 class="criteria-panel__subtitle">Niveles de Riesgo</h4>
        <div class="criteria-panel__level-grid">
          <div class="criteria-panel__level criteria-panel__level--low">
            <span class="criteria-panel__level-value">LOW</span>
            <span class="criteria-panel__level-range">0-30%</span>
          </div>
          <div class="criteria-panel__level criteria-panel__level--medium">
            <span class="criteria-panel__level-value">MEDIUM</span>
            <span class="criteria-panel__level-range">31-60%</span>
          </div>
          <div class="criteria-panel__level criteria-panel__level--high">
            <span class="criteria-panel__level-value">HIGH</span>
            <span class="criteria-panel__level-range">61-85%</span>
          </div>
          <div class="criteria-panel__level criteria-panel__level--critical">
            <span class="criteria-panel__level-value">CRITICAL</span>
            <span class="criteria-panel__level-range">86-100%</span>
          </div>
        </div>
      </div>

      <div class="criteria-panel__example">
        <h4 class="criteria-panel__subtitle">Ejemplo de cálculo</h4>
        <div class="criteria-panel__example-card">
          <div class="criteria-panel__example-conditions">
            <h5>Condiciones actuales:</h5>
            <ul>
              <li>Temperatura: 18°C</li>
              <li>Humedad: 92%</li>
              <li>Precipitación: 8mm</li>
            </ul>
          </div>
          <div class="criteria-panel__example-calc">
            <h5>Mildiú:</h5>
            <div class="criteria-panel__calc-steps">
              <div class="criteria-panel__calc-step">
                <span>Temp (18°C en rango 6-26):</span>
                <span>1.0 × 0.35 = 0.35</span>
              </div>
              <div class="criteria-panel__calc-step">
                <span>Humedad (92% ≥ 90%):</span>
                <span>0.95 × 0.40 = 0.38</span>
              </div>
              <div class="criteria-panel__calc-step">
                <span>Precipitación (8mm ≥ 6mm):</span>
                <span>0.75 × 0.25 = 0.19</span>
              </div>
              <div class="criteria-panel__calc-result">
                <span>Total:</span>
                <span>0.92 → <strong>92% (CRITICAL)</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.criteria-panel {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.criteria-panel__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem;
}

.criteria-panel__icon {
  font-size: 1.25rem;
}

.criteria-panel__intro {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.criteria-panel__subtitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem;
}

.criteria-panel__formula {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.criteria-panel__equation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.criteria-panel__eq-label {
  color: #64748b;
}

.criteria-panel__eq-term {
  background: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.criteria-panel__eq-op {
  color: #94a3b8;
  font-weight: bold;
}

.criteria-panel__thresholds {
  margin-bottom: 1.5rem;
}

.criteria-panel__table-wrapper {
  overflow-x: auto;
}

.criteria-panel__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.criteria-panel__table th,
.criteria-panel__table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.criteria-panel__table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #475569;
}

.criteria-panel__disease-name {
  font-weight: 500;
  color: #1e293b;
}

.criteria-panel__levels {
  margin-bottom: 1.5rem;
}

.criteria-panel__level-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.criteria-panel__level {
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
}

.criteria-panel__level--low {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.criteria-panel__level--medium {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}

.criteria-panel__level--high {
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.criteria-panel__level--critical {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.criteria-panel__level-value {
  display: block;
  font-weight: 700;
  font-size: 0.8rem;
  color: #1e293b;
}

.criteria-panel__level-range {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.criteria-panel__example {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
}

.criteria-panel__example-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.criteria-panel__example-conditions h5,
.criteria-panel__example-calc h5 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.criteria-panel__example-conditions ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.8rem;
  color: #475569;
}

.criteria-panel__example-conditions li {
  padding: 0.25rem 0;
}

.criteria-panel__calc-steps {
  font-size: 0.75rem;
}

.criteria-panel__calc-step {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  color: #475569;
}

.criteria-panel__calc-result {
  display: flex;
  justify-content: space-between;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 1px dashed #cbd5e1;
  font-size: 0.8rem;
  color: #1e293b;
}

@media (max-width: 640px) {
  .criteria-panel__level-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .criteria-panel__example-card {
    grid-template-columns: 1fr;
  }
}
</style>
