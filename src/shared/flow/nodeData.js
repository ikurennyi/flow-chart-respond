import { toRaw } from 'vue'

/** Plain copy of node `data` (Pinia/reactive-safe; payload is JSON-serializable). */
export function cloneNodeData(value) {
  return JSON.parse(JSON.stringify(toRaw(value ?? {})))
}
