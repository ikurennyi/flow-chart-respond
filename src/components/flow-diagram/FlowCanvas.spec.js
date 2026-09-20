import { describe, expect, it, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'

import FlowCanvas from '@/components/flow-diagram/FlowCanvas.vue'

const sampleNodes = [{ id: '1', type: 'flow-node', position: { x: 0, y: 0 }, data: {} }]
const sampleEdges = [{ id: '1->2', source: '1', target: '2', type: 'flow-edge' }]

const vueFlowStub = {
  name: 'VueFlowStub',
  template: '<div class="vue-flow-stub"><slot /></div>',
  props: ['nodes', 'edges', 'nodeTypes', 'edgeTypes'],
}

function mountFlowCanvas(props = {}, options = {}) {
  return shallowMount(FlowCanvas, {
    props,
    global: {
      stubs: {
        VueFlow: options.minimalVueFlowStub
          ? { name: 'VueFlowStub', template: '<div />' }
          : vueFlowStub,
      },
    },
  })
}

describe('FlowCanvas', () => {
  describe('VueFlow bindings', () => {
    let wrapper
    let vueFlow

    beforeEach(() => {
      wrapper = mountFlowCanvas({
        nodes: sampleNodes,
        edges: sampleEdges,
        focusNodeId: 'b0653a',
      })
      vueFlow = wrapper.findComponent({ name: 'VueFlowStub' })
    })

    it('passes nodes to VueFlow', () => {
      expect(vueFlow.props('nodes')).toEqual(sampleNodes)
    })

    it('passes edges to VueFlow', () => {
      expect(vueFlow.props('edges')).toEqual(sampleEdges)
    })

    it('registers flow node types on VueFlow', () => {
      expect(vueFlow.props('nodeTypes')).toMatchObject({
        'flow-node': expect.any(Object),
        'flow-terminal-anchor': expect.any(Object),
      })
    })

    it('registers flow edge types on VueFlow', () => {
      expect(vueFlow.props('edgeTypes')).toMatchObject({ 'flow-edge': expect.any(Object) })
    })
  })

  it('passes focusNodeId to FlowViewportFocus', () => {
    const wrapper = mountFlowCanvas({ focusNodeId: 'b0653a' })
    const focus = wrapper.findComponent({ name: 'FlowViewportFocus' })

    expect(focus.props('focusNodeId')).toBe('b0653a')
  })

  it('re-emits node-click from VueFlow', async () => {
    const payload = { node: { id: '1' } }
    const wrapper = mountFlowCanvas({}, { minimalVueFlowStub: true })

    await wrapper.findComponent({ name: 'VueFlowStub' }).vm.$emit('node-click', payload)

    expect(wrapper.emitted('node-click')?.[0]).toEqual([payload])
  })
})
