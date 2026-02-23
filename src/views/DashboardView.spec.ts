import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import DashboardView from './DashboardView.vue'
import DataCard from '@/components/atoms/DataCard.vue'
import * as weatherComposable from '@/composables/useWeather'

// Mock the useWeather composable
vi.mock('@/composables/useWeather', () => ({
    useWeather: vi.fn()
}))

describe('DashboardView.vue', () => {
    const mockFetchWeather = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    const createMockWeather = (overrides = {}) => {
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
            isFrostLikely: false,
            isHeatWaveLikely: false
        }
        vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
            weatherData
        }))

        const wrapper = mount(DashboardView)
        // Use the component itself for finding instead of name string
        const cards = wrapper.findAllComponents(DataCard)
        expect(cards).toHaveLength(4)

        expect(wrapper.text()).toContain('18.5')
        expect(wrapper.text()).toContain('60')
        expect(wrapper.text()).toContain('40')
        expect(wrapper.text()).toContain('0.5')
    })

    it('renders alerts when they are present', () => {
        const alerts = ['Riesgo de Mildiú detectado', 'Riesgo de helada']
        vi.mocked(weatherComposable.useWeather).mockReturnValue(createMockWeather({
            weatherData: {
                temperature: 15,
                humidity: 90,
                soilHumidity: 45,
                precipitation: 0
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
