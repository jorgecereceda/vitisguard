import type { Alert, DiseaseType, RiskLevel, WeatherAlertType, IrrigationAction } from '@/types/alert'
import type { DailyData } from '@/types/weather'

interface DiseaseThresholds {
  tempMin: number
  tempMax: number
  humidityMin: number
  humidityMax?: number
}

const DISEASE_THRESHOLDS: Record<DiseaseType, DiseaseThresholds> = {
  mildiu: {
    tempMin: 10,
    tempMax: 25,
    humidityMin: 85,
    humidityMax: 95
  },
  botrytis: {
    tempMin: 15,
    tempMax: 22,
    humidityMin: 90
  },
  oidio: {
    tempMin: 20,
    tempMax: 28,
    humidityMin: 40,
    humidityMax: 80
  },
  excoriosis: {
    tempMin: 5,
    tempMax: 15,
    humidityMin: 80
  }
}

const ALERT_RECOMMENDATIONS: Record<DiseaseType, Record<RiskLevel, string>> = {
  mildiu: {
    low: 'Monitorear hojas inferiores semanalmente',
    medium: 'Aplicar fungicida preventivo en próximos 7 días',
    high: 'Aplicar fungicida inmediatamente. Aumentar aireació',
    critical: 'Tratamiento urgente requerido. Aumentar aireació'
  },
  botrytis: {
    low: 'Eliminar racimos afectados visibles',
    medium: 'Mejorar ventilación. Aplicar tratamiento fungicida',
    high: 'Eliminar racimos afectados. Tratar inmediatamente',
    critical: 'Riesgo de propagación. Tratamiento inmediato obligatorio'
  },
  oidio: {
    low: 'Monitorear hojas. Tratamiento preventivo en 14 días',
    medium: 'Aplicar tratamiento preventivo en 7 días',
    high: 'Aplicar azufre o fungicida sistémico inmediatamente',
    critical: 'Tratamiento urgente. Azufre en polvo y sistémico'
  },
  excoriosis: {
    low: 'Monitorear estado de yemas',
    medium: 'Aplicar tratamiento preventivo en próximos 7 días',
    high: 'Eliminar restos de poda. Aplicar fungicida',
    critical: 'Tratamiento inmediato para proteger brotaciones'
  }
}

const WEATHER_ALERT_CONFIG = {
  frost: {
    threshold: 0,
    title: 'Alerta de Helada',
    getDescription: (temp: number) =>
      `Temperatura mínima de ${temp}°C. Riesgo de daño en brotaciones.`,
    recommendation: 'Cubrir parcelas con manta térmica. Activar riego por aspersión antes del amanecer.'
  },
  lateFrost: {
    threshold: 1,
    title: 'Helada Tardía',
    getDescription: (temp: number) =>
      `Helada inesperada en temporada de brotación. Temperatura ${temp}°C registrada.`,
    recommendation: 'Aplicar bioestimulantes para recuperación. No podar hasta evaluar tejido muerto.'
  },
  heatwave: {
    threshold: 35,
    title: 'Ola de Calor',
    getDescription: (temp: number) =>
      `Temperaturas máximas superiores a ${temp}°C durante varios días. Estrés térmico.`,
    recommendation: 'Activar riego al amanecer. Evitar podas. Sombrear racimos expuestos.'
  },
  drought: {
    thresholdDays: 20,
    title: 'Sequía Prolongada',
    getDescription: (days: number) =>
      `${days} días sin precipitación significativa. Reserves de agua agotadas.`,
    recommendation: 'Riego de emergencia necesario. Considerar mulching para retener humedad.'
  },
  excessiveRain: {
    thresholdMm: 60,
    title: 'Exceso de Precipitación',
    getDescription: (mm: number) =>
      `Precipitación acumulada de ${mm}mm en 24 horas. Riesgo de lavado de tratamientos.`,
    recommendation: 'Verificar drenaje. Re-aplicar tratamientos fitosanitarios tras estabilización.'
  }
}

function generateAlertId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let id = ''
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

