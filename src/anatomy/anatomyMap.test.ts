import { describe, expect, it } from 'vitest'
import { CONTENT_PACKS } from '../clinical/packs/index'
import { ANATOMY_MAP } from './anatomyMap'

describe('anatomyMap', () => {
  it('contains every region that has a content pack', () => {
    for (const regionId of Object.keys(CONTENT_PACKS)) {
      expect(ANATOMY_MAP[regionId], `region ${regionId} missing from anatomy map`).toBeDefined()
    }
  })

  it('keys match regionId fields', () => {
    for (const [key, entry] of Object.entries(ANATOMY_MAP)) {
      expect(entry.regionId).toBe(key)
    }
  })

  it('every region has all three layers defined', () => {
    for (const entry of Object.values(ANATOMY_MAP)) {
      expect(Object.keys(entry.structuresByLayer).sort()).toEqual(['organs', 'skeleton', 'skin'])
    }
  })
})
