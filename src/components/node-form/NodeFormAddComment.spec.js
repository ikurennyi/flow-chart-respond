import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'

import NodeFormAddComment from '@/components/node-form/NodeFormAddComment.vue'

const elInputStub = {
  props: ['modelValue', 'type', 'rows', 'placeholder'],
  template:
    '<textarea class="el-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

function mountNodeFormAddComment(modelValue = { comment: '' }) {
  return shallowMount(NodeFormAddComment, {
    props: { modelValue, mode: 'create' },
    global: { stubs: { 'el-input': elInputStub } },
  })
}

describe('NodeFormAddComment', () => {
  it('renders section title', () => {
    const wrapper = mountNodeFormAddComment()

    expect(wrapper.find('.ac-panel__title').text()).toBe('Comment')
  })

  it('binds comment field to model', () => {
    const wrapper = mountNodeFormAddComment({ comment: 'Note' })

    expect(wrapper.find('.el-input-stub').element.value).toBe('Note')
  })

  it('updates model comment on input', async () => {
    const wrapper = mountNodeFormAddComment({ comment: '' })

    await wrapper.find('.el-input-stub').setValue('Updated')

    expect(wrapper.props('modelValue').comment).toBe('Updated')
  })
})
