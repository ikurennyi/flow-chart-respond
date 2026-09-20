import seedFlowNodes from '@/shared/seed/flow-nodes.json'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Load flow nodes (replace with fetch('/api/flow') when a backend exists). */
export async function fetchFlowNodes() {
  await delay(500)
  return structuredClone(seedFlowNodes)
}

/** Persist flow nodes (replace with PUT/POST to your API). */
export async function saveFlowNodes(nodes) {
  await Promise.resolve()
  return nodes
}
