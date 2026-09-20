import { markRaw } from 'vue'

import NodeFormSendMessage from '@/components/node-form/NodeFormSendMessage.vue'
import NodeFormBusinessHours from '@/components/node-form/NodeFormBusinessHours.vue'
import NodeFormAddComment from '@/components/node-form/NodeFormAddComment.vue'

export const NODE_FORM_PANELS = {
  sendMessage: markRaw(NodeFormSendMessage),
  businessHours: markRaw(NodeFormBusinessHours),
  addComment: markRaw(NodeFormAddComment),
}

export const formTypeKeyForNode = (node) => {
  if (!node) return null
  switch (node.type) {
    case 'dateTime':
      return 'businessHours'
    case 'addComment':
      return 'addComment'
    case 'sendMessage':
      return 'sendMessage'
    default:
      return null
  }
}
