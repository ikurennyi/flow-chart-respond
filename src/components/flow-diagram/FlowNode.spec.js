import { describe, expect, it, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'

import FlowNode from '@/components/flow-diagram/FlowNode.vue'

function mountFlowNode(data) {
  return shallowMount(FlowNode, {
    props: { data },
    global: { stubs: { 'el-icon': true } },
  })
}

describe('FlowNode', () => {
  describe('with title and description', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mountFlowNode({
        icon: 'Bell',
        title: 'Welcome',
        description: 'Hello world',
      })
    })

    it('renders title', () => {
      expect(wrapper.find('.flow-node__title').text()).toContain('Welcome')
    })

    it('renders description', () => {
      expect(wrapper.find('.flow-node__description').text()).toBe('Hello world')
    })
  })

  it('renders empty description when data omits it', () => {
    const wrapper = mountFlowNode({ icon: 'Bell', title: 'Only title' })

    expect(wrapper.find('.flow-node__description').text()).toBe('')
  })
})
