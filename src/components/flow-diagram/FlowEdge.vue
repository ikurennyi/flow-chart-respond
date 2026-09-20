<script setup>
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, getStraightPath } from '@vue-flow/core'

import { useFlowStore } from '@/stores/flow'

// Vue Flow passes full EdgeProps; root is fragment (BaseEdge + teleport), attrs are not inherited
defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, default: '' },
  source: String,
  target: String,
  type: String,
  sourceX: Number,
  sourceY: Number,
  targetX: Number,
  targetY: Number,
  sourceNode: Object,
  targetNode: Object,
  sourcePosition: { type: String, default: 'bottom' },
  targetPosition: { type: String, default: 'top' },
  sourceHandleId: String,
  targetHandleId: String,
  label: [String, Object],
  labelStyle: { type: Object, default: () => ({}) },
  labelShowBg: Boolean,
  labelBgStyle: { type: Object, default: () => ({}) },
  labelBgPadding: { type: Array, default: () => [2, 4] },
  labelBgBorderRadius: Number,
  markerStart: String,
  markerEnd: { type: String, default: '' },
  style: [Object, String],
  selected: Boolean,
  animated: Boolean,
  updatable: [Boolean, String],
  interactionWidth: Number,
  curvature: Number,
  data: { type: Object, default: () => ({}) },
  events: { type: Object, default: () => ({}) },
})

const flowsStore = useFlowStore()

// Repeat the geometry of the built-in step edge (borderRadius: 0 = straight angles)
const geometry = computed(() => {
  if (props.data?.terminal) {
    // Stub under leaf: vertical at source handle X (plus uses sourceX; target anchor may differ in X)
    const [path, labelX, labelY] = getStraightPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.sourceX,
      targetY: props.targetY,
    })
    return { path, labelX, labelY }
  }

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    borderRadius: 0,
  })
  return { path, labelX, labelY }
})

const strokeColor = computed(() => {
  if (props.style && typeof props.style === 'object' && props.style.stroke) {
    return props.style.stroke
  }
  return '#c0c4cc'
})

const labelPillStyle = computed(() => {
  const [padX, padY] = props.labelBgPadding
  return {
    color: props.labelStyle?.fill ?? 'var(--el-text-color-primary)',
    backgroundColor: props.labelBgStyle?.fill ?? '#fff',
    borderColor: props.labelBgStyle?.stroke ?? 'var(--el-border-color)',
    fontSize: props.labelStyle?.fontSize ?? '12px',
    fontWeight: props.labelStyle?.fontWeight ?? 600,
    padding: `${padY}px ${padX}px`,
  }
})

/** «+» on the orthogonal path to target, not directly under pill label */
const plusPos = computed(() => {
  if (props.data?.terminal) {
    return { x: props.sourceX, y: props.targetY - 12 }
  }

  const { labelX, labelY } = geometry.value
  if (!props.label) {
    return { x: labelX, y: labelY }
  }

  const sameColumn = Math.abs(props.sourceX - props.targetX) < 1
  const lineX = sameColumn ? props.sourceX : props.targetX
  const y = (labelY + props.targetY) / 2

  return { x: lineX, y }
})

const labelTransform = computed(() => {
  const { labelX, labelY } = geometry.value
  return `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`
})

const plusTransform = computed(
  () => `translate(-50%, -50%) translate(${plusPos.value.x}px, ${plusPos.value.y}px)`,
)

const onPlusClick = (event) => {
  event.stopPropagation()
  if (props.data?.terminal) {
    flowsStore.requestInsertFromEdge({
      parentId: props.data.parentId,
      terminal: true,
      edgeId: props.id,
    })
    return
  }

  flowsStore.requestInsertFromEdge({
    parentId: props.data.parentId,
    childId: props.data.childId,
    connectorId: props.data.connectorId,
    edgeId: props.id,
  })
}
</script>

<template>
  <BaseEdge :id="id" :path="geometry.path" :marker-end="markerEnd || undefined" :style="style" />

  <EdgeLabelRenderer>
    <div
      v-if="label"
      class="edge-label-pill nodrag nopan"
      :style="{ transform: labelTransform, ...labelPillStyle }"
    >
      {{ label }}
    </div>

    <button
      type="button"
      class="edge-plus nodrag nopan"
      :style="{ transform: plusTransform, color: strokeColor, borderColor: strokeColor }"
      @click="onPlusClick"
    >
      <el-icon class="edge-plus__icon">
        <Plus />
      </el-icon>
    </button>
  </EdgeLabelRenderer>
</template>

<style scoped>
.edge-label-pill {
  position: absolute;
  pointer-events: none;
  border: 1px solid;
  border-radius: 4px;
  line-height: 1.2;
  white-space: nowrap;
}

.edge-plus {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid;
  background: #fff;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
}

.edge-plus__icon {
  font-size: 14px;
}

.edge-plus:hover {
  background: var(--el-fill-color-light);
}
</style>
