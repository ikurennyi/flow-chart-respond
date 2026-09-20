import { describe, expect, it, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { ElMessageBox } from 'element-plus'

import NodeForm from '@/components/NodeForm.vue'
import NodeFormSendMessage from '@/components/node-form/NodeFormSendMessage.vue'
import NodeFormAddComment from '@/components/node-form/NodeFormAddComment.vue'
import NodeFormBusinessHours from '@/components/node-form/NodeFormBusinessHours.vue'

const getNodeById = vi.fn()
const updateNode = vi.fn()
const insertNode = vi.fn()
const closeAddNodeForm = vi.fn()
const deleteNodeStore = vi.fn()

vi.mock('@/stores/flow', () => ({
  useFlowStore: () => ({
    getNodeById,
    updateNode,
    insertNode,
    closeAddNodeForm,
    deleteNode: deleteNodeStore,
  }),
}))

vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    ElMessage: { warning: vi.fn() },
    ElMessageBox: { confirm: vi.fn(() => Promise.resolve()) },
  }
})

const elInputStub = {
  props: ['modelValue'],
  template:
    '<input class="el-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" />',
}

const elSelectStub = {
  props: ['modelValue', 'disabled', 'placeholder'],
  template: `<select class="el-select-stub" :disabled="disabled" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
    <option value="">Select type</option>
    <option value="sendMessage">Send Message</option>
    <option value="addComment">Add Comment</option>
    <option value="businessHours">Business Hours</option>
  </select>`,
}

const elFormStub = {
  name: 'ElFormStub',
  template: '<form class="el-form-stub"><slot /></form>',
  methods: {
    validate() {
      return Promise.resolve(true)
    },
  },
}

const elButtonStub = {
  inheritAttrs: false,
  template: '<button type="button" class="el-button-stub" v-bind="$attrs"><slot /></button>',
}

function mountNodeForm(props = {}) {
  return shallowMount(NodeForm, {
    props: { mode: 'create', ...props },
    global: {
      stubs: {
        'el-form': elFormStub,
        'el-form-item': { template: '<div class="el-form-item-stub"><slot /></div>' },
        'el-input': elInputStub,
        'el-select': elSelectStub,
        'el-option': true,
        'el-button': elButtonStub,
        [NodeFormSendMessage]: { template: '<div class="panel-send-message" />' },
        [NodeFormAddComment]: { template: '<div class="panel-add-comment" />' },
        [NodeFormBusinessHours]: { template: '<div class="panel-business-hours" />' },
      },
    },
  })
}

function findButtonByText(wrapper, text) {
  return wrapper.findAll('.el-button-stub').find((btn) => btn.text() === text)
}

describe('NodeForm create mode', () => {
  beforeEach(() => {
    getNodeById.mockReset()
    insertNode.mockReset()
    closeAddNodeForm.mockReset()
  })

  it('shows Add Node action', () => {
    const wrapper = mountNodeForm()

    expect(findButtonByText(wrapper, 'Add Node')?.exists()).toBe(true)
  })

  it('shows Cancel action', () => {
    const wrapper = mountNodeForm()

    expect(findButtonByText(wrapper, 'Cancel')?.exists()).toBe(true)
  })

  it('shows terminal insert hint', () => {
    const wrapper = mountNodeForm({
      insertContext: { parentId: 'leaf', terminal: true },
    })

    expect(wrapper.find('.node-form__insert-hint').text()).toContain('Add after node')
  })

  it('shows between-nodes insert hint', () => {
    const wrapper = mountNodeForm({
      insertContext: { parentId: 'a', childId: 'b', connectorId: 'branch-1' },
    })

    expect(wrapper.find('.node-form__insert-hint').text()).toContain('Insert between node')
  })

  it('renders send message panel when type is sendMessage', async () => {
    const wrapper = mountNodeForm()

    await wrapper.find('.el-select-stub').setValue('sendMessage')
    await flushPromises()

    expect(wrapper.findComponent(NodeFormSendMessage).exists()).toBe(true)
  })

  it('emits cancel and closes form on Cancel click', async () => {
    const wrapper = mountNodeForm()

    await findButtonByText(wrapper, 'Cancel').trigger('click')

    expect(wrapper.emitted('cancel')).toEqual([[]])
  })

  it('calls closeAddNodeForm on Cancel click', async () => {
    const wrapper = mountNodeForm()

    await findButtonByText(wrapper, 'Cancel').trigger('click')

    expect(closeAddNodeForm).toHaveBeenCalled()
  })
})

