<script setup>
import { markRaw } from 'vue'
import { VueFlow } from '@vue-flow/core'

import FlowEdge from '@/components/flow-diagram/FlowEdge.vue'
import FlowNode from '@/components/flow-diagram/FlowNode.vue'
import FlowTerminalAnchor from '@/components/flow-diagram/FlowTerminalAnchor.vue'
import FlowViewportFocus from '@/components/flow-diagram/FlowViewportFocus.vue'

defineProps({
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  focusNodeId: { type: [String, Number], default: null },
})

defineEmits(['node-click', 'node-drag-stop'])

const nodeTypes = {
  'flow-node': markRaw(FlowNode),
  'flow-terminal-anchor': markRaw(FlowTerminalAnchor),
}
const edgeTypes = { 'flow-edge': markRaw(FlowEdge) }
</script>

<template>
  <VueFlow
    class="flow-canvas__vue-flow"
    :nodes="nodes"
    :edges="edges"
    :node-types="nodeTypes"
    :edge-types="edgeTypes"
    @node-click="$emit('node-click', $event)"
    @node-drag-stop="$emit('node-drag-stop', $event)"
  >
    <FlowViewportFocus :focus-node-id="focusNodeId" />
  </VueFlow>
</template>

<style scoped>
.flow-canvas__vue-flow {
  width: 100%;
  height: 100%;
}
</style>
