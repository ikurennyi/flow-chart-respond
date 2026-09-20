import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import seedNodes from '@/shared/seed/flow-nodes.json'
import { fetchFlowNodes, saveFlowNodes } from '@/shared/query/flowNodesApi.js'
import { flowNodesQueryKey } from '@/shared/query/keys.js'

export function useFlowPersistence() {
  const queryClient = useQueryClient()

  const flowNodesQuery = useQuery({
    queryKey: flowNodesQueryKey,
    queryFn: fetchFlowNodes,
  })

  const saveNodesMutation = useMutation({
    mutationFn: saveFlowNodes,
    onSuccess: (next) => {
      queryClient.setQueryData(flowNodesQueryKey, next)
    },
  })

  const nodes = computed(() => flowNodesQuery.data.value ?? seedNodes)

  const persistNodes = (next) => {
    queryClient.setQueryData(flowNodesQueryKey, next)
    saveNodesMutation.mutate(next)
  }

  const isFlowLoading = computed(() => flowNodesQuery.isPending.value)
  const flowError = computed(() => flowNodesQuery.error.value)

  return {
    flowNodesQuery,
    nodes,
    persistNodes,
    isFlowLoading,
    flowError,
  }
}
