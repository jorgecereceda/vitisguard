import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseBadge from './BaseBadge.vue'

describe('BaseBadge', () => {
  it('renders default badge', () => {
    const wrapper = mount(BaseBadge, {
      slots: { default: 'Badge' },
    })
    expect(wrapper.text()).toBe('Badge')
    expect(wrapper.classes()).toContain('base-badge--normal')
  })

  it('applies variant class', () => {
    const wrapper = mount(BaseBadge, {
      props: { variant: 'danger' },
      slots: { default: 'Alert' },
    })
    expect(wrapper.classes()).toContain('base-badge--danger')
  })

  it('applies size class', () => {
    const wrapper = mount(BaseBadge, {
      props: { size: 'lg' },
      slots: { default: 'Large' },
    })
    expect(wrapper.classes()).toContain('base-badge--lg')
  })

  it('renders all variants', () => {
    const variants = ['normal', 'success', 'warning', 'danger', 'info'] as const
    variants.forEach((variant) => {
      const wrapper = mount(BaseBadge, {
        props: { variant },
        slots: { default: 'Test' },
      })
      expect(wrapper.classes()).toContain(`base-badge--${variant}`)
    })
  })

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach((size) => {
      const wrapper = mount(BaseBadge, {
        props: { size },
        slots: { default: 'Test' },
      })
      expect(wrapper.classes()).toContain(`base-badge--${size}`)
    })
  })
})