function calculateRiskLevel(probability: number): RiskLevel {
  if (probability >= 80) return 'critical'
  if (probability >= 60) return 'high'
  if (probability >= 40) return 'medium'
  return 'low'
}

function evaluateDiseaseConditions(
  disease: DiseaseType,
  tempMax: number,
  tempMin: number,
  humidity: number,
  precipitation: number
): number {
  const thresholds = DISEASE_THRESHOLDS[disease]
  let score = 0

  const tempMean = (tempMax + tempMin) / 2

  if (tempMean >= thresholds.tempMin && tempMean <= thresholds.tempMax) {
    score += 40
    if (tempMean >= thresholds.tempMin + 3 && tempMean <= thresholds.tempMax - 3) {
      score += 20
    }
  }

  if (humidity >= thresholds.humidityMin) {
    score += 30
    if (thresholds.humidityMax && humidity <= thresholds.humidityMax) {
      score += 10
    }
  }

  if (precipitation > 0) {
    score += 10
  }

  return Math.min(score, 100)
}

function evaluateDailyDiseaseRisk(
  disease: DiseaseType,
  dayData: { tempMax: number; tempMin: number; humidity: number; precipitation: number },
  _date: string
): { risk: number; conditions: string[] } {
  const risk = evaluateDiseaseConditions(
    disease,
    dayData.tempMax,
    dayData.tempMin,
    dayData.humidity,
    dayData.precipitation
  )

  const conditions: string[] = []
  const tempMean = (dayData.tempMax + dayData.tempMin) / 2

  if (tempMean >= 10 && tempMean <= 25) {
    conditions.push(`Temperatura media: ${tempMean.toFixed(1)}°C`)
  }
  if (dayData.humidity >= 80) {
    conditions.push(`Humedad: ${dayData.humidity}%`)
  }
  if (dayData.precipitation > 0) {
    conditions.push(`Precipitación: ${dayData.precipitation}mm`)
  }

  return { risk, conditions }
}

function processDiseaseAlerts(
  dailyData: DailyData,
  plotId: string,
  userId: string,
  year: number
): Alert[] {
  const alerts: Alert[] = []
  const diseases: DiseaseType[] = ['mildiu', 'botrytis', 'oidio', 'excoriosis']

  const times = dailyData.time || []
  const tempMax = dailyData.temperature_2m_max || []
  const tempMin = dailyData.temperature_2m_min || []
  const humidity = dailyData.relative_humidity_2m_min || []
  const precipitation = dailyData.precipitation_sum || []

  const diseaseRiskDays: Record<DiseaseType, { date: string; risk: number; conditions: string[] }[]> = {
    mildiu: [],
    botrytis: [],
    oidio: [],
    excoriosis: []
  }

  for (let i = 0; i < times.length; i++) {
    const dateStr = times[i]
    if (!dateStr) continue

    const dayData = {
      tempMax: tempMax[i] ?? 0,
      tempMin: tempMin[i] ?? 0,
      humidity: humidity[i] ?? 0,
      precipitation: precipitation[i] ?? 0
    }

    for (const disease of diseases) {
      const { risk, conditions } = evaluateDailyDiseaseRisk(disease, dayData, dateStr)

      if (risk >= 50) {
        diseaseRiskDays[disease].push({
          date: dateStr,
          risk,
          conditions
        })
      }
    }
  }

  for (const disease of diseases) {
    const riskDays = diseaseRiskDays[disease]

    if (riskDays.length >= 3) {
      const avgRisk = riskDays.reduce((sum, d) => sum + d.risk, 0) / riskDays.length
      const firstDay = riskDays[0]
      if (!firstDay) continue
      const maxRiskDay = riskDays.reduce((max, d) => d.risk > max.risk ? d : max, firstDay)
      if (!maxRiskDay) continue
      const level = calculateRiskLevel(avgRisk)

      const alert: Alert = {
        id: generateAlertId(),
        category: 'disease',
        disease,
        level,
        probability: Math.round(avgRisk),
        conditions: maxRiskDay.conditions,
        recommendation: ALERT_RECOMMENDATIONS[disease][level],
        detectedAt: `${year}-${maxRiskDay.date.slice(5)}T12:00:00.000Z`,
        plotId,
        userId
      }

      alerts.push(alert)
    }
  }

  return alerts
}

