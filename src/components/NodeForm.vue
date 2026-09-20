<script setup>
import { computed, useTemplateRef, reactive, watch } from 'vue'
import { ElMessageBox } from 'element-plus'

import { useFlowStore } from '@/stores/flow'
import { titleForNode } from '@/shared/flow/graph'
import { cloneNodeData } from '@/shared/flow/nodeData'

import { NODE_FORM_PANELS, formTypeKeyForNode } from '@/components/nodeForms'
import { NODE_TYPES } from '@/shared/constants'

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
    validator: (v) => v === 'create' || v === 'edit',
  },
  nodeId: {
    type: [String, Number],
    default: null,
  },
  insertContext: {
    type: Object,
    default: null,
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

const resetCreateDraft = () => {
  draft.title = ''
  draft.nodeType = ''
  Object.keys(typeData).forEach((k) => delete typeData[k])
}

watch(
  () => [isCreate.value],
  ([create]) => {
    if (create) resetCreateDraft()
  },
  { immediate: true },
)

const syncTypeDataFromNode = (node) => {
  const data = cloneNodeData(node?.data)
  Object.keys(typeData).forEach((k) => delete typeData[k])
  Object.assign(typeData, data)
}

watch(
  () => (isEdit.value ? String(props.nodeId) : null),
  (id) => {
    if (!id) return
    const node = flowsStore.getNodeById(id)
    if (!node) return
    draft.title = titleForNode(node)
    draft.nodeType = formTypeKeyForNode(node) ?? ''
    syncTypeDataFromNode(node)
  },
  { immediate: true },
)

const titleForNodeId = (id) => titleForNode(flowsStore.getNodeById(id)) || String(id)

const insertContextTitles = computed(() => {
  const ctx = props.insertContext
  if (!ctx) return { parent: '', child: '', branch: '' }
  return {
    parent: titleForNodeId(ctx.parentId),
    child: ctx.childId ? titleForNodeId(ctx.childId) : '',
    branch: ctx.connectorId ? titleForNodeId(ctx.connectorId) : '',
  }
})
</script>

<template>
  <div class="node-form">
    <p v-if="isCreate && insertContext" class="node-form__insert-hint">
      <template v-if="insertContext.terminal || !insertContext.childId">
        Add after node <strong>{{ insertContextTitles.parent }}</strong>
      </template>
      <template v-else>
        Insert between node <strong>{{ insertContextTitles.parent }}</strong> and
        <strong>{{ insertContextTitles.child }}</strong>
        <template v-if="insertContext.connectorId">
          (branch <strong>{{ insertContextTitles.branch }}</strong
          >)
        </template>
      </template>
    </p>

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

<style scoped>
strong {
  font-weight: 600;
}
</style>
