<script setup>
import { computed, useTemplateRef, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'

import { useFlowStore } from '@/stores/flow'

import { NODE_FORM_PANELS, formTypeKeyForNode } from '@/components/nodeForms'
import { NODE_TYPES } from '@/shared/constants'

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
    validator: (v) => v === 'create' || v === 'edit',
  },
})

const emit = defineEmits(['cancel', 'deleted', 'created'])

const flowsStore = useFlowStore()

const isCreate = computed(() => props.mode === 'create')
const isEdit = computed(() => props.mode === 'edit')

const formRef = useTemplateRef('form-ref')

const draft = reactive({
  title: '',
  nodeType: '',
})

let typeData = reactive({})

const formTypeKey = computed(() => {
  if (isCreate.value) return draft.nodeType || null
  const node = flowsStore.getNodeById(props.nodeId)
  return formTypeKeyForNode(node)
})

const formComponent = computed(() => {
  const key = formTypeKey.value
  return key ? NODE_FORM_PANELS[key] : null
})

function onTitleBlur() {
  if (!isEdit.value || !props.nodeId) return
  flowsStore.updateNode(props.nodeId, { name: draft.title.trim() })
}

const submitCreate = () => {
  const form = formRef.value
  if (!form) return

  const formType = draft.nodeType
  // TODO: emit created node id
  emit('created', formType)
}

const cancelForm = () => {
  emit('cancel')
  flowsStore.closeAddNodeForm()
}

const canDelete = computed(() => {
  if (!isEdit.value) return false
  // TODO: check if node is not root
})

const deleteNode = async () => {
  if (!canDelete.value) return
  try {
    await ElMessageBox.confirm('Delete this node and its descendants?', 'Delete node', {
      type: 'warning',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    })
    flowsStore.deleteNode(props.nodeId)
    emit('deleted')
  } catch {
    // cancelled, do nothing
  }
}
</script>

<template>
  <div class="node-form">
    <el-form ref="form-ref" :model="draft" label-width="auto" label-position="top">
      <el-form-item label="Title" prop="title">
        <el-input v-model="draft.title" ref="title-ref" @blur="onTitleBlur" />
      </el-form-item>

      <el-form-item label="Node Type" prop="nodeType">
        <el-select v-model="draft.nodeType" :disabled="isEdit" placeholder="Select type">
          <el-option v-for="(label, key) in NODE_TYPES" :key="key" :value="key" :label="label" />
        </el-select>
      </el-form-item>

      <component v-if="formComponent" :is="formComponent" v-model="typeData" :mode="mode" />
    </el-form>

    <div class="node-form__actions">
      <template v-if="isCreate">
        <el-button type="success" @click="submitCreate">Add Node</el-button>
        <el-button @click="cancelForm">Cancel</el-button>
      </template>
      <template v-else>
        <el-button v-if="canDelete" type="danger" @click="deleteNode">Delete node</el-button>
      </template>
    </div>
  </div>
</template>
