import { describe, expect, it } from 'vitest'

import { drawerTitleForNode, panelKeyForNode } from '@/shared/flow/nodeFormPanels.js'

describe('panelKeyForNode', () => {
  it('maps node types to form panel keys', () => {
    expect(panelKeyForNode({ type: 'dateTime' })).toBe('businessHours')
    expect(panelKeyForNode({ type: 'sendMessage' })).toBe('sendMessage')
    expect(panelKeyForNode({ type: 'trigger' })).toBeNull()
    expect(panelKeyForNode(null)).toBeNull()
    expect(panelKeyForNode({ type: 'dateTimeConnector' })).toBeNull()
  })
})

describe('drawerTitleForNode', () => {
  it('returns human-readable drawer titles', () => {
    expect(drawerTitleForNode({ type: 'dateTime' })).toBe('Business Hours')
    expect(drawerTitleForNode({ type: 'trigger' })).toBe('Trigger')
    expect(drawerTitleForNode(null)).toBe('Node details')
    expect(drawerTitleForNode({ type: 'unknown' })).toBe('Node details')
    expect(drawerTitleForNode({ type: 'addComment' })).toBe('Add Comment')
  })
})
