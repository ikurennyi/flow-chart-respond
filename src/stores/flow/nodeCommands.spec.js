import { describe, expect, it } from 'vitest'

import { updateNodeCommand } from '@/stores/flow/nodeCommands.js'

const nodes = [{ id: 'a', parentId: -1, type: 'sendMessage', name: 'Hello', data: {} }]

describe('updateNodeCommand', () => {
  it('returns null when patch does not change nodes', () => {
    expect(updateNodeCommand(nodes, 'missing', { name: 'x' })).toBeNull()
  })

  it('returns next snapshot and coalesced history action', () => {
    const result = updateNodeCommand(nodes, 'a', { name: 'Updated' })
    expect(result?.next[0].name).toBe('Updated')
    expect(result?.historyAction).toMatchObject({
      kind: 'edit',
      coalesceKey: 'edit:a',
      label: 'Edited "Updated"',
    })
  })
})
