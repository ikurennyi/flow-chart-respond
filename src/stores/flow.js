import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { toVueFlowGraph } from '@/shared/flow/graph'
import { findNodeById } from '@/shared/flow/utils'
import { useFlowHistoryBridge } from '@/stores/flow/historyBridge.js'
import {
  deleteNodeCommand,
  insertNodeCommand,
  updateNodeCommand,
  updateNodeLayoutCommand,
} from '@/stores/flow/nodeCommands.js'
import { useFlowPersistence } from '@/stores/flow/persistence.js'

export const useFlowStore = defineStore('flow', () => {
  // --- Selection & create-node UI ---
  const selectedNodeId = ref(null)
  const insertContext = ref(null)
  const isNewNodeFormVisible = ref(false)

  const setSelectedNodeId = (nodeId) => {
    selectedNodeId.value = nodeId
  }

  const requestInsertFromEdge = (context) => {
    insertContext.value = context
    isNewNodeFormVisible.value = true
  }

  const openAddNodeForm = () => {
    insertContext.value = null
    isNewNodeFormVisible.value = true
  }

  const closeAddNodeForm = () => {
    isNewNodeFormVisible.value = false
    insertContext.value = null
  }

  // --- Server state (query + persist) ---
  const { flowNodesQuery, nodes, persistNodes, isFlowLoading, flowError } = useFlowPersistence()

  // --- Undo / redo ---
  const { commitNodes, undo, redo, goToHistory, canUndo, canRedo, historyIndex, historyEntries } =
    useFlowHistoryBridge({ flowNodesQuery, persistNodes, selectedNodeId })

  // --- Derived graph ---
  const graph = computed(() => toVueFlowGraph(nodes.value))
  const getNodeById = (nodeId) => findNodeById(nodes.value, nodeId)
  const isNodeExist = (nodeId) => nodes.value.some((node) => String(node.id) === nodeId)

  // --- Node mutations ---
  const insertNode = ({ title, formType, data, insertContext: context }) => {
    const result = insertNodeCommand(nodes.value, {
      title,
      formType,
      data,
      insertContext: context ?? insertContext.value,
    })
    if (!result) return null

    commitNodes(result.next, result.historyAction)
    closeAddNodeForm()
    return result.newNodeId
  }

  const updateNode = (nodeId, patch) => {
    const result = updateNodeCommand(nodes.value, nodeId, patch)
    if (!result) return
    commitNodes(result.next, result.historyAction)
  }

  const updateNodeLayout = (nodeId, position) => {
    const result = updateNodeLayoutCommand(nodes.value, nodeId, position)
    if (!result) return
    commitNodes(result.next, result.historyAction)
  }

  const deleteNode = (nodeId) => {
    const result = deleteNodeCommand(nodes.value, nodeId)
    if (!result) return

    commitNodes(result.next, result.historyAction)

    if (String(selectedNodeId.value) === result.clearedSelection) {
      selectedNodeId.value = null
    }
  }

  return {
    nodes,
    graph,
    isFlowLoading,
    flowError,
    insertContext,
    selectedNodeId,
    isNewNodeFormVisible,
    canUndo,
    canRedo,
    historyIndex,
    historyEntries,
    undo,
    redo,
    goToHistory,
    setSelectedNodeId,
    requestInsertFromEdge,
    insertNode,
    updateNode,
    updateNodeLayout,
    deleteNode,
    isNodeExist,
    getNodeById,
    openAddNodeForm,
    closeAddNodeForm,
  }
})
