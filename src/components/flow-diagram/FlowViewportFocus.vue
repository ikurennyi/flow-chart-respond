<script setup>
import { watch, nextTick } from 'vue'
import { useNodesInitialized, useVueFlow } from '@vue-flow/core'

const props = defineProps({
  focusNodeId: { type: [String, Number], default: null },
})

const { fitView } = useVueFlow()
const nodesInitialized = useNodesInitialized()

async function applyViewport() {
  if (!nodesInitialized.value) return
  await nextTick()

  const id = props.focusNodeId
  if (id != null && id !== '' && !String(id).startsWith('terminal-')) {
    fitView({
      nodes: [String(id)],
      duration: 400,
      padding: 0.28,
      maxZoom: 1.25,
    })
    return
  }

  fitView({ duration: 400, padding: 0.15 })
}

watch(
  () => [props.focusNodeId, nodesInitialized.value],
  () => applyViewport(),
  { immediate: true },
)
</script>

<template>
  <div></div>
</template>
