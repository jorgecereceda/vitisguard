import type { WeatherAlert, WeatherAlertType, RiskLevel } from '@/types/disease'

export interface WeatherAlertConfig {
  type: WeatherAlertType
  title: string
  description: string
  recommendations: Record<RiskLevel, string>
}

export const WEATHER_ALERT_CONFIGS: Record<WeatherAlertType, WeatherAlertConfig> = {
  frost: {
    type: 'frost',
    title: 'Helada',
    description: 'Temperatura bajo cero detectada',
    recommendations: {
      low: 'Monitorear condiciones.',
      medium: 'Considerar protección de plantas sensibles.',
      high: 'Aplicar protección inmediata a cultivos sensibles.',
      critical: 'ALERTA: Cubra las plantas inmediatamente. Riesgo de daños severos.',
    },
  },
  lateFrost: {
    type: 'lateFrost',
    title: 'Helada Tardía',
    description: 'Temperatura baja detectada en época de crecimiento',
    recommendations: {
      low: 'Monitorearpronóstico.',
      medium: 'Preparar sistemas de protección.',
      high: 'Activar protección de cultivos.',
      critical: 'Riesgo de daños severos. Aplicar protección urgente.',
    },
  },
  heatwave: {
    type: 'heatwave',
    title: 'Ola de Calor',
    description: 'Temperaturas extremas detectadas',
    recommendations: {
      low: 'Mantener monitoreo.',
      medium: 'Aumentar riego matutino.',
      high: 'Proveer sombra a plantas sensibles.',
      critical: 'Riesgo de estrés térmico severo. Regar inmediatamente y proporcionar sombra.',
    },
  },
  storm: {
    type: 'storm',
    title: 'Tormenta',
    description: 'Condiciones de tormenta severas',
    recommendations: {
      low: 'Monitorear.',
      medium: 'Asegurar estructuras de soporte.',
      high: 'Proteger plantas delicadas.',
      critical: 'Peligro inmediato. Asegurar todas las estructuras y plantas.',
    },
  },
  drought: {
    type: 'drought',
    title: 'Sequía',
    description: 'Período prolongado sin precipitación',
    recommendations: {
      low: 'Monitorear humedad del suelo.',
      medium: 'Considerar riego preventivo.',
      high: 'Incrementar frecuencia de riego.',
      critical: 'Emergencia de agua. Riego urgente necesario.',
    },
  },
  excessiveRain: {
    type: 'excessiveRain',
    title: 'Exceso de Lluvia',
    description: 'Precipitación excesiva acumulada',
    recommendations: {
      low: 'Monitorear drenaje.',
      medium: 'Verificar sistemas de drenaje.',
      high: 'Activar drenaje preventivo.',
      critical: 'Riesgo de inundación. Drenaje inmediato requerido.',
    },
  },
}

export function generateWeatherAlerts(
  temperature: number | null,
  humidity: number | null,
  precipitation: number | null,
  windSpeed: number | null,
  daysWithoutRain: number = 0
): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  const now = new Date()
  const month = now.getMonth() + 1

  if (temperature !== null) {
    if (temperature < 0) {
      alerts.push({
        id: `frost-${now.getTime()}`,
        category: 'weather',
        type: 'frost',
        level: temperature < -5 ? 'critical' : 'high',
        title: WEATHER_ALERT_CONFIGS.frost.title,
        description: `Temperatura actual: ${temperature}°C`,
        recommendation: WEATHER_ALERT_CONFIGS.frost.recommendations[
          temperature < -5 ? 'critical' : 'high'
        ],
        detectedAt: now,
      })
    }

    if (temperature < 3 && month >= 3 && month <= 5) {
      alerts.push({
        id: `lateFrost-${now.getTime()}`,
        category: 'weather',
        type: 'lateFrost',
        level: temperature < 0 ? 'critical' : 'high',
        title: WEATHER_ALERT_CONFIGS.lateFrost.title,
        description: `Temperatura: ${temperature}°C en primavera`,
        recommendation: WEATHER_ALERT_CONFIGS.lateFrost.recommendations[
          temperature < 0 ? 'critical' : 'high'
        ],
        detectedAt: now,
      })
    }

    if (temperature > 35) {
      alerts.push({
        id: `heatwave-${now.getTime()}`,
        category: 'weather',
        type: 'heatwave',
        level: temperature > 40 ? 'critical' : 'high',
        title: WEATHER_ALERT_CONFIGS.heatwave.title,
        description: `Temperatura: ${temperature}°C`,
        recommendation: WEATHER_ALERT_CONFIGS.heatwave.recommendations[
          temperature > 40 ? 'critical' : 'high'
        ],
        detectedAt: now,
      })
    }
  }

  if (precipitation !== null && windSpeed !== null) {
    if (precipitation > 50 && windSpeed > 50) {
      alerts.push({
        id: `storm-${now.getTime()}`,
        category: 'weather',
        type: 'storm',
        level: 'critical',
        title: WEATHER_ALERT_CONFIGS.storm.title,
        description: `Precipitación: ${precipitation}mm/h, Viento: ${windSpeed}km/h`,
        recommendation: WEATHER_ALERT_CONFIGS.storm.recommendations.critical,
        detectedAt: now,
      })
    }
  }

  if (daysWithoutRain >= 7) {
    const level = daysWithoutRain >= 14 ? 'critical' : daysWithoutRain >= 10 ? 'high' : 'medium'
    alerts.push({
      id: `drought-${now.getTime()}`,
      category: 'weather',
      type: 'drought',
      level,
      title: WEATHER_ALERT_CONFIGS.drought.title,
      description: `${daysWithoutRain} días sin lluvia`,
      recommendation: WEATHER_ALERT_CONFIGS.drought.recommendations[level],
      detectedAt: now,
    })
  }

  if (precipitation !== null && precipitation > 100) {
    alerts.push({
      id: `excessiveRain-${now.getTime()}`,
      category: 'weather',
      type: 'excessiveRain',
      level: precipitation > 150 ? 'critical' : 'high',
      title: WEATHER_ALERT_CONFIGS.excessiveRain.title,
      description: `Precipitación: ${precipitation}mm en las últimas horas`,
      recommendation: WEATHER_ALERT_CONFIGS.excessiveRain.recommendations[
        precipitation > 150 ? 'critical' : 'high'
      ],
      detectedAt: now,
    })
  }

  return alerts
}