function processWeatherAlerts(
  dailyData: DailyData,
  plotId: string,
  userId: string,
  year: number
): Alert[] {
  const alerts: Alert[] = []

  const times = dailyData.time || []
  const tempMax = dailyData.temperature_2m_max || []
  const tempMin = dailyData.temperature_2m_min || []
  const precipitation = dailyData.precipitation_sum || []

  let frostDays = 0
  let heatwaveDays = 0
  let consecutiveHeatDays = 0
  let consecutiveDryDays = 0
  let maxConsecutiveHeat = 0
  let maxConsecutiveDry = 0

  for (let i = 0; i < times.length; i++) {
    const dateStr = times[i]
    const tMin = tempMin[i]
    const tMax = tempMax[i]
    const precip = precipitation[i]

    if (!dateStr || tMin === undefined || tMax === undefined || precip === undefined) continue

    if (tMin <= 0) {
      frostDays++
    }

    if (tMax >= 35) {
      consecutiveHeatDays++
      maxConsecutiveHeat = Math.max(maxConsecutiveHeat, consecutiveHeatDays)
    } else {
      consecutiveHeatDays = 0
    }

    if (consecutiveHeatDays >= 3 && heatwaveDays === 0) {
      heatwaveDays = i
    }

    if (precip < 1) {
      consecutiveDryDays++
      maxConsecutiveDry = Math.max(maxConsecutiveDry, consecutiveDryDays)
    } else {
      consecutiveDryDays = 0
    }
  }

  for (let i = 0; i < times.length; i++) {
    const dateStr = times[i]
    const tMin = tempMin[i]

    if (!dateStr || tMin === undefined) continue

    if (tMin <= -1 && tMin >= 3) {
      const date = new Date(dateStr)
      const month = date.getMonth()

      if (month >= 3 && month <= 5) {
        alerts.push({
          id: generateAlertId(),
          category: 'weather',
          type: 'lateFrost' as WeatherAlertType,
          level: tMin <= -2 ? 'critical' : 'high',
          title: WEATHER_ALERT_CONFIG.lateFrost.title,
          description: WEATHER_ALERT_CONFIG.lateFrost.getDescription(tMin),
          recommendation: WEATHER_ALERT_CONFIG.lateFrost.recommendation,
          detectedAt: `${dateStr}T06:00:00.000Z`,
          plotId,
          userId
        })
        break
      }
    }

    if (tMin <= 0 && tMin > -3) {
      if (frostDays <= 5) {
        alerts.push({
          id: generateAlertId(),
          category: 'weather',
          type: 'frost' as WeatherAlertType,
          level: tMin <= -2 ? 'critical' : 'high',
          title: WEATHER_ALERT_CONFIG.frost.title,
          description: WEATHER_ALERT_CONFIG.frost.getDescription(tMin),
          recommendation: WEATHER_ALERT_CONFIG.frost.recommendation,
          detectedAt: `${dateStr}T06:00:00.000Z`,
          plotId,
          userId
        })
        break
      }
    }

    const precip = precipitation[i]
    if (precip !== undefined && precip >= 60) {
      alerts.push({
        id: generateAlertId(),
        category: 'weather',
        type: 'excessiveRain' as WeatherAlertType,
        level: 'medium',
        title: WEATHER_ALERT_CONFIG.excessiveRain.title,
        description: WEATHER_ALERT_CONFIG.excessiveRain.getDescription(precip),
        recommendation: WEATHER_ALERT_CONFIG.excessiveRain.recommendation,
        detectedAt: `${dateStr}T12:00:00.000Z`,
        plotId,
        userId
      })
      break
    }
  }

  if (heatwaveDays > 0) {
    const heatIndex = Math.min(heatwaveDays, times.length - 1)
    const dateStr = times[heatIndex] ?? `${year}-07-15`
    alerts.push({
      id: generateAlertId(),
      category: 'weather',
      type: 'heatwave' as WeatherAlertType,
      level: maxConsecutiveHeat >= 5 ? 'critical' : 'high',
      title: WEATHER_ALERT_CONFIG.heatwave.title,
      description: WEATHER_ALERT_CONFIG.heatwave.getDescription(35),
      recommendation: WEATHER_ALERT_CONFIG.heatwave.recommendation,
      detectedAt: `${dateStr}T14:00:00.000Z`,
      plotId,
      userId
    })
  }

  if (maxConsecutiveDry >= 20) {
    const dryIndex = times.findIndex((t, idx) => {
      let count = 0
      for (let j = idx; j < times.length && count < maxConsecutiveDry; j++) {
        if ((precipitation[j] ?? 0) < 1) count++
        else break
      }
      return count >= maxConsecutiveDry
    })

    if (dryIndex >= 0) {
      const dateStr = times[dryIndex] ?? `${year}-08-01`
      alerts.push({
        id: generateAlertId(),
        category: 'weather',
        type: 'drought' as WeatherAlertType,
        level: maxConsecutiveDry >= 30 ? 'critical' : 'high',
        title: WEATHER_ALERT_CONFIG.drought.title,
        description: WEATHER_ALERT_CONFIG.drought.getDescription(maxConsecutiveDry),
        recommendation: WEATHER_ALERT_CONFIG.drought.recommendation,
        detectedAt: `${dateStr}T12:00:00.000Z`,
        plotId,
        userId
      })
    }
  }

  return alerts
}

