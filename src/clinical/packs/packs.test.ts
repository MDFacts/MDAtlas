import { describe, expect, it } from 'vitest'
import { contentPackSchema } from '../contentPackSchema'
import type { ContentPack } from '../types'
import { CONTENT_PACKS } from './index'

function walkPaths(pack: ContentPack): { maxDepth: number; visited: Set<string> } {
  const visited = new Set<string>()
  let maxDepth = 0

  function walk(nodeId: string | null, depth: number, seen: readonly string[]): void {
    if (nodeId === null) {
      maxDepth = Math.max(maxDepth, depth)
      return
    }
    if (seen.includes(nodeId)) {
      throw new Error(`Cycle detected at node "${nodeId}"`)
    }
    visited.add(nodeId)
    const node = pack.nodes[nodeId]
    for (const target of Object.values(node.next)) {
      walk(target, depth + 1, [...seen, nodeId])
    }
  }

  walk(pack.entryNodeId, 0, [])
  return { maxDepth, visited }
}

describe.each(Object.entries(CONTENT_PACKS))('content pack: %s', (regionId, pack) => {
  it('parses through the schema', () => {
    expect(() => contentPackSchema.parse(pack)).not.toThrow()
  })

  it('matches its registry key', () => {
    expect(pack.regionId).toBe(regionId)
  })

  it('has no cycles and every path asks at most 8 questions', () => {
    const { maxDepth } = walkPaths(pack)
    expect(maxDepth).toBeGreaterThanOrEqual(3)
    expect(maxDepth).toBeLessThanOrEqual(8)
  })

  it('reaches every node from the entry node', () => {
    const { visited } = walkPaths(pack)
    expect([...visited].sort()).toEqual(Object.keys(pack.nodes).sort())
  })

  it('has at least 4 differentials, each with at least one support', () => {
    expect(pack.differentials.length).toBeGreaterThanOrEqual(4)
    for (const differential of pack.differentials) {
      expect(Object.keys(differential.supports).length).toBeGreaterThan(0)
    }
  })

  it('has at least one emergency-tier red flag', () => {
    expect(pack.redFlags.some((flag) => flag.tier === 'emergency')).toBe(true)
  })
})
