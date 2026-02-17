export type DiseaseType = 'mildiu' | 'botrytis' | 'oidio' | 'excoriosis'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface DiseaseRisk {
  disease: DiseaseType
  level: RiskLevel
  probability: number
  conditions: string[]
  recommendation: string
  detectedAt: Date
}

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
