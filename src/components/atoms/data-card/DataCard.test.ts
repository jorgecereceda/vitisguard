import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataCard from './DataCard.vue'

describe('DataCard', () => {
  it('renders content slot', () => {
    const wrapper = mount(DataCard, {
      props: { title: 'Test Card' },
      slots: { default: '<p>Card Content</p>' },
    })
    expect(wrapper.text()).toContain('Card Content')
  })

  it('applies status class', () => {
    const wrapper = mount(DataCard, {
      props: { title: 'Test', status: 'warning' },
    })
    expect(wrapper.classes()).toContain('data-card--warning')
  })

  it('shows loading skeleton when loading', () => {
    const wrapper = mount(DataCard, {
      props: { title: 'Test', loading: true },
    })
    expect(wrapper.find('.data-card__skeleton').exists()).toBe(true)
  })

  it('renders header slot', () => {
    const wrapper = mount(DataCard, {
      props: { title: 'Test' },
      slots: { header: '<div>Header Content</div>' },
    })
    expect(wrapper.find('.data-card__header').text()).toContain('Header Content')
  })

  it('renders footer slot', () => {
    const wrapper = mount(DataCard, {
      props: { title: 'Test' },
      slots: { footer: '<div>Footer Content</div>' },
    })
    expect(wrapper.find('.data-card__footer').text()).toContain('Footer Content')
  })

  it('accepts title prop', () => {
    const wrapper = mount(DataCard, {
      props: { title: 'My Card' },
    })
    expect(wrapper.props('title')).toBe('My Card')
  })
})
