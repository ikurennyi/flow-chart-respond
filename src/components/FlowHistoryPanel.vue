<script setup>
import { computed } from 'vue'
import { RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'

import { useFlowStore } from '@/stores/flow'

const flowStore = useFlowStore()
const { canUndo, canRedo, historyIndex, historyEntries } = storeToRefs(flowStore)

const reversedEntries = computed(() => [...historyEntries.value].reverse())

const currentEntry = computed(() =>
  historyEntries.value.find((entry) => entry.historyIndex === historyIndex.value),
)

const currentLineText = computed(() => currentEntry.value?.label ?? 'No actions yet')

const selectEntry = (entry) => {
  if (entry.historyIndex === historyIndex.value) return
  flowStore.goToHistory(entry.historyIndex)
}
</script>

<template>
  <div class="flow-history">
    <div class="flow-history__toolbar">
      <el-button :icon="RefreshLeft" :disabled="!canUndo" @click="flowStore.undo()">
        Undo
      </el-button>
      <el-button :icon="RefreshRight" :disabled="!canRedo" @click="flowStore.redo()">
        Redo
      </el-button>
    </div>

    <div class="flow-history__dropdown">
      <div class="flow-history__current" :title="currentLineText">
        {{ currentLineText }}
      </div>

      <ul v-if="historyEntries.length > 0" class="flow-history__list">
        <li
          v-for="entry in reversedEntries"
          :key="entry.id"
          role="button"
          tabindex="0"
          class="flow-history__item"
          :class="{
            'flow-history__item--active': entry.historyIndex === historyIndex,
            'flow-history__item--future': entry.historyIndex > historyIndex,
          }"
          @click="selectEntry(entry)"
          @keydown.enter.prevent="selectEntry(entry)"
        >
          {{ entry.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.flow-history {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  min-width: 0;
  max-width: 420px;
}

.flow-history__toolbar {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.flow-history__toolbar :deep(.el-button) {
  margin: 0;
}

.flow-history__dropdown {
  position: relative;
  flex: 1;
  min-width: 0;
}

.flow-history__current {
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.25;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--el-bg-color);
}

.flow-history__list {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  max-height: min(280px, 50vh);
  overflow-y: auto;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
}

.flow-history:hover .flow-history__list {
  display: block;
}

.flow-history:hover .flow-history__current {
  visibility: hidden;
}

.flow-history__item {
  padding: 8px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
}

.flow-history__item:hover {
  background: var(--el-fill-color-light);
}

.flow-history__item--active:hover {
  background: var(--el-color-primary-light-8);
}

.flow-history__item:last-child {
  border-bottom: none;
}

.flow-history__item--active {
  background: var(--el-color-primary-light-9);
  font-weight: 600;
}

.flow-history__item--future {
  color: var(--el-text-color-placeholder);
}
</style>
