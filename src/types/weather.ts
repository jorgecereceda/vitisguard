export const HOURLY_VARIABLES = [
  'temperature_2m',
  'relative_humidity_2m',
  'precipitation',
  'rain',
  'showers',
  'soil_moisture_0_to_7cm',
  'soil_moisture_7_to_28cm',
  'soil_temperature_0_to_7cm',
  'soil_temperature_7_to_28cm',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'shortwave_radiation',
  'direct_radiation',
  'diffuse_radiation',
  'sunshine_duration',
  'et0_fao_evapotranspiration',
  'snowfall',
  'snow_depth',
  'uv_index',
] as const

export const DAILY_VARIABLES = [
  'temperature_2m_max',
  'temperature_2m_min',
  'temperature_2m_mean',
  'precipitation_sum',
  'rain_sum',
  'showers_sum',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'wind_direction_10m_dominant',
  'shortwave_radiation_sum',
  'sunshine_duration',
  'et0_fao_evapotranspiration',
  'snowfall_sum',
  'uv_index_max',
  'relative_humidity_2m_min',
] as const

export type HourlyVariable = typeof HOURLY_VARIABLES[number]
export type DailyVariable = typeof DAILY_VARIABLES[number]

export interface WeatherLocation {
  latitude: number
  longitude: number
}

export interface WeatherOptions {
  hourly?: HourlyVariable[]
  daily?: DailyVariable[]
  forecastDays?: number
  pastDays?: number
}

export interface HourlyData {
  time: string[]
  temperature_2m?: number[]
  relative_humidity_2m?: number[]
  precipitation?: number[]
  rain?: number[]
  showers?: number[]
  snowfall?: number[]
  snow_depth?: number[]
  soil_moisture_0_to_7cm?: number[]
  soil_moisture_7_to_28cm?: number[]
  soil_temperature_0_to_7cm?: number[]
  soil_temperature_7_to_28cm?: number[]
  wind_speed_10m?: number[]
  wind_gusts_10m?: number[]
  wind_direction_10m?: number[]
  shortwave_radiation?: number[]
  direct_radiation?: number[]
  diffuse_radiation?: number[]
  sunshine_duration?: number[]
  et0_fao_evapotranspiration?: number[]
  uv_index?: number[]
}

export interface DailyData {
  time: string[]
  temperature_2m_max?: number[]
  temperature_2m_min?: number[]
  temperature_2m_mean?: number[]
  precipitation_sum?: number[]
  rain_sum?: number[]
  showers_sum?: number[]
  snowfall_sum?: number[]
  wind_speed_10m_max?: number[]
  wind_gusts_10m_max?: number[]
  wind_direction_10m_dominant?: number[]
  shortwave_radiation_sum?: number[]
  sunshine_duration?: number[]
  et0_fao_evapotranspiration?: number[]
  uv_index_max?: number[]
  relative_humidity_2m_min?: number[]
}

export interface WeatherResponse {
  latitude: number
  longitude: number
  elevation: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  generationtime_ms: number
  hourly: HourlyData
  daily: DailyData
}
