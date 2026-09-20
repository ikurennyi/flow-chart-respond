import { describe, expect, it } from 'vitest'

import { validateNodeData } from '@/shared/flow/validateNodeData.js'

describe('validateNodeData', () => {
  describe('sendMessage', () => {
    it('accepts text or attachment', () => {
      expect(
        validateNodeData('sendMessage', { payload: [{ type: 'text', text: ' hi ' }] }),
      ).toEqual({ valid: true })
      expect(
        validateNodeData('sendMessage', { payload: [{ type: 'attachment', attachment: 'x' }] }),
      ).toEqual({ valid: true })
    })

    it('rejects empty payload', () => {
      expect(validateNodeData('sendMessage', { payload: [] })).toEqual({
        valid: false,
        message: 'Add message text or at least one attachment.',
      })
    })

    it('rejects whitespace-only text and empty text parts', () => {
      expect(validateNodeData('sendMessage', { payload: [{ type: 'text', text: '   ' }] })).toEqual(
        {
          valid: false,
          message: 'Add message text or at least one attachment.',
        },
      )
      expect(validateNodeData('sendMessage', { payload: [{ type: 'text', text: '' }] })).toEqual({
        valid: false,
        message: 'Add message text or at least one attachment.',
      })
    })

    it('treats missing data as empty payload', () => {
      expect(validateNodeData('sendMessage', undefined)).toEqual({
        valid: false,
        message: 'Add message text or at least one attachment.',
      })
    })
  })

  describe('addComment', () => {
    it('requires non-empty comment', () => {
      expect(validateNodeData('addComment', { comment: 'note' })).toEqual({ valid: true })
      expect(validateNodeData('addComment', { comment: '   ' })).toEqual({
        valid: false,
        message: 'Comment is required.',
      })
      expect(validateNodeData('addComment', {})).toEqual({
        valid: false,
        message: 'Comment is required.',
      })
    })
  })

  describe('businessHours', () => {
    it('requires timezone and valid time ranges', () => {
      expect(
        validateNodeData('businessHours', {
          timezone: 'UTC',
          times: [{ startTime: '09:00', endTime: '17:00', day: 'mon' }],
        }),
      ).toEqual({ valid: true })

      expect(validateNodeData('businessHours', { times: [] })).toEqual({
        valid: false,
        message: 'Timezone is required.',
      })

      expect(
        validateNodeData('businessHours', {
          timezone: 'UTC',
          times: [{ startTime: '17:00', endTime: '09:00', day: 'mon' }],
        }),
      ).toEqual({
        valid: false,
        message: 'End time must be after start time for each day.',
      })
    })

    it('allows empty schedule when timezone is set', () => {
      expect(validateNodeData('businessHours', { timezone: 'UTC', times: [] })).toEqual({
        valid: true,
      })
    })

    it('requires both times on each row', () => {
      expect(
        validateNodeData('businessHours', {
          timezone: 'UTC',
          times: [{ startTime: '09:00', day: 'mon' }],
        }),
      ).toEqual({
        valid: false,
        message: 'Each day must have start and end times.',
      })
    })

    it('rejects equal start and end times', () => {
      expect(
        validateNodeData('businessHours', {
          timezone: 'UTC',
          times: [{ startTime: '09:00', endTime: '09:00', day: 'mon' }],
        }),
      ).toEqual({
        valid: false,
        message: 'End time must be after start time for each day.',
      })
    })
  })

  it('allows unknown form types', () => {
    expect(validateNodeData('trigger', {})).toEqual({ valid: true })
  })
})
