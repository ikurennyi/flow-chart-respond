import { toRaw } from 'vue'

/** Deep clone JSON-serializable values; safe for Vue reactive proxies. */
export function clonePlain(value) {
  return JSON.parse(JSON.stringify(toRaw(value)))
}

export function isConnector(node) {
  return node?.type === 'dateTimeConnector'
}

export function findNodeById(allNodes, nodeId) {
  if (nodeId == null || nodeId === '') return undefined
  return allNodes.find((node) => String(node.id) === String(nodeId))
}

export function collectDescendantIds(allNodes, rootId) {
  const ids = new Set([String(rootId)])
  let changed = true
  while (changed) {
    changed = false
    for (const node of allNodes) {
      const id = String(node.id)
      if (ids.has(id)) continue
      if (ids.has(String(node.parentId))) {
        ids.add(id)
        changed = true
      }
    }
  }
  return ids
}

export function patchNodeInList(allNodes, nodeId, patch) {
  const index = allNodes.findIndex((node) => String(node.id) === String(nodeId))
  if (index === -1) return allNodes

  const current = allNodes[index]
  const updated = { ...current, ...patch }
  if (patch.data !== undefined) {
    updated.data = { ...(current.data ?? {}), ...patch.data }
  }

  const next = allNodes.slice()
  next[index] = updated
  return next
}
