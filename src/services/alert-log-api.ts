import type { AlertLogApi } from '@/types/alert'

const API_BASE_URL = 'http://localhost:3000'
const DAYS_BETWEEN_REFRESH = 30

export class AlertLogApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'AlertLogApiError'
  }
}

export async function getAlertLog(): Promise<AlertLogApi | null> {
  const response = await fetch(`${API_BASE_URL}/alertLogApi/global`)

  if (!response.ok) {
    if (response.status === 404) {
      console.warn('Alert log not found (404) at /alertLogApi/global')
      return null
    }
    console.error(`Failed to fetch alert log: ${response.status} ${response.statusText}`)
    throw new AlertLogApiError('Failed to fetch alert log')
  }

  return response.json()
}

export async function createAlertLog(
  yearGenerated: number
): Promise<AlertLogApi> {
  const response = await fetch(`${API_BASE_URL}/alertLogApi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'global',
      lastQueryDate: new Date().toISOString(),
      yearGenerated
    })
  })

  if (!response.ok) {
    throw new AlertLogApiError('Failed to create alert log')
  }

  return response.json()
}

export async function updateAlertLog(
  yearGenerated: number
): Promise<AlertLogApi> {
  const response = await fetch(`${API_BASE_URL}/alertLogApi/global`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'global',
      lastQueryDate: new Date().toISOString(),
      yearGenerated
    })
  })

  if (!response.ok) {
    console.error(`Failed to update alert log: ${response.status} ${response.statusText}`)
    throw new AlertLogApiError('Failed to update alert log')
  }

  return response.json()
}

export function shouldRefresh(lastQueryDate: string): boolean {
  const lastDate = new Date(lastQueryDate)
  const now = new Date()

  const diffTime = now.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= DAYS_BETWEEN_REFRESH
}

export function calculateHistoricalDateRange(): {
  startDate: string
  endDate: string
  year: number
} {
  const now = new Date()
  const fiveDaysAgo = new Date(now.setDate(now.getDate() - 5))
  const currentYear = fiveDaysAgo.getFullYear()
  const currentMonth = fiveDaysAgo.getMonth()
  const currentDay = fiveDaysAgo.getDate()

  let startYear = currentYear - 1
  let startMonth = currentMonth
  let startDay = currentDay

  const startDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`
  const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`

  return {
    startDate,
    endDate,
    year: currentYear - 1
  }
}
