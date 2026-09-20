import { defineStore } from 'pinia'
import { ref } from 'vue'
import seedNodes from '@/shared/seed/flow-nodes.json'

export const useFlowStore = defineStore('flow', () => {
  const nodes = ref(seedNodes)
  const selectedNodeId = ref(null)

  const isNewNodeFormVisible = ref(false)

  const openAddNodeForm = () => {
    isNewNodeFormVisible.value = true
  }

  const closeAddNodeForm = () => {
    isNewNodeFormVisible.value = false
  }

  return {
    nodes,
    selectedNodeId,
    isNewNodeFormVisible,
    openAddNodeForm,
    closeAddNodeForm,
  }
})
