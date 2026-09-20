import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import seedNodes from '@/shared/seed/flow-nodes.json'
import { toVueFlowGraph } from '@/shared/flow/graph'
import { findNodeById, patchNodeInList, collectDescendantIds } from '@/shared/flow/utils'
import { applyInsertNode } from '@/shared/flow/insertNode'

export const useFlowStore = defineStore('flow', () => {
  const nodes = ref(seedNodes)
  const selectedNodeId = ref(null)
  const insertContext = ref(null)

  const graph = computed(() => toVueFlowGraph(nodes.value))

  const isNewNodeFormVisible = ref(false)

  const getNodeById = (nodeId) => findNodeById(nodes.value, nodeId)

  const insertNode = ({ title, formType, data, insertContext: context }) => {
    if (!formType) return null

    const { nodes: next, newNodeId } = applyInsertNode(
      nodes.value,
      { title, formType, data },
      context ?? insertContext.value,
    )
    nodes.value = next
    closeAddNodeForm()
    return newNodeId
  }

  const updateNode = (nodeId, patch) => {
    const index = nodes.value.findIndex((node) => String(node.id) === String(nodeId))
    if (index === -1) return

    const current = nodes.value[index]
    const next = { ...current, ...patch }
    if (patch.data !== undefined) {
      next.data = { ...(current.data ?? {}), ...patch.data }
    }
    nodes.value[index] = next
  }

  const deleteNode = (nodeId) => {
    const target = getNodeById(nodeId)
    if (!target || target.type === 'trigger') return

    const toRemove = collectDescendantIds(nodes.value, nodeId)
    nodes.value = nodes.value.filter((node) => !toRemove.has(String(node.id)))

    if (String(selectedNodeId.value) === String(nodeId)) {
      selectedNodeId.value = null
    }
  }

  const setSelectedNodeId = (nodeId) => (selectedNodeId.value = nodeId)

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

  const isNodeExist = (nodeId) => {
    return nodes.value.some((node) => String(node.id) === nodeId)
  }

  return {
    nodes,
    graph,
    insertContext,
    selectedNodeId,
    isNewNodeFormVisible,
    setSelectedNodeId,
    requestInsertFromEdge,
    insertNode,
    updateNode,
    deleteNode,
    isNodeExist,
    getNodeById,
    openAddNodeForm,
    closeAddNodeForm,
  }
})
