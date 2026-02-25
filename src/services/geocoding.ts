export interface GeocodingResult {
  latitude: number
  longitude: number
  name: string
  displayName: string
}

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) return []

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&addressdetails=1`
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()

    return data.map((item: { lat: string; lon: string; name?: string; display_name: string }) => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
    }))
  } catch (error) {
    console.error('Error searching address:', error)
    return []
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    )

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed')
    }

    const data = await response.json()
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }
}

export function parseCoordinates(query: string): { lat: number; lon: number } | null {
  const trimmed = query.trim()
  // Regex for coordinates: -90 to 90 lat, -180 to 180 lon
  const coordRegex = /^([-+]?([1-8]?\d(\.\d+)?|90(\.0+)?))\s*,\s*([-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?))$/
  const match = trimmed.match(coordRegex)

  if (match && match[1] !== undefined && match[5] !== undefined) {
    return {
      lat: parseFloat(match[1]),
      lon: parseFloat(match[5])
    }
  }
  return null
}
