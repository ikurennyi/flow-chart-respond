<script setup>
import { ref, watch, computed, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Plus } from '@element-plus/icons-vue'
import { VueFlow } from '@vue-flow/core'

import { useFlowStore } from '@/stores/flow'
import FlowNode from '@/components/flow-diagram/FlowNode.vue'
import FlowEdge from '@/components/flow-diagram/FlowEdge.vue'
import FlowTerminalAnchor from '@/components/flow-diagram/FlowTerminalAnchor.vue'
import NodeForm from '@/components/NodeForm.vue'

import { ROUTES } from '../router/routes'

const router = useRouter()
const route = useRoute()
const flowsStore = useFlowStore()
const { insertContext, isNewNodeFormVisible, selectedNodeId, graph } = storeToRefs(flowsStore)

const drawerTitle = ref('Add New Node')
const isDrawerVisible = ref(false)

const onDrawerClose = () => {
  if (isNewNodeFormVisible.value) {
    flowsStore.closeAddNodeForm()
  }
  goToFlowsRoot()
}

const selectItemInDrawer = () => nodeId.value && (isDrawerVisible.value = true)

const nodeId = ref(route.params.nodeId)

const nodeTypes = {
  'flow-node': markRaw(FlowNode),
  'flow-terminal-anchor': markRaw(FlowTerminalAnchor),
}
const edgeTypes = { 'flow-edge': markRaw(FlowEdge) }

const onNodeClick = (event) => {
  if (event.node.type === 'flow-terminal-anchor') return
  router.push({ name: ROUTES.FLOW.name, params: { nodeId: event.node.id } })
}

watch(
  () => route.params.nodeId,
  (id) => {
    if (flowsStore.isNodeExist(id)) {
      flowsStore.setSelectedNodeId(id)
      isDrawerVisible.value = true
    } else {
      flowsStore.setSelectedNodeId(null)
      if (!isNewNodeFormVisible.value) {
        isDrawerVisible.value = false
      }
    }
  },
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
      <VueFlow
        :nodes="graph.nodes"
        :edges="graph.edges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        @node-click="onNodeClick"
        fit-view
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
</style>
