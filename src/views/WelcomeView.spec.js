import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'

import WelcomeView from '@/views/WelcomeView.vue'

const routerLinkStub = {
  props: ['to'],
  template: '<a class="router-link-stub" :href="to"><slot /></a>',
}

function mountWelcomeView() {
  return shallowMount(WelcomeView, {
    global: { stubs: { RouterLink: routerLinkStub } },
  })
}

describe('WelcomeView', () => {
  it('shows assignment title', () => {
    const wrapper = mountWelcomeView()

    expect(wrapper.find('h1').text()).toContain('Flow Chart assignment')
  })

  it('links to the flow demo page', () => {
    const wrapper = mountWelcomeView()

    expect(wrapper.find('.router-link-stub').attributes('href')).toBe('/flow')
  })

  it('labels the demo link as Flow', () => {
    const wrapper = mountWelcomeView()

    expect(wrapper.find('.router-link-stub').text()).toBe('Flow')
  })
})
