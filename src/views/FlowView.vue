<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Plus } from '@element-plus/icons-vue'

import { useFlowStore } from '@/stores/flow'
import FlowCanvas from '@/components/flow-diagram/FlowCanvas.vue'
import NodeForm from '@/components/NodeForm.vue'
import { drawerTitleForNode } from '@/shared/flow/nodeFormPanels.js'

import { ROUTES } from '../router/routes'

const router = useRouter()
const route = useRoute()
const flowsStore = useFlowStore()
const { insertContext, isNewNodeFormVisible, selectedNodeId, isFlowLoading, flowError, nodes } =
  storeToRefs(flowsStore)

const drawerTitle = computed(() => {
  if (isNewNodeFormVisible.value) return 'Add New Node'
  const node = flowsStore.getNodeById(selectedNodeId.value)
  return drawerTitleForNode(node)
})
const isDrawerVisible = ref(false)

const onDrawerClose = () => {
  if (isNewNodeFormVisible.value) {
    flowsStore.closeAddNodeForm()
  }
  goToFlowsRoot()
}

const onNodeClick = (event) => {
  if (event.node.type === 'flow-terminal-anchor') return
  router.push({ name: ROUTES.FLOW.name, params: { nodeId: event.node.id } })
}

const focusNodeId = computed(() => {
  if (isFlowLoading.value) return null
  const id = route.params.nodeId ?? selectedNodeId.value
  if (id == null || id === '') return null
  return flowsStore.isNodeExist(id) ? String(id) : null
})

const syncDrawerFromRoute = () => {
  const id = route.params.nodeId

  if (isFlowLoading.value) return

  if (flowsStore.isNodeExist(id)) {
    flowsStore.setSelectedNodeId(id)
    isDrawerVisible.value = true
    return
  }

  flowsStore.setSelectedNodeId(null)
  if (!isNewNodeFormVisible.value) {
    isDrawerVisible.value = false
  }
}

watch(
  () => [route.params.nodeId, isFlowLoading.value, nodes.value.length],
  () => syncDrawerFromRoute(),
  { immediate: true },
)

watch(isNewNodeFormVisible, (visible) => {
  if (visible) {
    isDrawerVisible.value = true
    if (route.params.nodeId) {
      router.push({ name: ROUTES.FLOW.name })
    }
  } else if (!flowsStore.isNodeExist(route.params.nodeId)) {
    isDrawerVisible.value = false
  }
})

const addNode = () => flowsStore.openAddNodeForm()

const onNodeCreated = (nodeId) => {
  router.push({ name: ROUTES.FLOW.name, params: { nodeId } })
}

const onNodeDeleted = () => goToFlowsRoot()

const nodeFormKey = computed(() =>
  isNewNodeFormVisible.value ? 'create' : String(selectedNodeId.value ?? ''),
)
const nodeFormMode = computed(() => (isNewNodeFormVisible.value ? 'create' : 'edit'))
const showNodeForm = computed(
  () => isDrawerVisible.value && (isNewNodeFormVisible.value || selectedNodeId.value),
)
const goToFlowsRoot = () => router.push({ name: ROUTES.FLOW.name })
</script>

<template>
  <div>
    <div class="flow-content">
      <h1>Flow View</h1>

      <el-button type="primary" :icon="Plus" @click="addNode">Create New Node</el-button>
    </div>

    <div class="flow-canvas">
      <el-skeleton v-if="isFlowLoading" animated :rows="6" class="flow-canvas__skeleton" />
      <el-alert
        v-else-if="flowError"
        type="error"
        title="Failed to load flow"
        :description="flowError.message"
        show-icon
      />
      <FlowCanvas
        v-else
        :nodes="flowsStore.graph.nodes"
        :edges="flowsStore.graph.edges"
        :focus-node-id="focusNodeId"
        @node-click="onNodeClick"
      />
    </div>

    <el-drawer v-model="isDrawerVisible" :title="drawerTitle" size="420px" @close="onDrawerClose">
      <NodeForm
        v-if="showNodeForm"
        :key="nodeFormKey"
        :mode="nodeFormMode"
        :node-id="nodeFormMode === 'edit' ? selectedNodeId : null"
        :insert-context="nodeFormMode === 'create' ? insertContext : null"
        @created="onNodeCreated"
        @deleted="onNodeDeleted"
      />
    </el-drawer>
  </div>
</template>

<style scoped>
.flow-canvas {
  width: 100%;
  height: 65vh;
  margin-top: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.flow-canvas__skeleton {
  padding: 16px;
}
</style>
