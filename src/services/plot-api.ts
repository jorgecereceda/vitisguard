import type { Parcel } from '@/types/weather'

const API_BASE_URL = 'http://localhost:3000'

export async function getAllPlots(): Promise<Parcel[]> {
  const response = await fetch(`${API_BASE_URL}/plots`)

  if (!response.ok) {
    throw new Error('Failed to fetch plots')
  }

  return response.json()
}

export async function getPlotById(id: string): Promise<Parcel | null> {
  const response = await fetch(`${API_BASE_URL}/plots/${id}`)

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error('Failed to fetch plot')
  }

  return response.json()
}

export async function createPlot(
  parcel: Omit<Parcel, 'id'>
): Promise<Parcel> {
  const response = await fetch(`${API_BASE_URL}/plots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(parcel)
  })

  if (!response.ok) {
    throw new Error('Failed to create plot')
  }

  return response.json()
}

export async function updatePlot(
  id: string,
  updates: Partial<Parcel>
): Promise<Parcel> {
  const response = await fetch(`${API_BASE_URL}/plots/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    throw new Error('Failed to update plot')
  }

  return response.json()
}

export async function deletePlot(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/plots/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete plot')
  }
}
