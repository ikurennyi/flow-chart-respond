import { cloneNodeData, defaultDataForFormType } from '@/shared/flow/nodeData.js'

export function formTypeToPayloadType(formType) {
  switch (formType) {
    case 'businessHours':
      return 'dateTime'
    case 'addComment':
      return 'addComment'
    default:
      return 'sendMessage'
  }
}

export const parentIdForInsert = (context) => {
  if (!context) return 1
  if (context.connectorId) return context.connectorId
  return context.parentId
}

function generateNodeId(existingNodes) {
  const ids = new Set(existingNodes.map((node) => String(node.id)))
  let id
  do {
    id = crypto.randomUUID().replace(/-/g, '').slice(0, 6)
  } while (ids.has(id))
  return id
}

export function applyInsertNode(nodes, { title, formType, data }, context) {
  const id = generateNodeId(nodes)
  const parentId = parentIdForInsert(context)
  const nodeData =
    data && Object.keys(data).length > 0
      ? cloneNodeData(data)
      : cloneNodeData(defaultDataForFormType(formType))

  const newNode = {
    id,
    name: title ?? '',
    type: formTypeToPayloadType(formType),
    parentId,
    data: nodeData,
  }

  let next = [...nodes]

  if (context?.childId && !context?.terminal) {
    next = next.map((node) =>
      String(node.id) === String(context.childId) ? { ...node, parentId: id } : node,
    )
  }

  next.push(newNode)
  return { nodes: next, newNodeId: id }
}
