import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import seedNodes from '@/shared/seed/flow-nodes.json'
import { toVueFlowGraph } from '@/shared/flow/graph'

export const useFlowStore = defineStore('flow', () => {
  const nodes = ref(seedNodes)
  const selectedNodeId = ref(null)

  const graph = computed(() => toVueFlowGraph(nodes.value))

  const isNewNodeFormVisible = ref(false)

  const getNodeById = (id) => {
    return nodes.value.find((node) => node.id === id)
  }

  const setSelectedNodeId = (nodeId) => (selectedNodeId.value = nodeId)

  const openAddNodeForm = () => {
    isNewNodeFormVisible.value = true
  }

  const closeAddNodeForm = () => {
    isNewNodeFormVisible.value = false
  }

  const isNodeExist = (nodeId) => {
    return nodes.value.some((node) => String(node.id) === nodeId)
  }

  return {
    nodes,
    graph,
    selectedNodeId,
    isNewNodeFormVisible,
    setSelectedNodeId,
    isNodeExist,
    getNodeById,
    openAddNodeForm,
    closeAddNodeForm,
  }
})
