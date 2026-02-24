import type { DiseaseConfig } from '@/types/disease'

export const DISEASE_CONFIGS: Record<string, DiseaseConfig> = {
  mildiu: {
    name: 'Mildiú (Downy Mildew)',
    thresholds: {
      tempMin: 6,
      tempMax: 26,
      humidityMin: 90,
      precipitationMin: 6,
      incubationDays: 7,
    },
    weights: {
      temperature: 0.35,
      humidity: 0.40,
      precipitation: 0.25,
    },
    recommendations: {
      low: 'Condiciones desfavorables para Mildiú. Continuar monitoreo regular.',
      medium: 'Monitorear condiciones. Preparar fungicida preventivo.',
      high: 'Alto riesgo de Mildiú. Considerar aplicación preventiva de fungicida.',
      critical: 'Riesgo crítico de Mildiú. Aplicar fungicida inmediatamente y aumentar aireación.',
    },
  },
  botrytis: {
    name: 'Botrytis (Grey Mold)',
    thresholds: {
      tempMin: 15,
      tempMax: 25,
      humidityMin: 80,
      wetnessHoursMin: 10,
    },
    weights: {
      temperature: 0.30,
      humidity: 0.45,
      precipitation: 0.25,
    },
    recommendations: {
      low: 'Condiciones desfavorables para Botrytis. Continuar monitoreo.',
      medium: 'Riesgo moderado. Eliminar racimos dañados.',
      high: 'Alto riesgo de Botrytis. Aplicar tratamiento fungicida y mejorar ventilación.',
      critical: 'Riesgo crítico. Eliminar racimos afectados inmediatamente y aplicar fungicida.',
    },
  },
  oidio: {
    name: 'Oídio (Powdery Mildew)',
    thresholds: {
      tempMin: 15,
      tempMax: 28,
      humidityMin: 40,
      humidityMax: 80,
    },
    weights: {
      temperature: 0.40,
      humidity: 0.35,
      precipitation: 0.25,
    },
    recommendations: {
      low: 'Condiciones desfavorables para Oídio.',
      medium: 'Monitorear plantas sensibles.',
      high: 'Alto riesgo de Oídio. Aplicar azufre o fungicida.',
      critical: 'Riesgo crítico. Aplicar tratamiento inmediatamente.',
    },
  },
  excoriosis: {
    name: 'Excoriosis (Phomopsis)',
    thresholds: {
      tempMin: 5,
      tempMax: 25,
      humidityMin: 85,
      precipitationMin: 2,
    },
    weights: {
      temperature: 0.35,
      humidity: 0.40,
      precipitation: 0.25,
    },
    recommendations: {
      low: 'Condiciones desfavorables para Excoriosis.',
      medium: 'Monitorear heridas de poda.',
      high: 'Alto riesgo. Aplicar tratamiento preventivo.',
      critical: 'Riesgo crítico. Tratar inmediatamente.',
    },
  },
}

export const RISK_THRESHOLDS = {
  low: 30,
  medium: 60,
  high: 85,
  critical: 100,
} as const

export function calculateRiskLevel(probability: number): 'low' | 'medium' | 'high' | 'critical' {
  if (probability <= RISK_THRESHOLDS.low) return 'low'
  if (probability <= RISK_THRESHOLDS.medium) return 'medium'
  if (probability <= RISK_THRESHOLDS.high) return 'high'
  return 'critical'
}
