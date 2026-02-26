import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import DashboardView from './DashboardView.vue'
import DataCard from '@/components/atoms/DataCard.vue'
import * as weatherComposable from '@/composables/useWeather'

// Mock the useWeather and useGeolocation composables
vi.mock('@/composables/useWeather', () => ({
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
    vi.clearAllMocks()
  })

interface MockWeatherOptions {
  weatherData?: ReturnType<typeof ref> | null
  isLoading?: boolean
  error?: string | null
  alerts?: string[]
}

  const createMockWeather = (overrides: MockWeatherOptions = {}) => {
    const weatherData = ref(overrides.weatherData || null)
    const isLoading = ref(overrides.isLoading || false)
    const error = ref(overrides.error || null)
    const alertsList = ref(overrides.alerts || [])
    const alerts = computed(() => alertsList.value)

    return {
      weatherData,
      isLoading,
      error,
      alerts,
      fetchWeather: mockFetchWeather
    }
  }

  it('renders loading state correctly', () => {
    vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
      isLoading: true
    }))

    const wrapper = mount(DashboardView)
    expect(wrapper.find('.dashboard__loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cargando datos meteorológicos...')
  })

  it('renders error state with retry button', async () => {
    const errorMessage = 'Error al cargar datos'
    vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
      error: errorMessage
    }))

    const wrapper = mount(DashboardView)
    expect(wrapper.find('.dashboard__error').exists()).toBe(true)
    expect(wrapper.text()).toContain(errorMessage)

    const retryBtn = wrapper.find('.dashboard__retry-btn')
    expect(retryBtn.exists()).toBe(true)
    await retryBtn.trigger('click')
    expect(mockFetchWeather).toHaveBeenCalled()
  })

  it('renders weather data cards correctly', () => {
    const weatherData = {
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
    vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
      weatherData
    }))

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
      weatherData: {
        temperature: 15,
        humidity: 90,
        soilHumidity: 45,
        precipitation: 0,
        cloudCover: 0,
        et0: 0,
        sunshineDuration: 0,
        isFrostLikely: false,
        isHeatWaveLikely: false
      },
      alerts
    }))

    const wrapper = mount(DashboardView)
    expect(wrapper.find('.dashboard__alerts').exists()).toBe(true)
    const alertItems = wrapper.findAll('.dashboard__alert-item')
    expect(alertItems).toHaveLength(2)
    expect(alertItems[0].text()).toContain(alerts[0])
    expect(alertItems[1].text()).toContain(alerts[1])
  })
})
