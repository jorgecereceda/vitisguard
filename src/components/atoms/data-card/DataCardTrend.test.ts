import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataCardTrend from './DataCardTrend.vue'

describe('DataCardTrend', () => {
  it('renders up trend with up arrow', () => {
    const wrapper = mount(DataCardTrend, {
      props: { direction: 'up' },
    })
    expect(wrapper.text()).toContain('↑')
    expect(wrapper.classes()).toContain('data-card-trend--up')
  })

  it('renders down trend with down arrow', () => {
    const wrapper = mount(DataCardTrend, {
      props: { direction: 'down' },
    })
    expect(wrapper.text()).toContain('↓')
    expect(wrapper.classes()).toContain('data-card-trend--down')
  })

  it('renders stable trend with right arrow', () => {
    const wrapper = mount(DataCardTrend, {
      props: { direction: 'stable' },
    })
    expect(wrapper.text()).toContain('→')
    expect(wrapper.classes()).toContain('data-card-trend--stable')
  })

  it('renders label when provided', () => {
    const wrapper = mount(DataCardTrend, {
      props: { direction: 'up', label: '+5%' },
    })
    expect(wrapper.text()).toContain('+5%')
  })
})
