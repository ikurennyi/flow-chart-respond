<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Plus } from '@element-plus/icons-vue'

import { useFlowStore } from '@/stores/flow'
import NodeForm from '@/components/NodeForm.vue'

import { ROUTES } from '../router/routes'

const router = useRouter()
const route = useRoute()
const flowsStore = useFlowStore()
const { isNewNodeFormVisible, selectedNodeId } = storeToRefs(flowsStore)

const drawerTitle = ref('Add New Node')
const isDrawerVisible = ref(false)
const onDrawerClose = () => {
  if (isNewNodeFormVisible.value) {
    flowsStore.closeAddNodeForm()
  }
  goToFlowsRoot()
}

watch(isNewNodeFormVisible, (visible) => {
  if (visible) {
    isDrawerVisible.value = true
    if (route.params.nodeId) {
      router.push({ name: ROUTES.FLOW.name })
    }
  } else {
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

    {{ flowsStore.nodes }}

    <div class="flow-canvas">Canvas will be here</div>

    <el-drawer v-model="isDrawerVisible" :title="drawerTitle" size="420px" @close="onDrawerClose">
      <NodeForm
        v-if="showNodeForm"
        :key="nodeFormKey"
        :mode="nodeFormMode"
        @created="onNodeCreated"
        @deleted="onNodeDeleted"
      />
    </el-drawer>
  </div>
</template>
