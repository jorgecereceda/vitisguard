import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts properly', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        }
      }
    })
    // App.vue has a Suspense and RouterView, no "You did it!" text.
    // We just verify it mounts without crashing.
    expect(wrapper.exists()).toBe(true)
  })
})
