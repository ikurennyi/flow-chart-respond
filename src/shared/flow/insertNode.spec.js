import { describe, expect, it } from 'vitest'

import seedFlowNodes from '@/shared/seed/flow-nodes.json'
import {
  applyInsertNode,
  formTypeToPayloadType,
  parentIdForInsert,
} from '@/shared/flow/insertNode.js'

describe('formTypeToPayloadType', () => {
  it('maps form types to payload node types', () => {
    expect(formTypeToPayloadType('businessHours')).toBe('dateTime')
    expect(formTypeToPayloadType('addComment')).toBe('addComment')
    expect(formTypeToPayloadType('sendMessage')).toBe('sendMessage')
    expect(formTypeToPayloadType('unknown')).toBe('sendMessage')
  })
})

describe('parentIdForInsert', () => {
  it('prefers connector id over parent id', () => {
    expect(parentIdForInsert({ parentId: 'a', connectorId: 'b' })).toBe('b')
  })

  it('falls back to parent id or root', () => {
    expect(parentIdForInsert({ parentId: 'a' })).toBe('a')
    expect(parentIdForInsert(null)).toBe(1)
    expect(parentIdForInsert(undefined)).toBe(1)
  })
})

describe('applyInsertNode', () => {
  it('appends child on terminal insert', () => {
    const { nodes, newNodeId } = applyInsertNode(
      seedFlowNodes,
      { title: 'Follow up', formType: 'sendMessage', data: { payload: [] } },
      { parentId: 'b0653a', terminal: true },
    )

    const created = nodes.find((n) => n.id === newNodeId)
    expect(created?.parentId).toBe('b0653a')
    expect(created?.name).toBe('Follow up')
  })

  it('inserts between parent and child on branch edge', () => {
    const { nodes, newNodeId } = applyInsertNode(
      seedFlowNodes,
      { title: 'Mid', formType: 'addComment', data: { comment: 'x' } },
      {
        parentId: 'd09c08',
        childId: 'b0653a',
        connectorId: '161f52',
      },
    )

    const welcome = nodes.find((n) => n.id === 'b0653a')
    const created = nodes.find((n) => n.id === newNodeId)
    expect(created?.parentId).toBe('161f52')
    expect(welcome?.parentId).toBe(newNodeId)
  })

  it('uses form defaults when data is missing or empty', () => {
    const { nodes, newNodeId } = applyInsertNode(
      [],
      { formType: 'businessHours' },
      { parentId: 1, terminal: true },
    )
    const created = nodes.find((n) => n.id === newNodeId)
    expect(created?.type).toBe('dateTime')
    expect(created?.name).toBe('')
    expect(created?.data.timezone).toBe('UTC')
    expect(created?.data.times).toHaveLength(7)
  })

  it('does not reparent child when insert is terminal', () => {
    const base = [{ id: 'child', parentId: 'parent', type: 'sendMessage', data: {} }]
    const { nodes } = applyInsertNode(
      base,
      { title: 'Leaf', formType: 'sendMessage', data: { payload: [{ type: 'text', text: 'x' }] } },
      { parentId: 'parent', childId: 'child', terminal: true },
    )
    expect(nodes.find((n) => n.id === 'child')?.parentId).toBe('parent')
  })

  it('matches child id with numeric/string coercion', () => {
    const base = [{ id: 42, parentId: 'parent', type: 'sendMessage', data: {} }]
    const { nodes, newNodeId } = applyInsertNode(
      base,
      { title: 'Mid', formType: 'addComment', data: { comment: 'x' } },
      { parentId: 'parent', childId: '42' },
    )
    expect(nodes.find((n) => n.id === 42)?.parentId).toBe(newNodeId)
  })

  it('does not mutate the input nodes array', () => {
    const base = [{ id: 'a', parentId: 1, type: 'sendMessage', data: {} }]
    const snapshot = structuredClone(base)
    applyInsertNode(
      base,
      { formType: 'sendMessage', data: { payload: [] } },
      { parentId: 'a', terminal: true },
    )
    expect(base).toEqual(snapshot)
  })
})
