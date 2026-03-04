import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import DashboardView from './DashboardView.vue'
import * as weatherComposable from '@/composables/use-weather'

import { createPinia, setActivePinia } from 'pinia'

// Mock the components used in the view
vi.mock('@/layout/PannelLauyout.vue', () => ({
  default: {
    name: 'PannelLauyout',
    template: '<div><slot /></div>'
  }
}))

vi.mock('@/components/organisms/SideNavigation.vue', () => ({
  default: {
    name: 'SideNavigation',
    template: '<div />'
  }
}))

vi.mock('@/components/organisms/DesktopHeader.vue', () => ({
  default: {
    name: 'DesktopHeader',
    template: '<div />'
  }
}))

vi.mock('@/components/molecules/weather-current/WeatherCurrent.vue', () => ({
  default: {
    name: 'WeatherCurrent',
    template: '<div class="weather-current" />'
  }
}))

vi.mock('@/components/molecules/weather-forecast/WeatherForecast.vue', () => ({
  default: {
    name: 'WeatherForecast',
    template: '<div class="weather-forecast" />'
  }
}))

vi.mock('@/components/molecules/SoilMoistureCard.vue', () => ({
  default: {
    name: 'SoilMoistureCard',
    template: '<div class="soil-moisture-card" />'
  }
}))

vi.mock('@/components/molecules/evapotranspiration-card/EvapotranspirationCard.vue', () => ({
  default: {
    name: 'EvapotranspirationCard',
    template: '<div class="evapotranspiration-card" />'
  }
}))

// Mock the useWeather and useGeolocation composables
vi.mock('@/composables/use-weather', () => ({
  useWeather: vi.fn()
}))

vi.mock('@/composables/useGeolocation', () => ({
  useGeolocation: vi.fn(() => ({
    state: ref({
      latitude: 43.3183,
      longitude: -1.9812,
      error: null,
      isLoading: false
    }),
    getLocation: vi.fn()
  }))
}))

vi.mock('@/stores/weather', () => ({
  useWeatherStore: vi.fn(() => ({
    userLocation: { latitude: 43.3183, longitude: -1.9812 },
    loadParcels: vi.fn(),
    selectedParcel: { denomination: 'Getaria' },
  }))
}))

describe('DashboardView.vue', () => {
  const mockFetchWeather = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createMockWeather = (overrides: any = {}) => {
    const weather = ref(overrides.weather || null)
    const weatherData = computed(() => {
      if (!weather.value) return null
      return overrides.weatherData || {
        temperature: 18.5,
        humidity: 60,
        soilHumidity: 40,
        precipitation: 0.5,
        cloudCover: 15,
        et0: 2.1,
        sunshineDuration: 3600,
        isFrostLikely: false,
        isHeatWaveLikely: false,
        allDaysSoilMoisture: [
          { current: 40, depth20: 35, depth40: 30, depth60: 25 },
        ],
      }
    })
    const isLoading = ref(overrides.isLoading || false)
    const error = ref(overrides.error || null)
    const alertsList = ref(overrides.alerts || [])
    const alerts = computed(() => alertsList.value)

    return {
      weather,
      weatherData,
      isLoading,
      error,
      isError: computed(() => !!error.value),
      hasData: computed(() => !!weather.value),
      alerts,
      fetchWeather: mockFetchWeather,
      loadWeather: vi.fn(),
      clearWeather: vi.fn(),
      abortPreviousRequest: vi.fn(),
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      setOptions: vi.fn()
    }
  }

  it('renders loading state correctly', () => {
    vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
      isLoading: true
    }) as any)

    const wrapper = mount(DashboardView)
    expect(wrapper.find('.dashboard__loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cargando datos meteorológicos...')
  })

  it('renders error state with retry button', async () => {
    const errorMessage = 'Error al cargar datos'
    vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
      error: new Error(errorMessage)
    }) as any)

    const wrapper = mount(DashboardView)
    expect(wrapper.find('.dashboard__error').exists()).toBe(true)
    expect(wrapper.text()).toContain(errorMessage)

    const retryBtn = wrapper.find('.dashboard__retry-btn')
    expect(retryBtn.exists()).toBe(true)
    await retryBtn.trigger('click')
    expect(mockFetchWeather).toHaveBeenCalled()
  })

  it('renders weather data cards correctly', () => {
    vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
      weather: {
        current: {},
        daily: {
          time: ['2024-01-01'],
          temperature_2m_max: [25],
          temperature_2m_min: [10],
          precipitation_sum: [0],
          wind_speed_10m_max: [10],
          uv_index_max: [5],
          et0_fao_evapotranspiration: [2.1],
          sunshine_duration: [3600],
        },
        hourly: {
          time: ['2024-01-01T00:00:00Z'],
          relative_humidity_2m: [60],
        },
      }
    }) as any)

    const wrapper = mount(DashboardView)

    expect(wrapper.find('.weather-current').exists()).toBe(true)
    expect(wrapper.find('.weather-forecast').exists()).toBe(true)
    expect(wrapper.find('.soil-moisture-card').exists()).toBe(true)
    expect(wrapper.find('.evapotranspiration-card').exists()).toBe(true)
  })
})