export function generateIrrigationRecommendation(
  soilMoisture: number | null,
  evapotranspiration: number | null,
  _precipitation: number | null
): IrrigationRecommendation | null {
  const now = new Date()

  if (soilMoisture === null) return null

  if (soilMoisture < 20) {
    return {
      id: `irrigation-${now.getTime()}`,
      category: 'irrigation',
      type: 'irrigation',
      level: 'high',
      action: 'increase',
      reason: `Humedad del suelo muy baja: ${soilMoisture}%`,
      recommendation: 'Riego urgente necesario. Incrementar frecuencia y cantidad.',
      detectedAt: now,
    }
  }

  if (soilMoisture < 30) {
    return {
      id: `irrigation-${now.getTime()}`,
      category: 'irrigation',
      type: 'irrigation',
      level: 'medium',
      action: 'increase',
      reason: `Humedad del suelo baja: ${soilMoisture}%`,
      recommendation: 'Incrementar frecuencia de riego.',
      detectedAt: now,
    }
  }

  if (soilMoisture > 80) {
    return {
      id: `irrigation-${now.getTime()}`,
      category: 'irrigation',
      type: 'irrigation',
      level: 'high',
      action: 'decrease',
      reason: `Humedad del suelo muy alta: ${soilMoisture}%`,
      recommendation: 'Reducir o suspender riego. Verificar drenaje.',
      detectedAt: now,
    }
  }

  if (soilMoisture > 70) {
    return {
      id: `irrigation-${now.getTime()}`,
      category: 'irrigation',
      type: 'irrigation',
      level: 'medium',
      action: 'decrease',
      reason: `Humedad del suelo elevada: ${soilMoisture}%`,
      recommendation: 'Reducir frecuencia de riego.',
      detectedAt: now,
    }
  }

  if (evapotranspiration !== null && evapotranspiration > 5 && soilMoisture < 50) {
    return {
      id: `irrigation-${now.getTime()}`,
      category: 'irrigation',
      type: 'irrigation',
      level: 'medium',
      action: 'increase',
      reason: `Alta evapotranspiración: ${evapotranspiration}mm/día`,
      recommendation: 'Considerar riego por alta evaporación.',
      detectedAt: now,
    }
  }

  return {
    id: `irrigation-${now.getTime()}`,
    category: 'irrigation',
    type: 'irrigation',
    level: 'low',
    action: 'maintain',
    reason: `Humedad del suelo óptima: ${soilMoisture}%`,
    recommendation: 'Mantener rutina de riego actual.',
    detectedAt: now,
  }
}

export interface IrrigationRecommendation {
  id: string
  category: 'irrigation'
  type: 'irrigation'
  level: 'low' | 'medium' | 'high'
  action: 'increase' | 'decrease' | 'maintain'
  reason: string
  recommendation: string
  detectedAt: Date
}