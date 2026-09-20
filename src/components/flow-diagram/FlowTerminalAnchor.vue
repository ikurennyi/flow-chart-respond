<script setup>
import { Handle, Position } from '@vue-flow/core'
</script>

<template>
  <div class="flow-terminal-anchor">
    <Handle type="target" :position="Position.Top" />
  </div>
</template>

<style scoped>
.flow-terminal-anchor {
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
