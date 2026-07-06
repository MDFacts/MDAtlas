import { describe, expect, it } from 'vitest'
import { ANATOMY_MAP } from '../anatomy/anatomyMap'
import { hitRegionsFor } from './hitRegions'

const SEXES = ['male', 'female'] as const

describe('hitRegionsFor', () => {
  it('covers every anatomy region for both sexes', () => {
    for (const sex of SEXES) {
      const ids = new Set(hitRegionsFor(sex).map((r) => r.regionId))
      for (const regionId of Object.keys(ANATOMY_MAP)) {
        expect(ids, `${sex} missing ${regionId}`).toContain(regionId)
      }
    }
  })

  it('places the genitals at (or above) the groin, not dangling below the pelvis', () => {
    for (const sex of SEXES) {
      const regions = hitRegionsFor(sex)
      const pelvis = regions.find((r) => r.regionId === 'pelvis')!
      const genitals = regions.find((r) => r.regionId === 'genitals')!
      // genitals sit just below the pelvis centre, never far beneath it
      expect(genitals.position[1]).toBeLessThan(pelvis.position[1])
      expect(pelvis.position[1] - genitals.position[1]).toBeLessThan(0.32)
    }
  })

  it('routes the arm volumes along the A-pose diagonal (tilted, reaching outward)', () => {
    for (const sex of SEXES) {
      const arm = hitRegionsFor(sex).find((r) => r.regionId === 'leftArm')!
      // A meaningful outward tilt (not a near-vertical capsule at the side).
      expect(Math.abs(arm.rotation?.[2] ?? 0)).toBeGreaterThan(0.3)
      // Centre sits well lateral of the shoulder line, toward the hand.
      expect(arm.position[0]).toBeGreaterThan(0.5)
    }
  })

  it('keeps the upper-abdomen band short (shorter than it is wide across the trio)', () => {
    for (const sex of SEXES) {
      const epi = hitRegionsFor(sex).find((r) => r.regionId === 'epigastric')!
      const height = epi.args[1] // box [w, h, d]
      expect(height).toBeLessThan(0.32)
    }
  })
})
