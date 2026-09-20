export function findNodeById(allNodes, nodeId) {
  if (nodeId == null || nodeId === '') return undefined
  return allNodes.find((node) => String(node.id) === String(nodeId))
}
