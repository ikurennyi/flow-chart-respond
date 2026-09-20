import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import {
  clonePlain,
  collectDescendantIds,
  findNodeById,
  isConnector,
  patchNodeInList,
} from '@/shared/flow/utils.js'

const nodes = [
  { id: 1, parentId: -1, type: 'trigger' },
  { id: 'a', parentId: 1, type: 'sendMessage' },
  { id: 'b', parentId: 'a', type: 'addComment' },
  { id: 'c', type: 'dateTimeConnector', parentId: 'x' },
]

describe('isConnector', () => {
  it('detects dateTimeConnector nodes', () => {
    expect(isConnector({ type: 'dateTimeConnector' })).toBe(true)
    expect(isConnector({ type: 'sendMessage' })).toBe(false)
    expect(isConnector(null)).toBe(false)
  })
})

describe('findNodeById', () => {
  it('matches numeric and string ids', () => {
    expect(findNodeById(nodes, 1)?.type).toBe('trigger')
    expect(findNodeById(nodes, 'a')?.type).toBe('sendMessage')
  })

  it('returns undefined for missing or empty id', () => {
    expect(findNodeById(nodes, 'missing')).toBeUndefined()
    expect(findNodeById(nodes, '')).toBeUndefined()
    expect(findNodeById(nodes, null)).toBeUndefined()
  })
})

describe('collectDescendantIds', () => {
  it('includes all transitive children', () => {
    const ids = collectDescendantIds(nodes, 1)
    expect(ids.has('1')).toBe(true)
    expect(ids.has('a')).toBe(true)
    expect(ids.has('b')).toBe(true)
    expect(ids.has('c')).toBe(false)
  })

  it('returns only root when there are no children', () => {
    const ids = collectDescendantIds(nodes, 'b')
    expect([...ids]).toEqual(['b'])
  })

  it('coerces root id to string', () => {
    const ids = collectDescendantIds(nodes, 1)
    expect(ids.has('1')).toBe(true)
  })
})

describe('patchNodeInList', () => {
  it('merges top-level fields and shallow-merges data', () => {
    const next = patchNodeInList(
      [{ id: 'a', name: 'Old', data: { comment: 'x', keep: true } }],
      'a',
      { name: 'New', data: { comment: 'y' } },
    )
    expect(next[0].name).toBe('New')
    expect(next[0].data).toEqual({ comment: 'y', keep: true })
  })

  it('returns the same list when id is not found', () => {
    const list = [{ id: 'a' }]
    expect(patchNodeInList(list, 'missing', { name: 'x' })).toBe(list)
  })

  it('replaces data when patch sets data explicitly', () => {
    const next = patchNodeInList([{ id: 'a', data: { keep: true } }], 'a', { data: { only: 1 } })
    expect(next[0].data).toEqual({ keep: true, only: 1 })
  })

  it('leaves data unchanged when patch omits data', () => {
    const next = patchNodeInList([{ id: 'a', name: 'Old', data: { comment: 'x' } }], 'a', {
      name: 'New',
    })
    expect(next[0].data).toEqual({ comment: 'x' })
  })

  it('handles nodes without existing data object', () => {
    const next = patchNodeInList([{ id: 'a' }], 'a', { data: { comment: 'new' } })
    expect(next[0].data).toEqual({ comment: 'new' })
  })
})

describe('clonePlain', () => {
  it('deep-clones plain objects', () => {
    const source = { a: 1, nested: { b: 2 } }
    const copy = clonePlain(source)
    expect(copy).toEqual(source)
    expect(copy).not.toBe(source)
    expect(copy.nested).not.toBe(source.nested)
  })

  it('clones reactive proxies', () => {
    const source = reactive([{ id: 1, data: { x: true } }])
    const copy = clonePlain(source)
    expect(copy).toEqual([{ id: 1, data: { x: true } }])
    expect(copy[0]).not.toBe(source[0])
  })
})
