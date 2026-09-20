import { MarkerType } from '@vue-flow/core'

const NODE_SIZE = { width: 240, height: 84 }
const GAP = { x: 64, y: 64 }

export const NODE_META = {
  trigger: { icon: 'Bell', label: 'Trigger' },
  sendMessage: { icon: 'Promotion', label: 'Send Message' },
  dateTime: { icon: 'AlarmClock', label: 'Date & Time' },
  addComment: { icon: 'EditPen', label: 'Add Comment' },
}

const FALLBACK_META = { icon: 'QuestionFilled', label: 'Node' }

const EDGE_COLORS = {
  success: {
    label: { fill: '#529b2e', fontSize: '12px', fontWeight: 600 },
    bg: { fill: '#d1edc4', stroke: '#b3e19d' },
  },
  error: {
    label: { fill: '#f89898', fontSize: '12px', fontWeight: 600 },
    bg: { fill: '#fde2e2', stroke: '#f89898' },
  },
}

const getEdgeLabelStyle = ({ name }) => {
  return name === 'Success' ? EDGE_COLORS.success : EDGE_COLORS.error
}

const isConnector = (node) => node.type === 'dateTimeConnector'

const metaFor = (node) => NODE_META[node.type] ?? FALLBACK_META

const prettify = (value) => {
  const spaced = value.replace(/([A-Z])/g, ' $1').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export const titleForNode = (node) => {
  if (!node) return ''
  const meta = metaFor(node)
  if (node.name) return node.name
  // trigger from payload.json doesn't have name — take data.type: "Conversation Opened"
  if (node.type === 'trigger' && node.data?.type) return prettify(node.data.type)
  return meta.label
}

const describe = (node) => {
  const data = node.data ?? {}

  switch (node.type) {
    case 'trigger':
      return data.type ? `Trigger: ${data.type}` : ''

    case 'sendMessage': {
      const parts = []
      const text = (data.payload ?? []).find((part) => part.type === 'text')?.text
      if (text) parts.push(text.replace(/\s+/g, ' ').trim())
      const hasAttachment = (data.payload ?? []).some((part) => part.type === 'attachment')
      if (hasAttachment) parts.push('+ attachment')
      return parts.join(' ')
    }

    case 'dateTime': {
      const times = data.times ?? []
      if (!times.length) return data.timezone ?? ''
      const ranges = [...new Set(times.map((t) => `${t.startTime}–${t.endTime}`))]
      return `${ranges.join(', ')} · ${times.length}/7 days (${data.timezone ?? 'UTC'})`
    }

    case 'addComment':
      return data.comment ?? ''

    default:
      return ''
  }
}

const depthOf = (node, byId) => {
  let depth = 0
  const seen = new Set([String(node.id)])
  let current = node

  while (current.parentId !== -1) {
    const parent = byId.get(String(current.parentId))
    if (!parent || seen.has(String(parent.id))) break // guard from broken "links"
    seen.add(String(parent.id))
    current = parent

    // connector is edge, not node: in depth layout it's not counted
    if (!isConnector(parent)) depth += 1
  }

  return depth
}

export const toVueFlowGraph = (rawNodes) => {
  const byId = new Map(rawNodes.map((node) => [String(node.id), node]))

  const columns = new Map()
  for (const node of rawNodes) {
    if (isConnector(node)) continue

    const depth = depthOf(node, byId)
    if (!columns.has(depth)) columns.set(depth, [])
    columns.get(depth).push(node)
  }

  // Row width = number of nodes in it; center each row relative to the widest row
  const rowWidths = [...columns.values()].map(
    (row) => Math.max(0, row.length - 1) * (NODE_SIZE.width + GAP.x),
  )
  const maxRowWidth = Math.max(0, ...rowWidths)

  const nodes = []
  for (const [depth, column] of columns) {
    const rowWidth = Math.max(0, column.length - 1) * (NODE_SIZE.width + GAP.x)
    const offsetX = 50 + (maxRowWidth - rowWidth) / 2
    const offsetY = 30

    column.forEach((node, index) => {
      const meta = metaFor(node)

      nodes.push({
        id: String(node.id),
        type: 'flow-node',
        position: {
          x: offsetX + index * (NODE_SIZE.width + GAP.x),
          y: offsetY + depth * (NODE_SIZE.height + GAP.y),
        },
        data: {
          icon: meta.icon,
          title: titleForNode(node),
          description: describe(node),
        },
      })
    })
  }

  const edges = []
  for (const node of rawNodes) {
    if (node.parentId === -1 || isConnector(node)) continue

    const parent = byId.get(String(node.parentId))
    if (!parent) continue

    if (isConnector(parent)) {
      const root = byId.get(String(parent.parentId))
      if (!root) continue

      const edgeLabelStyles = getEdgeLabelStyle(parent)

      edges.push({
        id: `${String(root.id)}->${String(node.id)}`,
        source: String(root.id),
        target: String(node.id),
        type: 'step',
        label: parent.name,
        markerEnd: MarkerType.ArrowClosed,
        style: { stroke: edgeLabelStyles.bg.stroke },
        labelStyle: edgeLabelStyles.label,
        labelBgStyle: edgeLabelStyles.bg,
        labelBgPadding: [6, 4],
      })
      continue
    }

    edges.push({
      id: `${String(parent.id)}->${String(node.id)}`,
      source: String(parent.id),
      target: String(node.id),
      type: 'step',
      markerEnd: MarkerType.ArrowClosed,
    })
  }

  return { nodes, edges }
}
