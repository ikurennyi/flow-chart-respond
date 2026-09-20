import { toRaw } from 'vue'

import { WEEK_DAYS, WORK_HORS } from '@/shared/constants.js'

export function cloneNodeData(value) {
  return JSON.parse(JSON.stringify(toRaw(value ?? {})))
}

export function defaultTimesForWeek() {
  return Object.keys(WEEK_DAYS).map((day) => ({
    day,
    startTime: WORK_HORS.start,
    endTime: WORK_HORS.end,
  }))
}

export function defaultDataForFormType(formType) {
  switch (formType) {
    case 'sendMessage':
      return { payload: [] }
    case 'addComment':
      return { comment: '' }
    case 'businessHours':
      return {
        action: 'businessHours',
        times: defaultTimesForWeek(),
        timezone: 'UTC',
        connectors: [],
      }
    default:
      return {}
  }
}

export function parseTimeString(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m ?? 0, 0, 0)
  return d
}

export function formatTimeString(date) {
  if (!date) return ''
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

// NOTE: just a "fake list" for the demo
export const TIMEZONE_OPTIONS = [
  { label: '(GMT−01:00) Azores', value: 'Atlantic/Azores' },
  { label: '(GMT+00:00) UTC', value: 'UTC' },
  { label: '(GMT+01:00) Central European Time', value: 'Europe/Paris' },
]
