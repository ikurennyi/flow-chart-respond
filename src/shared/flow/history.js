import { clonePlain } from '@/shared/flow/utils.js'

let nextEntryId = 1

function cloneNodes(nodes) {
  return clonePlain(nodes ?? [])
}

function createEntry({ label, kind, coalesceKey, nodes }) {
  return {
    id: nextEntryId++,
    label,
    kind,
    coalesceKey: coalesceKey ?? undefined,
    nodes: cloneNodes(nodes),
  }
}

export function createInitialHistory(nodes) {
  nextEntryId = 1
  return {
    entries: [createEntry({ label: 'Initial state', kind: 'initial', nodes })],
    index: 0,
  }
}

export function canUndo(state) {
  return state.index > 0
}

export function canRedo(state) {
  return state.index < state.entries.length - 1
}

export function currentNodes(state) {
  return state.entries[state.index]?.nodes ?? []
}

/**
 * Record a new snapshot after a user action.
 * @param {HistoryState} state
 * @param {{ label: string, kind: string, coalesceKey?: string, nodes: unknown[] }} action
 */
export function recordHistory(state, action) {
  const { label, kind, coalesceKey, nodes } = action
  const atTip = state.index === state.entries.length - 1
  const last = state.entries[state.index]

  if (atTip && coalesceKey && last?.coalesceKey === coalesceKey) {
    const entries = state.entries.slice()
    entries[state.index] = {
      ...last,
      label,
      kind,
      nodes: cloneNodes(nodes),
    }
    return { entries, index: state.index }
  }

  let entries = state.entries
  if (state.index < entries.length - 1) {
    entries = entries.slice(0, state.index + 1)
  }

  entries = [...entries, createEntry({ label, kind, coalesceKey, nodes })]
  return { entries, index: entries.length - 1 }
}

export function undoHistory(state) {
  if (!canUndo(state)) return state
  return { ...state, index: state.index - 1 }
}

export function redoHistory(state) {
  if (!canRedo(state)) return state
  return { ...state, index: state.index + 1 }
}

export function goToHistoryIndex(state, index) {
  if (index < 0 || index >= state.entries.length) return state
  if (index === state.index) return state
  return { ...state, index }
}

/** Actions visible in UI (excludes initial snapshot at index 0). */
export function visibleHistoryEntries(state) {
  return state.entries.slice(1).map((entry, i) => ({
    ...entry,
    historyIndex: i + 1,
  }))
}
