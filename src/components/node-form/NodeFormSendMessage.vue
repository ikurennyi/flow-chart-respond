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
    <h3 class="node-form-section__title">Message content</h3>

    <el-input v-model="model" type="textarea" :rows="4" placeholder="Message text" />

    <h4>Attachments</h4>
    <!-- TODO: Attachments list -->
  </div>
</template>