function processIrrigationAlerts(
  dailyData: DailyData,
  plotId: string,
  userId: string,
  year: number
): Alert[] {
  const alerts: Alert[] = []

  const soilMoisture = dailyData.soil_moisture_0_to_7cm_mean || []
  const precipitation = dailyData.precipitation_sum || []

  let lowMoistureDays = 0
  let highMoistureDays = 0

  for (let i = 0; i < soilMoisture.length; i++) {
    const moisture = soilMoisture[i]

    if (moisture !== undefined) {
      if (moisture < 20) {
        lowMoistureDays++
      } else if (moisture > 60) {
        highMoistureDays++
      }
    }
  }

  const totalRainDays = precipitation.filter(p => p > 0).length

  if (lowMoistureDays >= 10 && totalRainDays < 30) {
    const deficitDays = lowMoistureDays

    alerts.push({
      id: generateAlertId(),
      category: 'irrigation',
      type: 'irrigation',
      level: deficitDays >= 20 ? 'critical' : 'high',
      action: 'increase' as IrrigationAction,
      reason: `Soil moisture bajo (${(soilMoisture.filter(m => m !== undefined).reduce((a, b) => a + b, 0) / soilMoisture.filter(m => m !== undefined).length).toFixed(1)}% promedio) durante ${deficitDays} días`,
      recommendation: 'Incrementar frecuencia de riego. Aplicar 20% más de agua en horario nocturno.',
      detectedAt: `${year}-07-15T08:00:00.000Z`,
      plotId,
      userId
    })
  }

  if (highMoistureDays >= 10) {
    alerts.push({
      id: generateAlertId(),
      category: 'irrigation',
      type: 'irrigation',
      level: 'medium',
      action: 'decrease' as IrrigationAction,
      reason: `Soil moisture alto (${(soilMoisture.filter(m => m !== undefined).reduce((a, b) => a + b, 0) / soilMoisture.filter(m => m !== undefined).length).toFixed(1)}% promedio) durante ${highMoistureDays} días`,
      recommendation: 'Reducir frecuencia de riego. Verificar drenaje de parcelas.',
      detectedAt: `${year}-04-15T08:00:00.000Z`,
      plotId,
      userId
    })
  }

  return alerts
}

export function processHistoricalData(
  dailyData: DailyData,
  plotId: string,
  userId: string,
  year: number
): Alert[] {
  const alerts: Alert[] = []

  alerts.push(...processDiseaseAlerts(dailyData, plotId, userId, year))
  alerts.push(...processWeatherAlerts(dailyData, plotId, userId, year))
  alerts.push(...processIrrigationAlerts(dailyData, plotId, userId, year))

  return alerts
}
