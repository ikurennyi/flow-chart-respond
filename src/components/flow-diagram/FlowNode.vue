<script setup>
import { Handle, Position } from '@vue-flow/core'

defineProps({ data: Object })
</script>

<template>
  <div class="flow-node">
    <Handle type="target" :position="Position.Top" />

    <div class="flow-node__body">
      <div class="flow-node__title">
        <el-icon class="flow-node__icon">
          <component :is="data.icon" />
        </el-icon>

        {{ data.title }}
      </div>
      <p class="flow-node__description">{{ data.description }}</p>
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
}

.flow-node__icon {
  flex-shrink: 0;
  font-size: 22px;
  color: var(--el-color-primary);
}

.flow-node__body {
  flex: 1;
  min-width: 0;
  width: 240px;
}

.flow-node__title {
  display: flex;
  align-items: center;
  margin: 0;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
}

.flow-node__description {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
