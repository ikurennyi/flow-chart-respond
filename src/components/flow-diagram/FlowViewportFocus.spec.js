import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { shallowMount, flushPromises } from '@vue/test-utils'

import FlowViewportFocus from '@/components/flow-diagram/FlowViewportFocus.vue'

const fitView = vi.fn()
const nodesInitialized = ref(false)

vi.mock('@vue-flow/core', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useVueFlow: () => ({ fitView }),
    useNodesInitialized: () => nodesInitialized,
  }
})

function mountFlowViewportFocus(props = {}) {
  return shallowMount(FlowViewportFocus, { props })
}

async function markNodesInitialized() {
  nodesInitialized.value = true
  await nextTick()
  await flushPromises()
}

describe('FlowViewportFocus', () => {
  beforeEach(() => {
    fitView.mockClear()
    nodesInitialized.value = false
  })

  it('does not call fitView before nodes initialize', async () => {
    mountFlowViewportFocus({ focusNodeId: 'abc' })
    await flushPromises()

    expect(fitView).not.toHaveBeenCalled()
  })

  it('calls fitView with node id when focusNodeId is set', async () => {
    mountFlowViewportFocus({ focusNodeId: 'abc' })
    await markNodesInitialized()

    expect(fitView).toHaveBeenCalledWith({
      nodes: ['abc'],
      duration: 400,
      padding: 0.28,
      maxZoom: 1.25,
    })
  })

  describe('full graph fit', () => {
    it('calls fitView without nodes when focusNodeId is null', async () => {
      mountFlowViewportFocus({ focusNodeId: null })
      await markNodesInitialized()

      expect(fitView).toHaveBeenCalledWith({ duration: 400, padding: 0.15 })
    })

    it('calls fitView without nodes for terminal anchor id', async () => {
      mountFlowViewportFocus({ focusNodeId: 'terminal-leaf' })
      await markNodesInitialized()

      expect(fitView).toHaveBeenCalledWith({ duration: 400, padding: 0.15 })
    })
  })

  it('passes string node id to fitView for numeric focusNodeId', async () => {
    mountFlowViewportFocus({ focusNodeId: 1 })
    await markNodesInitialized()

    expect(fitView).toHaveBeenCalledWith(expect.objectContaining({ nodes: ['1'] }))
  })
})
