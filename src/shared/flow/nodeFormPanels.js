import { markRaw } from 'vue'

import NodeFormSendMessage from '@/components/node-form/NodeFormSendMessage.vue'
import NodeFormBusinessHours from '@/components/node-form/NodeFormBusinessHours.vue'
import NodeFormAddComment from '@/components/node-form/NodeFormAddComment.vue'

export const NODE_FORM_PANELS = {
  sendMessage: markRaw(NodeFormSendMessage),
  businessHours: markRaw(NodeFormBusinessHours),
  addComment: markRaw(NodeFormAddComment),
}

export function panelKeyForNode(node) {
  if (!node) return null
  if (node.type === 'dateTime') return 'businessHours'
  if (node.type === 'addComment') return 'addComment'
  if (node.type === 'sendMessage') return 'sendMessage'
  return null
}

export function drawerTitleForNode(node) {
  if (!node) return 'Node details'
  if (node.type === 'dateTime') return 'Business Hours'
  if (node.type === 'addComment') return 'Add Comment'
  if (node.type === 'sendMessage') return 'Send Message'
  if (node.type === 'trigger') return 'Trigger'
  return 'Node details'
}
