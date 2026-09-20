import { parseTimeString } from '@/shared/flow/nodeData.js'

function validateSendMessageData(data) {
  const parts = data?.payload ?? []
  const hasText = parts.some((p) => p.type === 'text' && String(p.text ?? '').trim())
  const hasAttachment = parts.some((p) => p.type === 'attachment')
  if (hasText || hasAttachment) return { valid: true }
  return { valid: false, message: 'Add message text or at least one attachment.' }
}

function validateAddCommentData(data) {
  const comment = String(data?.comment ?? '').trim()
  if (comment.length > 0) return { valid: true }
  return { valid: false, message: 'Comment is required.' }
}

function validateBusinessHoursData(data) {
  if (!data?.timezone) {
    return { valid: false, message: 'Timezone is required.' }
  }
  const times = data.times ?? []
  for (const row of times) {
    if (!row.startTime || !row.endTime) {
      return { valid: false, message: 'Each day must have start and end times.' }
    }
    const start = parseTimeString(row.startTime)
    const end = parseTimeString(row.endTime)
    if (!start || !end || start >= end) {
      return { valid: false, message: 'End time must be after start time for each day.' }
    }
  }
  return { valid: true }
}

export function validateNodeData(formType, data) {
  switch (formType) {
    case 'sendMessage':
      return validateSendMessageData(data)
    case 'addComment':
      return validateAddCommentData(data)
    case 'businessHours':
      return validateBusinessHoursData(data)
    default:
      return { valid: true }
  }
}
