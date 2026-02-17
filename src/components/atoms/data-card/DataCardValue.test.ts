import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataCardValue from './DataCardValue.vue'

describe('DataCardValue', () => {
  it('renders numeric value with decimals', () => {
    const wrapper = mount(DataCardValue, {
      props: { value: 25.567, decimals: 2, prefix: '' },
    })
    expect(wrapper.text()).toBe('25.57')
  })

  it('renders with prefix', () => {
    const wrapper = mount(DataCardValue, {
      props: { value: 25, decimals: 0, prefix: '↑' },
    })
    expect(wrapper.text()).toBe('↑25')
  })

  it('renders fallback when value is null', () => {
    const wrapper = mount(DataCardValue, {
      props: { value: null, fallback: '--' },
    })
    expect(wrapper.text()).toBe('--')
  })

  it('renders fallback when value is null with custom fallback', () => {
    const wrapper = mount(DataCardValue, {
      props: { value: null, fallback: 'N/A' },
    })
    expect(wrapper.text()).toBe('N/A')
  })

  it('applies empty class when value is null', () => {
    const wrapper = mount(DataCardValue, {
      props: { value: null },
    })
    expect(wrapper.classes()).toContain('data-card-value--empty')
  })
})
