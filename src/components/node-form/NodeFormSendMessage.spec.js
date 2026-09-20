import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'

import NodeFormSendMessage from '@/components/node-form/NodeFormSendMessage.vue'

vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    ElMessage: { warning: vi.fn() },
  }
})

const elInputStub = {
  props: ['modelValue'],
  template:
    '<textarea class="el-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

const elUploadStub = {
  name: 'ElUploadStub',
  props: ['onChange'],
  template: '<button type="button" class="upload-stub" @click="pickFile">Upload</button>',
  methods: {
    pickFile() {
      this.$props.onChange?.({ raw: this.mockFile })
    },
  },
  data() {
    return { mockFile: null }
  },
}

function mountNodeFormSendMessage(modelValue = { payload: [] }) {
  return shallowMount(NodeFormSendMessage, {
    props: { modelValue, mode: 'create' },
    global: {
      stubs: {
        'el-input': elInputStub,
        'el-image': true,
        'el-button': {
          template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
        'el-upload': elUploadStub,
      },
    },
  })
}

describe('NodeFormSendMessage', () => {
  beforeEach(() => {
    ElMessage.warning.mockClear()
  })

  it('renders message section title', () => {
    const wrapper = mountNodeFormSendMessage()

    expect(wrapper.find('.sm-panel__title').text()).toBe('Message content')
  })

  it('binds message text from payload', () => {
    const wrapper = mountNodeFormSendMessage({
      payload: [{ type: 'text', text: 'Hello' }],
    })

    expect(wrapper.find('.el-input-stub').element.value).toBe('Hello')
  })

  it('writes text into payload model', async () => {
    const wrapper = mountNodeFormSendMessage({ payload: [] })

    await wrapper.find('.el-input-stub').setValue('Draft')

    const textPart = wrapper.props('modelValue').payload.find((p) => p.type === 'text')
    expect(textPart?.text).toBe('Draft')
  })

  it('renders attachment file name', () => {
    const wrapper = mountNodeFormSendMessage({
      payload: [{ type: 'attachment', attachment: 'blob:x', fileName: 'photo.png' }],
    })

    expect(wrapper.find('.sm-panel__filename').text()).toBe('photo.png')
  })

  it('removes attachment when Remove is clicked', async () => {
    const wrapper = mountNodeFormSendMessage({
      payload: [
        { type: 'text', text: '' },
        { type: 'attachment', attachment: 'blob:x', fileName: 'photo.png' },
      ],
    })

    const removeButton = wrapper.findAll('button').find((btn) => btn.text() === 'Remove')
    await removeButton.trigger('click')

    expect(wrapper.props('modelValue').payload.some((p) => p.type === 'attachment')).toBe(false)
  })
})

describe('NodeFormSendMessage upload', () => {
  beforeEach(() => {
    ElMessage.warning.mockClear()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds image attachment to payload', async () => {
    const wrapper = mountNodeFormSendMessage({ payload: [] })
    const upload = wrapper.findComponent({ name: 'ElUploadStub' })
    upload.vm.mockFile = new File(['x'], 'pic.png', { type: 'image/png' })

    await wrapper.find('.upload-stub').trigger('click')

    expect(wrapper.props('modelValue').payload.some((p) => p.type === 'attachment')).toBe(true)
  })

  it('warns when file is not an image', async () => {
    const wrapper = mountNodeFormSendMessage({ payload: [] })
    const upload = wrapper.findComponent({ name: 'ElUploadStub' })
    upload.vm.mockFile = new File(['x'], 'doc.pdf', { type: 'application/pdf' })

    await wrapper.find('.upload-stub').trigger('click')

    expect(ElMessage.warning).toHaveBeenCalledWith(
      'Only image files are allowed (JPEG, PNG, GIF, WebP, BMP, SVG).',
    )
  })
})
