import type { Alert, AlertStats } from '@/types/alert'
import type { Parcel, WeatherLocation, DailyData } from '@/types/weather'
import { processHistoricalData } from './alert-processor'

const API_BASE_URL = 'http://localhost:3000'
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const API_TIMEOUT_MS = 10000

export class AlertApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'AlertApiError'
  }
}

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts`)

  if (!response.ok) {
    throw new AlertApiError('Failed to fetch alerts')
  }

  return response.json()
}

export async function getAlertsByUserId(userId: string): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts?userId=${userId}`)

  if (!response.ok) {
    throw new AlertApiError('Failed to fetch alerts by user')
  }

  return response.json()
}

export async function getAlertsByPlotId(plotId: string): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts?plotId=${plotId}`)

  if (!response.ok) {
    throw new AlertApiError('Failed to fetch alerts by plot')
  }

  return response.json()
}

export async function getAlertById(id: string): Promise<Alert | null> {
  const response = await fetch(`${API_BASE_URL}/alerts/${id}`)

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new AlertApiError('Failed to fetch alert')
  }

  return response.json()
}

export async function createAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
  const response = await fetch(`${API_BASE_URL}/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(alert)
  })

  if (!response.ok) {
    throw new AlertApiError('Failed to create alert')
  }

  return response.json()
}

export async function createAlerts(alerts: Omit<Alert, 'id'>[]): Promise<Alert[]> {
  const createdAlerts: Alert[] = []

  for (const alert of alerts) {
    const created = await createAlert(alert)
    createdAlerts.push(created)
  }

  return createdAlerts
}

export async function deleteAlert(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alerts/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new AlertApiError('Failed to delete alert')
  }
}

export async function deleteAllAlerts(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alerts`, {
    method: 'GET'
  })

  if (!response.ok) {
    return
  }

  const alerts: Alert[] = await response.json()

  for (const alert of alerts) {
    await fetch(`${API_BASE_URL}/alerts/${alert.id}`, {
      method: 'DELETE'
    })
  }
}

export async function getAlertStats(): Promise<AlertStats[]> {
  const response = await fetch(`${API_BASE_URL}/alertStats`)

  if (!response.ok) {
    throw new AlertApiError('Failed to fetch alert stats')
  }

  return response.json()
}

export async function getAlertStatsByPeriod(period: string): Promise<AlertStats | null> {
  const response = await fetch(`${API_BASE_URL}/alertStats?period=${period}`)

  if (!response.ok) {
    throw new AlertApiError('Failed to fetch alert stats by period')
  }

  const stats = await response.json()
  return stats.length > 0 ? stats[0] : null
}

export async function createAlertStats(stats: Omit<AlertStats, 'id'>): Promise<AlertStats> {
  const response = await fetch(`${API_BASE_URL}/alertStats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(stats)
  })

  if (!response.ok) {
    throw new AlertApiError('Failed to create alert stats')
  }

  return response.json()
}

export async function updateAlertStats(
  id: string,
  updates: Partial<AlertStats>
): Promise<AlertStats> {
  const response = await fetch(`${API_BASE_URL}/alertStats/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    throw new AlertApiError('Failed to update alert stats')
  }

  return response.json()
}

async function fetchHistoricalWeatherFromOpenMeteo(
  location: WeatherLocation,
  startDate: string,
  endDate: string
): Promise<DailyData> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean',
      'precipitation_sum',
      'relative_humidity_2m_min',
      'soil_moisture_0_to_7cm_mean',
      'soil_temperature_0_to_7cm_mean',
      'sunshine_duration',
    ].join(','),
    timezone: 'UTC',
    start_date: startDate,
    end_date: endDate,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`, {
      signal: controller.signal
    })

    if (!response.ok) {
      throw new AlertApiError(
        `HTTP error: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    return data.daily as DailyData
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new AlertApiError('Request timeout exceeded')
      }
      throw error
    }
    throw new AlertApiError('Unknown error occurred')
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function generateHistoricalAlertsForPlot(
  plot: Parcel,
  startDate: string,
  endDate: string,
  year: number
): Promise<Alert[]> {
  const location: WeatherLocation = {
    latitude: plot.latitude,
    longitude: plot.longitude
  }

  const historicalData = await fetchHistoricalWeatherFromOpenMeteo(
    location,
    startDate,
    endDate
  )

  const alerts = processHistoricalData(
    historicalData,
    plot.id,
    plot.userId,
    year
  )

  return alerts
}

export async function generateHistoricalAlertsForUser(
  userId: string,
  startDate: string,
  endDate: string,
  year: number
): Promise<Alert[]> {
  const userPlotsResponse = await fetch(`${API_BASE_URL}/plots?userId=${userId}`)

  if (!userPlotsResponse.ok) {
    throw new AlertApiError('Failed to fetch user plots')
  }

  const plots: Parcel[] = await userPlotsResponse.json()
  const allAlerts: Alert[] = []

  for (const plot of plots) {
    const plotAlerts = await generateHistoricalAlertsForPlot(
      plot,
      startDate,
      endDate,
      year
    )
    allAlerts.push(...plotAlerts)
  }

  if (allAlerts.length > 0) {
    await createAlerts(allAlerts)
  }

  return allAlerts
}
