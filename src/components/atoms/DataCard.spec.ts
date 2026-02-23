import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataCard from './DataCard.vue'

describe('DataCard.vue', () => {
    it('renders props correctly', () => {
        const label = 'Temperatura'
        const value = 25.5
        const unit = '°C'
        const icon = '🌡️'

        const wrapper = mount(DataCard, {
            props: { label, value, unit, icon }
        })

        expect(wrapper.find('.data-card__label').text()).toBe(label)
        expect(wrapper.find('.data-card__value').text()).toBe(value.toString())
        expect(wrapper.find('.data-card__unit').text()).toBe(unit)
        expect(wrapper.find('.data-card__icon').text()).toBe(icon)
    })

    it('does not render icon or unit if not provided', () => {
        const wrapper = mount(DataCard, {
            props: { label: 'Humedad', value: 80 }
        })

        expect(wrapper.find('.data-card__icon').exists()).toBe(false)
        expect(wrapper.find('.data-card__unit').exists()).toBe(false)
    })

    it('has the correct BEM classes', () => {
        const wrapper = mount(DataCard, {
            props: { label: 'Test', value: 0 }
        })

        expect(wrapper.classes()).toContain('data-card')
        expect(wrapper.find('.data-card__header').exists()).toBe(true)
        expect(wrapper.find('.data-card__body').exists()).toBe(true)
        expect(wrapper.find('.data-card__label').exists()).toBe(true)
        expect(wrapper.find('.data-card__value').exists()).toBe(true)
    })
})
