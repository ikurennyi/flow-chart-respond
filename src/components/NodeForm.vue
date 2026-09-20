<script setup>
import { computed, reactive, ref, watch, onMounted, useTemplateRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { NODE_TYPES } from '@/shared/constants.js'
import { titleForNode } from '@/shared/flow/graph.js'
import { cloneNodeData, defaultDataForFormType } from '@/shared/flow/nodeData.js'
import { NODE_FORM_PANELS, panelKeyForNode } from '@/shared/flow/nodeFormPanels.js'
import { nodeFormRules } from '@/components/node-form/formRules.js'
import { validateNodeData } from '@/shared/flow/validateNodeData.js'
import { useFlowStore } from '@/stores/flow'

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
const lastEditValidationWarned = ref(false)

const canDelete = computed(() => {
  if (!isEdit.value) return false
  return flowsStore.getNodeById(props.nodeId)?.type !== 'trigger'
})

const formTypeKey = computed(() => {
  if (isCreate.value) return draft.nodeType || null
  const node = flowsStore.getNodeById(props.nodeId)
  return panelKeyForNode(node)
})

const panelComponent = computed(() => {
  const key = formTypeKey.value
  return key ? NODE_FORM_PANELS[key] : null
})

const draft = reactive({
  title: '',
  nodeType: '',
})

let typeData = reactive({})

const formRules = computed(() => {
  if (isCreate.value) {
    return {
      title: nodeFormRules.title,
      nodeType: nodeFormRules.nodeType,
    }
  }
  return { title: nodeFormRules.title }
})

const resetTypeDataFromDefaults = (formType) => {
  const defaults = defaultDataForFormType(formType)
  Object.keys(typeData).forEach((k) => delete typeData[k])
  Object.assign(typeData, cloneNodeData(defaults))
}

const syncTypeDataFromNode = (node) => {
  const data = cloneNodeData(node?.data)
  Object.keys(typeData).forEach((k) => delete typeData[k])
  Object.assign(typeData, data)
}

const resetCreateDraft = () => {
  draft.title = ''
  draft.nodeType = ''
  Object.keys(typeData).forEach((k) => delete typeData[k])
}

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

watch(
  () => [isCreate.value, props.insertContext],
  ([create]) => {
    if (create) resetCreateDraft()
  },
  { immediate: true },
)

watch(
  () => draft.nodeType,
  (formType) => {
    if (!isCreate.value || !formType) return
    resetTypeDataFromDefaults(formType)
  },
)

watch(
  () => (isEdit.value ? String(props.nodeId) : null),
  (id) => {
    if (!id) return
    const node = flowsStore.getNodeById(id)
    if (!node) return
    draft.title = titleForNode(node)
    draft.nodeType = panelKeyForNode(node) ?? ''
    syncTypeDataFromNode(node)
    lastEditValidationWarned.value = false
  },
  { immediate: true },
)

watch(
  typeData,
  () => {
    if (!isEdit.value || !props.nodeId) return
    const formType = formTypeKey.value
    if (!formType) return

    const { valid, message } = validateNodeData(formType, typeData)
    if (!valid) {
      if (!lastEditValidationWarned.value && message) {
        ElMessage.warning(message)
        lastEditValidationWarned.value = true
      }
      return
    }

    lastEditValidationWarned.value = false
    flowsStore.updateNode(props.nodeId, { data: cloneNodeData(typeData) })
  },
  { deep: true },
)

function onTitleBlur() {
  if (!isEdit.value || !props.nodeId) return
  flowsStore.updateNode(props.nodeId, { name: draft.title.trim() })
}

const submitCreate = async () => {
  const form = formRef.value
  if (!form) return

  try {
    await form.validate()
  } catch {
    return
  }

  const formType = draft.nodeType
  const { valid, message } = validateNodeData(formType, typeData)
  if (!valid) {
    ElMessage.warning(message ?? 'Please fix node data before saving.')
    return
  }

  const newId = flowsStore.insertNode({
    title: draft.title.trim(),
    formType,
    data: cloneNodeData(typeData),
    insertContext: props.insertContext,
  })

  if (newId) emit('created', newId)
}

const cancelForm = () => {
  emit('cancel')
  flowsStore.closeAddNodeForm()
}

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
    /* cancelled */
  }
}

const titleRef = useTemplateRef('title-ref')
onMounted(() => {
  if (isCreate.value) titleRef.value?.focus?.()
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

    <el-form
      ref="form-ref"
      :model="draft"
      :rules="formRules"
      label-width="auto"
      label-position="top"
    >
      <el-form-item label="Title" prop="title">
        <el-input v-model="draft.title" ref="title-ref" @blur="onTitleBlur" />
      </el-form-item>

      <el-form-item label="Node Type" prop="nodeType">
        <el-select v-model="draft.nodeType" :disabled="isEdit" placeholder="Select type">
          <el-option v-for="(label, key) in NODE_TYPES" :key="key" :value="key" :label="label" />
        </el-select>
      </el-form-item>

      <component v-if="panelComponent" :is="panelComponent" v-model="typeData" :mode="mode" />
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
