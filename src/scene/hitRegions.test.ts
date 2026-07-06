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

  it('stacks chest → upper abdomen → lower abdomen without a gap, top to bottom', () => {
    for (const sex of SEXES) {
      const regions = hitRegionsFor(sex)
      const chest = regions.find((r) => r.regionId === 'chest')!
      const epi = regions.find((r) => r.regionId === 'epigastric')!
      const lower = regions.find((r) => r.regionId === 'rightLowerAbdomen')!
      const chestBottom = chest.position[1] - chest.args[2] / 2 // cylinder height is args[2]
      const epiTop = epi.position[1] + epi.args[1] / 2
      const epiBottom = epi.position[1] - epi.args[1] / 2
      const lowerTop = lower.position[1] + lower.args[0] // sphere radius
      // Chest meets the top of the upper-abdomen band; the band meets the lower one.
      expect(Math.abs(chestBottom - epiTop)).toBeLessThan(0.06)
      expect(Math.abs(epiBottom - lowerTop)).toBeLessThan(0.12)
    }
  })

  it('keeps the genitals below the lower abdomen, at the groin', () => {
    for (const sex of SEXES) {
      const regions = hitRegionsFor(sex)
      const lower = regions.find((r) => r.regionId === 'rightLowerAbdomen')!
      const genitals = regions.find((r) => r.regionId === 'genitals')!
      expect(genitals.position[1]).toBeLessThan(lower.position[1])
    }
  })
})
