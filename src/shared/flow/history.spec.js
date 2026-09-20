import { describe, expect, it } from 'vitest'

import {
  canRedo,
  canUndo,
  createInitialHistory,
  currentNodes,
  recordHistory,
  goToHistoryIndex,
  redoHistory,
  undoHistory,
  visibleHistoryEntries,
} from '@/shared/flow/history.js'

const nodesA = [{ id: 1, type: 'trigger' }]
const nodesB = [
  { id: 1, type: 'trigger' },
  { id: 'a', type: 'sendMessage' },
]
const nodesC = [
  { id: 1, type: 'trigger' },
  { id: 'a', type: 'sendMessage', name: 'Updated' },
]

describe('flow history', () => {
  it('starts with one entry and undo/redo disabled at tip', () => {
    const state = createInitialHistory(nodesA)
    expect(state.entries).toHaveLength(1)
    expect(state.index).toBe(0)
    expect(canUndo(state)).toBe(false)
    expect(canRedo(state)).toBe(false)
    expect(currentNodes(state)).toEqual(nodesA)
  })

  it('appends entries on record', () => {
    let state = createInitialHistory(nodesA)
    state = recordHistory(state, { label: 'Added', kind: 'add', nodes: nodesB })
    expect(state.entries).toHaveLength(2)
    expect(state.index).toBe(1)
    expect(canUndo(state)).toBe(true)
    expect(canRedo(state)).toBe(false)
    expect(currentNodes(state)).toEqual(nodesB)
  })

  it('coalesces when coalesceKey matches at tip', () => {
    let state = createInitialHistory(nodesA)
    state = recordHistory(state, {
      label: 'Edited "A"',
      kind: 'edit',
      coalesceKey: 'edit:a',
      nodes: nodesB,
    })
    state = recordHistory(state, {
      label: 'Edited "A"',
      kind: 'edit',
      coalesceKey: 'edit:a',
      nodes: nodesC,
    })
    expect(state.entries).toHaveLength(2)
    expect(currentNodes(state)).toEqual(nodesC)
  })

  it('does not coalesce when not at tip after undo', () => {
    let state = createInitialHistory(nodesA)
    state = recordHistory(state, { label: 'Added', kind: 'add', nodes: nodesB })
    state = recordHistory(state, {
      label: 'Edited',
      kind: 'edit',
      coalesceKey: 'edit:a',
      nodes: nodesC,
    })
    state = undoHistory(state)
    state = recordHistory(state, {
      label: 'Edited again',
      kind: 'edit',
      coalesceKey: 'edit:a',
      nodes: nodesC,
    })
    expect(state.entries).toHaveLength(3)
    expect(state.index).toBe(2)
  })

  it('truncates future on new action after undo', () => {
    let state = createInitialHistory(nodesA)
    state = recordHistory(state, { label: 'Step 1', kind: 'add', nodes: nodesB })
    state = recordHistory(state, { label: 'Step 2', kind: 'edit', nodes: nodesC })
    state = undoHistory(state)
    state = recordHistory(state, { label: 'Step 2b', kind: 'edit', nodes: nodesB })
    expect(state.entries).toHaveLength(3)
    expect(state.entries.map((e) => e.label)).toEqual(['Initial state', 'Step 1', 'Step 2b'])
    expect(canRedo(state)).toBe(false)
  })

  it('undo and redo navigate snapshots', () => {
    let state = createInitialHistory(nodesA)
    state = recordHistory(state, { label: 'Added', kind: 'add', nodes: nodesB })
    state = undoHistory(state)
    expect(currentNodes(state)).toEqual(nodesA)
    expect(canRedo(state)).toBe(true)
    state = redoHistory(state)
    expect(currentNodes(state)).toEqual(nodesB)
  })

  it('goToHistoryIndex jumps to a snapshot', () => {
    let state = createInitialHistory(nodesA)
    state = recordHistory(state, { label: 'Added', kind: 'add', nodes: nodesB })
    state = recordHistory(state, { label: 'Edited', kind: 'edit', nodes: nodesC })
    state = goToHistoryIndex(state, 1)
    expect(state.index).toBe(1)
    expect(currentNodes(state)).toEqual(nodesB)
  })

  it('visibleHistoryEntries skips initial snapshot', () => {
    let state = createInitialHistory(nodesA)
    state = recordHistory(state, { label: 'Added', kind: 'add', nodes: nodesB })
    const visible = visibleHistoryEntries(state)
    expect(visible).toHaveLength(1)
    expect(visible[0].label).toBe('Added')
    expect(visible[0].historyIndex).toBe(1)
  })
})
