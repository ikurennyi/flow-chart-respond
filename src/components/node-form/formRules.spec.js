import { describe, expect, it } from 'vitest'

import { nodeFormRules } from '@/components/node-form/formRules.js'

describe('nodeFormRules.title', () => {
  it('requires title on blur', () => {
    expect(nodeFormRules.title[0]).toMatchObject({
      required: true,
      message: 'Title is required',
      trigger: 'blur',
    })
  })

  it('limits title length on blur', () => {
    expect(nodeFormRules.title[1]).toMatchObject({
      max: 120,
      trigger: 'blur',
    })
  })
})

describe('nodeFormRules.nodeType', () => {
  it('requires node type on change', () => {
    expect(nodeFormRules.nodeType[0]).toMatchObject({
      required: true,
      message: 'Select a node type',
      trigger: 'change',
    })
  })
})
