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
  <div class="node-form-section">
    <h3 class="node-form-section__title">Comment</h3>
    <el-input v-model="model.comment" type="textarea" :rows="4" placeholder="Comment text" />
  </div>
</template>
