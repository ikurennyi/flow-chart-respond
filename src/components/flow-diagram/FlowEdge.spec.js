import { describe, expect, it, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'

import FlowEdge from '@/components/flow-diagram/FlowEdge.vue'

const requestInsertFromEdge = vi.fn()

vi.mock('@/stores/flow', () => ({
  useFlowStore: () => ({ requestInsertFromEdge }),
}))

const defaultEdgeProps = {
  id: 'a->b',
  source: 'a',
  target: 'b',
  sourceX: 100,
  sourceY: 50,
  targetX: 100,
  targetY: 200,
  sourcePosition: 'bottom',
  targetPosition: 'top',
  markerEnd: 'url(#arrow)',
  style: { stroke: '#c0c4cc' },
}

function mountFlowEdge(props) {
  return shallowMount(FlowEdge, {
    props,
    global: {
      stubs: {
        BaseEdge: true,
        EdgeLabelRenderer: { template: '<div><slot /></div>' },
        'el-icon': true,
      },
    },
  })
}

describe('FlowEdge', () => {
  beforeEach(() => {
    requestInsertFromEdge.mockClear()
  })

  describe('label pill', () => {
    it('shows branch label when provided', () => {
      const wrapper = mountFlowEdge({
        ...defaultEdgeProps,
        label: 'Success',
        data: { parentId: 'root', childId: 'b', connectorId: 'conn' },
      })

      expect(wrapper.find('.edge-label-pill').text()).toBe('Success')
    })

    it('hides label pill when label is absent', () => {
      const wrapper = mountFlowEdge({
        ...defaultEdgeProps,
        data: { parentId: 'a', childId: 'b' },
      })

      expect(wrapper.find('.edge-label-pill').exists()).toBe(false)
    })
  })

  describe('plus button', () => {
    it('renders insert control on the edge', () => {
      const wrapper = mountFlowEdge({
        ...defaultEdgeProps,
        data: { parentId: 'a', childId: 'b' },
      })

      expect(wrapper.find('button.edge-plus').exists()).toBe(true)
    })

    it('calls store with branch context on click', async () => {
      const wrapper = mountFlowEdge({
        ...defaultEdgeProps,
        data: { parentId: 'root', childId: 'b', connectorId: 'conn' },
      })

      await wrapper.find('button.edge-plus').trigger('click')

      expect(requestInsertFromEdge).toHaveBeenCalledWith({
        parentId: 'root',
        childId: 'b',
        connectorId: 'conn',
        edgeId: 'a->b',
      })
    })

    it('calls store with terminal context on click', async () => {
      const wrapper = mountFlowEdge({
        ...defaultEdgeProps,
        id: 'leaf->terminal-leaf',
        data: { parentId: 'leaf', terminal: true },
      })

      await wrapper.find('button.edge-plus').trigger('click')

      expect(requestInsertFromEdge).toHaveBeenCalledWith({
        parentId: 'leaf',
        terminal: true,
        edgeId: 'leaf->terminal-leaf',
      })
    })
  })
})
