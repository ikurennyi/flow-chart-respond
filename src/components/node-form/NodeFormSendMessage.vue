<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const MAX_ATTACHMENT_COUNT = 5
const IMAGE_EXT_PATTERN = /\.(jpe?g|png|gif|webp|bmp|svg)$/i

function isAllowedImageFile(file) {
  if (file.type?.startsWith('image/')) return true
  return IMAGE_EXT_PATTERN.test(file.name ?? '')
}

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

function newPartId() {
  return crypto.randomUUID()
}

function ensurePayload() {
  if (!Array.isArray(model.value.payload)) {
    model.value.payload = []
  }
  return model.value.payload
}

function revokeIfBlob(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function payloadList() {
  return model.value.payload ?? []
}

function ensureSingleTextPart() {
  const list = ensurePayload()
  const textIndices = []
  list.forEach((part, index) => {
    if (part.type === 'text') textIndices.push(index)
  })

  if (textIndices.length === 0) {
    list.unshift({ id: newPartId(), type: 'text', text: '' })
    return 0
  }

  for (let i = textIndices.length - 1; i >= 1; i--) {
    list.splice(textIndices[i], 1)
  }
  return list.findIndex((part) => part.type === 'text')
}

const messageText = computed({
  get() {
    const part = payloadList().find((p) => p.type === 'text')
    return part?.text ?? ''
  },
  set(value) {
    const index = ensureSingleTextPart()
    ensurePayload()[index].text = value
  },
})

const attachmentItems = computed(() =>
  payloadList()
    .map((part, index) => ({ part, index }))
    .filter(({ part }) => part.type === 'attachment'),
)

function partKey(part, index) {
  return part.id ?? `legacy-${index}`
}

function removeAttachmentAt(index) {
  const list = ensurePayload()
  const part = list[index]
  if (part?.type === 'attachment' && part.attachment) {
    revokeIfBlob(part.attachment)
  }
  list.splice(index, 1)
}

function onUpload(uploadFile) {
  const raw = uploadFile.raw
  if (!raw) return false

  if (attachmentItems.value.length >= MAX_ATTACHMENT_COUNT) {
    ElMessage.warning(`You can attach up to ${MAX_ATTACHMENT_COUNT} images.`)
    return false
  }

  if (!isAllowedImageFile(raw)) {
    ElMessage.warning('Only image files are allowed (JPEG, PNG, GIF, WebP, BMP, SVG).')
    return false
  }

  if (raw.size > MAX_ATTACHMENT_BYTES) {
    ElMessage.warning('Image must be 5 MB or smaller.')
    return false
  }

  const url = URL.createObjectURL(raw)
  ensurePayload().push({
    id: newPartId(),
    type: 'attachment',
    attachment: url,
    fileName: raw.name,
  })
  return false
}
</script>

<template>
  <div class="sm-panel">
    <h3 class="sm-panel__title">Message content</h3>

    <el-input v-model="messageText" type="textarea" :rows="4" placeholder="Message text" />

    <h4 class="sm-panel__subtitle">Attachments</h4>
    <div class="sm-panel__tiles">
      <div
        v-for="{ part, index } in attachmentItems"
        :key="partKey(part, index)"
        class="sm-panel__tile"
      >
        <el-image :src="part.attachment" fit="cover" class="sm-panel__preview" />
        <span v-if="part.fileName" class="sm-panel__filename">{{ part.fileName }}</span>
        <el-button type="danger" size="small" @click="removeAttachmentAt(index)">Remove</el-button>
      </div>
    </div>

    <el-upload :show-file-list="false" :auto-upload="false" accept="image/*" :on-change="onUpload">
      <el-button type="default">Upload attachment</el-button>
    </el-upload>
  </div>
</template>

<style scoped>
.sm-panel {
  margin-top: 1rem;
}

.sm-panel__title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}

.sm-panel__subtitle {
  margin: 1rem 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.sm-panel__tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.sm-panel__tile {
  width: 140px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sm-panel__preview {
  width: 140px;
  height: 100px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.sm-panel__filename {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
