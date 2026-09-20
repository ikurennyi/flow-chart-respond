import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'

import NodeFormBusinessHours from '@/components/node-form/NodeFormBusinessHours.vue'
import { WEEK_DAYS } from '@/shared/constants.js'

const elTimePickerStub = {
  props: ['modelValue'],
  template:
    '<input class="el-time-picker-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

function mountNodeFormBusinessHours(modelValue = { times: [], timezone: 'UTC' }) {
  return shallowMount(NodeFormBusinessHours, {
    props: { modelValue, mode: 'create' },
    global: {
      stubs: {
        'el-icon': true,
        'el-time-picker': elTimePickerStub,
        'el-select': {
          props: ['modelValue'],
          template: `<select class="el-select-stub" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
            <option value="UTC">UTC</option>
            <option value="Europe/Paris">Paris</option>
          </select>`,
        },
        'el-option': true,
      },
    },
  })
}

describe('NodeFormBusinessHours', () => {
  it('renders hero title', () => {
    const wrapper = mountNodeFormBusinessHours()

    expect(wrapper.find('.bh-panel__title').text()).toBe('Business Hours')
  })

  it('renders a row per weekday', () => {
    const wrapper = mountNodeFormBusinessHours()

    expect(wrapper.findAll('.bh-panel__row')).toHaveLength(Object.keys(WEEK_DAYS).length)
  })

  it('shows weekday label from constants', () => {
    const wrapper = mountNodeFormBusinessHours()

    expect(wrapper.find('.bh-panel__day').text()).toBe(WEEK_DAYS.mon)
  })

  it('updates timezone on select change', async () => {
    const wrapper = mountNodeFormBusinessHours({ times: [], timezone: 'UTC' })

    await wrapper.find('.el-select-stub').setValue('Europe/Paris')

    expect(wrapper.props('modelValue').timezone).toBe('Europe/Paris')
  })

  it('persists start time change into model.times', async () => {
    const wrapper = mountNodeFormBusinessHours({
      times: [{ day: 'mon', startTime: '09:00', endTime: '17:00' }],
      timezone: 'UTC',
    })

    const pickers = wrapper.findAll('.el-time-picker-stub')
    await pickers[0].setValue('10:00')

    const mon = wrapper.props('modelValue').times.find((row) => row.day === 'mon')
    expect(mon?.startTime).toBe('10:00')
  })
})