describe('NodeForm edit mode', () => {
  beforeEach(() => {
    getNodeById.mockReset()
    updateNode.mockReset()
    deleteNodeStore.mockReset()
    ElMessageBox.confirm.mockClear()
  })

  it('prefills title from store node', async () => {
    getNodeById.mockReturnValue({
      id: 'n1',
      type: 'sendMessage',
      name: 'Welcome',
      data: { payload: [{ type: 'text', text: 'Hi' }] },
    })

    const wrapper = mountNodeForm({ mode: 'edit', nodeId: 'n1' })
    await flushPromises()

    expect(wrapper.find('.el-input-stub').element.value).toBe('Welcome')
  })

  it('disables node type select', async () => {
    getNodeById.mockReturnValue({
      id: 'n1',
      type: 'addComment',
      name: 'Note',
      data: { comment: 'x' },
    })

    const wrapper = mountNodeForm({ mode: 'edit', nodeId: 'n1' })
    await flushPromises()

    expect(wrapper.find('.el-select-stub').attributes('disabled')).toBeDefined()
  })

  it('shows Delete for non-trigger nodes', async () => {
    getNodeById.mockReturnValue({
      id: 'n1',
      type: 'sendMessage',
      name: 'Msg',
      data: { payload: [] },
    })

    const wrapper = mountNodeForm({ mode: 'edit', nodeId: 'n1' })
    await flushPromises()

    expect(findButtonByText(wrapper, 'Delete node')?.exists()).toBe(true)
  })

  it('hides Delete for trigger nodes', async () => {
    getNodeById.mockReturnValue({
      id: 1,
      type: 'trigger',
      data: { type: 'conversationOpened' },
    })

    const wrapper = mountNodeForm({ mode: 'edit', nodeId: 1 })
    await flushPromises()

    expect(findButtonByText(wrapper, 'Delete node')).toBeUndefined()
  })

  it('updates node name on title blur', async () => {
    getNodeById.mockReturnValue({
      id: 'n1',
      type: 'sendMessage',
      name: 'Old',
      data: { payload: [{ type: 'text', text: 'Hi' }] },
    })

    const wrapper = mountNodeForm({ mode: 'edit', nodeId: 'n1' })
    await flushPromises()
    await wrapper.find('.el-input-stub').setValue('  New title  ')
    await wrapper.find('.el-input-stub').trigger('blur')

    expect(updateNode).toHaveBeenCalledWith('n1', { name: 'New title' })
  })

  it('deletes node after confirm', async () => {
    getNodeById.mockReturnValue({
      id: 'n1',
      type: 'addComment',
      name: 'Note',
      data: { comment: 'x' },
    })

    const wrapper = mountNodeForm({ mode: 'edit', nodeId: 'n1' })
    await flushPromises()
    await findButtonByText(wrapper, 'Delete node').trigger('click')
    await flushPromises()

    expect(deleteNodeStore).toHaveBeenCalledWith('n1')
  })

  it('emits deleted after confirm', async () => {
    getNodeById.mockReturnValue({
      id: 'n1',
      type: 'addComment',
      name: 'Note',
      data: { comment: 'x' },
    })

    const wrapper = mountNodeForm({ mode: 'edit', nodeId: 'n1' })
    await flushPromises()
    await findButtonByText(wrapper, 'Delete node').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('deleted')).toEqual([[]])
  })
})
