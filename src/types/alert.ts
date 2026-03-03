import type { DiseaseType, RiskLevel, AlertCategory, WeatherAlertType, IrrigationAction } from './disease'

export type { AlertCategory, RiskLevel, WeatherAlertType, IrrigationAction }
export type { DiseaseType }

export interface BaseAlert {
  id: string
  category: AlertCategory
  level: RiskLevel
  detectedAt: string
  plotId: string
  userId: string
  completed?: boolean
  completedAt?: string | null
}

export interface DiseaseAlert extends BaseAlert {
  category: 'disease'
  disease: DiseaseType
  probability: number
  conditions: string[]
  recommendation: string
}

export interface WeatherAlertData extends BaseAlert {
  category: 'weather'
  type: WeatherAlertType
  title: string
  description: string
  recommendation: string
}

export interface IrrigationAlert extends BaseAlert {
  category: 'irrigation'
  type: 'irrigation'
  action: IrrigationAction
  reason: string
  recommendation: string
}

export type Alert = DiseaseAlert | WeatherAlertData | IrrigationAlert

export interface AlertStats {
  id: string
  period: string
  diseaseAlerts: number
  weatherAlerts: number
  irrigationAlerts: number
  heatwaves?: number
  frosts?: number
  lateFrosts?: number
  droughts?: number
  excessiveRain?: number
  mildiu?: number
  botrytis?: number
  oidio?: number
  excoriosis?: number
}

export interface HistoricalAlertOptions {
  year: number
  pastDays?: number
}

export interface AlertLogApi {
  id: string
  lastQueryDate: string
  yearGenerated: number
}
