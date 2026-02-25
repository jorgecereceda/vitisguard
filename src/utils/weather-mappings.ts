export interface WeatherCondition {
  code: number
  description: string
  icon: string
  isDay: boolean
}

const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Cielo despejado', icon: '☀️' },
  1: { description: 'Mayormente despejado', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Niebla', icon: '🌫️' },
  48: { description: 'Niebla escarchada', icon: '🌫️' },
  51: { description: 'Llovizna ligera', icon: '🌧️' },
  53: { description: 'Llovizna moderada', icon: '🌧️' },
  55: { description: 'Llovizna densa', icon: '🌧️' },
  56: { description: 'Llovizna helada ligera', icon: '🌨️' },
  57: { description: 'Llovizna helada densa', icon: '🌨️' },
  61: { description: 'Lluvia ligera', icon: '🌧️' },
  63: { description: 'Lluvia moderada', icon: '🌧️' },
  65: { description: 'Lluvia intensa', icon: '🌧️' },
  66: { description: 'Lluvia helada ligera', icon: '🌨️' },
  67: { description: 'Lluvia helada intensa', icon: '🌨️' },
  71: { description: 'Nevada ligera', icon: '🌨️' },
  73: { description: 'Nevada moderada', icon: '🌨️' },
  75: { description: 'Nevada intensa', icon: '🌨️' },
  77: { description: 'Granizo', icon: '🌨️' },
  80: { description: 'Chubascos ligeros', icon: '🌦️' },
  81: { description: 'Chubascos moderados', icon: '🌦️' },
  82: { description: 'Chubascos intensos', icon: '🌦️' },
  85: { description: 'Chubascos de nieve ligeros', icon: '🌨️' },
  86: { description: 'Chubascos de nieve intensos', icon: '🌨️' },
  95: { description: 'Tormenta eléctrica', icon: '⛈️' },
  96: { description: 'Tormenta con granizo ligero', icon: '⛈️' },
  99: { description: 'Tormenta con granizo intenso', icon: '⛈️' },
}

export function getWeatherCondition(code: number, isDay: boolean = true): WeatherCondition {
  const weather = WEATHER_CODES[code] || { description: 'Desconocido', icon: '❓' }

  let icon = weather.icon

  if (!isDay) {
    if (icon === '☀️') icon = '🌙'
    else if (icon === '🌤️') icon = '🌙'
    else if (icon === '⛅') icon = '☁️'
  }

  return {
    code,
    description: weather.description,
    icon,
    isDay,
  }
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index] ?? 'N'
}

export function getUVIndexLevel(uv: number): { level: string; color: string } {
  if (uv <= 2) return { level: 'Bajo', color: '#22c55e' }
  if (uv <= 5) return { level: 'Moderado', color: '#eab308' }
  if (uv <= 7) return { level: 'Alto', color: '#f97316' }
  if (uv <= 10) return { level: 'Muy Alto', color: '#ef4444' }
  return { level: 'Extremo', color: '#a855f7' }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}
