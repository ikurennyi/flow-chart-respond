<script setup>
const model = defineModel({
  type: Object,
  required: true,
})

defineProps({
  mode: {
    type: String,
    default: 'create',
  },
})
</script>

<template>
  <div class="ac-panel">
    <h3 class="ac-panel__title">Comment</h3>
    <el-input v-model="model.comment" type="textarea" :rows="4" placeholder="Comment text" />
  </div>
</template>

<style scoped>
.ac-panel {
  margin-top: 1rem;
}

.ac-panel__title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}
</style>
