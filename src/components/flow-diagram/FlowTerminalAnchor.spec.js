import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'

import FlowTerminalAnchor from '@/components/flow-diagram/FlowTerminalAnchor.vue'

function mountFlowTerminalAnchor() {
  return shallowMount(FlowTerminalAnchor)
}

describe('FlowTerminalAnchor', () => {
  it('renders anchor root element', () => {
    const wrapper = mountFlowTerminalAnchor()

    expect(wrapper.find('.flow-terminal-anchor').exists()).toBe(true)
  })
})
