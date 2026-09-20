import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

import seedNodes from '@/shared/seed/flow-nodes.json'
import { toVueFlowGraph } from '@/shared/flow/graph'
import { findNodeById, patchNodeInList, collectDescendantIds } from '@/shared/flow/utils'
import { applyInsertNode } from '@/shared/flow/insertNode'
import { fetchFlowNodes, saveFlowNodes } from '@/shared/query/flowNodesApi.js'
import { flowNodesQueryKey } from '@/shared/query/keys.js'

export const useFlowStore = defineStore('flow', () => {
  const selectedNodeId = ref(null)
  const insertContext = ref(null)
  const isNewNodeFormVisible = ref(false)

  const queryClient = useQueryClient()

  const flowNodesQuery = useQuery({
    queryKey: flowNodesQueryKey,
    queryFn: fetchFlowNodes,
  })

  const isFlowLoading = computed(() => flowNodesQuery.isPending.value)
  const flowError = computed(() => flowNodesQuery.error.value)

  const saveNodesMutation = useMutation({
    mutationFn: saveFlowNodes,
    onSuccess: (next) => {
      queryClient.setQueryData(flowNodesQueryKey, next)
    },
  })

  const nodes = computed(() => flowNodesQuery.data.value ?? seedNodes)

  const commitNodes = (next) => {
    queryClient.setQueryData(flowNodesQueryKey, next)
    saveNodesMutation.mutate(next)
  }

  const graph = computed(() => toVueFlowGraph(nodes.value))

  const getNodeById = (nodeId) => findNodeById(nodes.value, nodeId)

  const insertNode = ({ title, formType, data, insertContext: context }) => {
    if (!formType) return null

    const { nodes: next, newNodeId } = applyInsertNode(
      nodes.value,
      { title, formType, data },
      context ?? insertContext.value,
    )
    commitNodes(next)
    closeAddNodeForm()
    return newNodeId
  }
  const updateNode = (nodeId, patch) => {
    const current = nodes.value
    const next = patchNodeInList(current, nodeId, patch)
    if (next === current) return
    commitNodes(next)
  }

  const deleteNode = (nodeId) => {
    const target = getNodeById(nodeId)
    if (!target || target.type === 'trigger') return

    const toRemove = collectDescendantIds(nodes.value, nodeId)
    const next = nodes.value.filter((node) => !toRemove.has(String(node.id)))
    commitNodes(next)

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
    isFlowLoading,
    flowError,
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
