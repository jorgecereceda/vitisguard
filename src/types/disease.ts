export type DiseaseType = 'mildiu' | 'botrytis' | 'oidio' | 'excoriosis'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type AlertCategory = 'disease' | 'weather' | 'irrigation'

export interface DiseaseRisk {
  id: string
  category: 'disease'
  disease: DiseaseType
  level: RiskLevel
  probability: number
  conditions: string[]
  recommendation: string
  detectedAt: Date
}

export type WeatherAlertType = 'frost' | 'lateFrost' | 'heatwave' | 'storm' | 'drought' | 'excessiveRain'

export interface WeatherAlert {
  id: string
  category: 'weather'
  type: WeatherAlertType
  level: RiskLevel
  title: string
  description: string
  recommendation: string
  detectedAt: Date
}

export type IrrigationAction = 'increase' | 'decrease' | 'maintain'

export interface IrrigationRecommendation {
  id: string
  category: 'irrigation'
  type: 'irrigation'
  level: 'low' | 'medium' | 'high'
  action: IrrigationAction
  reason: string
  recommendation: string
  detectedAt: Date
}

export type AnyRecommendation = DiseaseRisk | WeatherAlert | IrrigationRecommendation

export interface WeatherConditions {
  temperature: number | null
  humidity: number | null
  precipitation: number | null
  soilMoisture: number | null
  soilTemperature: number | null
  sunshineHours: number | null
  windSpeed: number | null
}

export interface DiseaseThresholds {
  tempMin: number
  tempMax: number
  humidityMin: number
  humidityMax?: number
  precipitationMin?: number
  wetnessHoursMin?: number
  incubationDays?: number
}

export interface DiseaseConfig {
  name: string
  thresholds: DiseaseThresholds
  weights: {
    temperature: number
    humidity: number
    precipitation: number
  }
  recommendations: Record<RiskLevel, string>
}
