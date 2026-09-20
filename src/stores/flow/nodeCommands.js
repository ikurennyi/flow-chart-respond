import { titleForNode } from '@/shared/flow/graph'
import { applyInsertNode } from '@/shared/flow/insertNode'
import { collectDescendantIds, findNodeById, patchNodeInList } from '@/shared/flow/utils'

export function insertNodeCommand(nodes, { title, formType, data, insertContext }) {
  if (!formType) return null

  const { nodes: next, newNodeId } = applyInsertNode(
    nodes,
    { title, formType, data },
    insertContext,
  )

  return {
    next,
    newNodeId,
    historyAction: {
      label: `Added "${(title ?? '').trim() || 'Node'}"`,
      kind: 'add',
    },
  }
}

export function updateNodeCommand(nodes, nodeId, patch) {
  const next = patchNodeInList(nodes, nodeId, patch)
  if (next === nodes) return null

  const updated = findNodeById(next, nodeId)
  return {
    next,
    historyAction: {
      label: `Edited "${titleForNode(updated)}"`,
      kind: 'edit',
      coalesceKey: `edit:${nodeId}`,
    },
  }
}

export function updateNodeLayoutCommand(nodes, nodeId, position) {
  const node = findNodeById(nodes, nodeId)
  if (!node) return null

  const layout = { x: Math.round(position.x), y: Math.round(position.y) }
  const existing = node.layout
  if (existing?.x === layout.x && existing?.y === layout.y) return null

  const next = patchNodeInList(nodes, nodeId, { layout })
  if (next === nodes) return null

  return {
    next,
    historyAction: {
      label: `Moved "${titleForNode(node)}"`,
      kind: 'move',
    },
  }
}

export function deleteNodeCommand(nodes, nodeId) {
  const target = findNodeById(nodes, nodeId)
  if (!target || target.type === 'trigger') return null

  const toRemove = collectDescendantIds(nodes, nodeId)
  const next = nodes.filter((node) => !toRemove.has(String(node.id)))

  return {
    next,
    historyAction: {
      label: `Deleted "${titleForNode(target)}"`,
      kind: 'delete',
    },
    clearedSelection: String(nodeId),
  }
}
