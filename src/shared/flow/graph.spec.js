import { describe, expect, it } from 'vitest'

import { toVueFlowGraph } from '@/shared/flow/graph.js'

describe('toVueFlowGraph layout override', () => {
  it('uses node.layout when present', () => {
    const rawNodes = [
      { id: 1, parentId: -1, type: 'trigger', data: { type: 'conversationOpened' } },
      {
        id: 'child',
        parentId: 1,
        type: 'sendMessage',
        name: 'Child',
        data: { payload: [] },
        layout: { x: 400, y: 250 },
      },
    ]

    const { nodes } = toVueFlowGraph(rawNodes)
    const child = nodes.find((n) => n.id === 'child')
    expect(child?.position).toEqual({ x: 400, y: 250 })
  })
})
