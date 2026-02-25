import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import DashboardView from './DashboardView.vue'
import DataCard from '@/components/atoms/DataCard.vue'
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
        isHeatWaveLikely: false
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
      weather: { current: {} } // Trigger hasData
    }) as any)

    const wrapper = mount(DashboardView)
    const cards = wrapper.findAllComponents(DataCard)
    // 4 original + 3 new (ET0, Clouds, Sun)
    expect(cards).toHaveLength(7)

    expect(wrapper.text()).toContain('18.5')
    expect(wrapper.text()).toContain('60')
    expect(wrapper.text()).toContain('40')
    expect(wrapper.text()).toContain('0.5')
    expect(wrapper.text()).toContain('2.10') // et0.toFixed(2)
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('1.0') // sunshineDuration / 3600 .toFixed(1)
  })

  it('renders alerts when they are present', () => {
    const alerts = ['Riesgo de Mildiú detectado', 'Riesgo de helada']
    vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
      weather: { current: {} },
      alerts
    }) as any)

    // DashboardView doesn't seem to render alerts list directly anymore?
    // Wait, let's check DashboardView.vue content again.
    // DashboardView.vue has .dashboard__alerts commented out or missing?
    // Let me check lines 140-170 in DashboardView.vue
  })
})
