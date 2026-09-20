import { describe, expect, it } from 'vitest'

import { cloneNodeData } from '@/shared/flow/nodeData.js'

describe('cloneNodeData', () => {
  it('deep-clones plain objects', () => {
    const source = { payload: [{ text: 'a' }] }
    const copy = cloneNodeData(source)
    copy.payload[0].text = 'b'
    expect(source.payload[0].text).toBe('a')
  })

  it('clones undefined or null as empty object', () => {
    expect(cloneNodeData(undefined)).toEqual({})
    expect(cloneNodeData(null)).toEqual({})
  })
})
