import { computed, ref, watch } from 'vue'

import {
  canRedo as historyCanRedo,
  canUndo as historyCanUndo,
  createInitialHistory,
  currentNodes,
  recordHistory,
  goToHistoryIndex,
  redoHistory,
  undoHistory,
  visibleHistoryEntries,
} from '@/shared/flow/history'
import { clonePlain } from '@/shared/flow/utils'

export function useFlowHistoryBridge({ flowNodesQuery, persistNodes, selectedNodeId }) {
  const historyState = ref(createInitialHistory([]))
  const historyReady = ref(false)
  const isApplyingHistory = ref(false)

  watch(
    () => (flowNodesQuery.isSuccess.value ? flowNodesQuery.data.value : null),
    (data) => {
      if (!data || historyReady.value) return
      historyState.value = createInitialHistory(data)
      historyReady.value = true
    },
    { immediate: true },
  )

  const commitNodes = (next, historyAction) => {
    persistNodes(next)

    if (isApplyingHistory.value || !historyAction || !historyReady.value) return

    historyState.value = recordHistory(historyState.value, {
      ...historyAction,
      nodes: next,
    })
  }

  const applyNodesFromHistory = (nextHistoryState) => {
    isApplyingHistory.value = true
    try {
      historyState.value = nextHistoryState
      const snapshot = clonePlain(currentNodes(nextHistoryState))
      persistNodes(snapshot)

      if (
        selectedNodeId.value != null &&
        !snapshot.some((node) => String(node.id) === String(selectedNodeId.value))
      ) {
        selectedNodeId.value = null
      }
    } finally {
      isApplyingHistory.value = false
    }
  }

  const undo = () => {
    if (!historyCanUndo(historyState.value)) return
    applyNodesFromHistory(undoHistory(historyState.value))
  }

  const redo = () => {
    if (!historyCanRedo(historyState.value)) return
    applyNodesFromHistory(redoHistory(historyState.value))
  }

  const goToHistory = (index) => {
    const next = goToHistoryIndex(historyState.value, index)
    if (next.index === historyState.value.index) return
    applyNodesFromHistory(next)
  }

  const canUndo = computed(() => historyReady.value && historyCanUndo(historyState.value))
  const canRedo = computed(() => historyReady.value && historyCanRedo(historyState.value))
  const historyIndex = computed(() => historyState.value.index)
  const historyEntries = computed(() => visibleHistoryEntries(historyState.value))

  return {
    commitNodes,
    undo,
    redo,
    goToHistory,
    canUndo,
    canRedo,
    historyIndex,
    historyEntries,
  }
}
