import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import seedNodes from '@/shared/seed/flow-nodes.json'
import { toVueFlowGraph } from '@/shared/flow/graph'
import { findNodeById } from '@/shared/flow/utils'

export const useFlowStore = defineStore('flow', () => {
  const nodes = ref(seedNodes)
  const selectedNodeId = ref(null)
  const insertContext = ref(null)

  const graph = computed(() => toVueFlowGraph(nodes.value))

  const isNewNodeFormVisible = ref(false)

  const getNodeById = (nodeId) => findNodeById(nodes.value, nodeId)

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
    isNodeExist,
    getNodeById,
    openAddNodeForm,
    closeAddNodeForm,
  }
})
