import { describe, expect, it } from 'vitest'
import { ANATOMY_MAP } from '../anatomy/anatomyMap'
import { classifyRegion, REGION_BOUNDS } from './regionClassifier'

const SEXES = ['male', 'female'] as const

// A front-surface point on the midline at a given height.
const front = (y: number) => ({ x: 0, y, z: 0.15 })

describe('classifyRegion', () => {
  it('maps the front midline top-to-bottom into the expected zones', () => {
    for (const sex of SEXES) {
      const B = REGION_BOUNDS[sex]
      expect(classifyRegion(front(B.neckTop + 0.15), sex)).toBe('head')
      expect(classifyRegion(front((B.neckTop + B.shoulderTop) / 2), sex)).toBe('neck')
      expect(classifyRegion(front((B.shoulderTop + B.pecBottom) / 2), sex)).toBe('chest')
      expect(classifyRegion(front((B.pecBottom + B.navel) / 2), sex)).toBe('epigastric')
      expect(classifyRegion(front((B.navel + B.pelvisTop) / 2), sex)).toBe('rightLowerAbdomen')
      // Pelvis is a real band (iliac line → pubic bone), not a sliver.
      expect(classifyRegion(front((B.pelvisTop + B.pubic) / 2), sex)).toBe('pelvis')
      expect(B.pelvisTop - B.pubic).toBeGreaterThanOrEqual(0.1)
      // Genital band on the front midline.
      expect(classifyRegion(front((B.genitalTop + B.genitalBottom) / 2), sex)).toBe('genitals')
    }
  })

  it('never returns a back region for a front-facing tap', () => {
    for (const sex of SEXES) {
      const B = REGION_BOUNDS[sex]
      for (let y = B.crotch; y < B.shoulderTop; y += 0.05) {
        const region = classifyRegion(front(y), sex)
        expect(region).not.toBe('lowerBack')
        expect(region).not.toBe('upperBack')
      }
    }
  })

  it('sends the inner upper arm to the arm, not the chest', () => {
    for (const sex of SEXES) {
      const B = REGION_BOUNDS[sex]
      const y = (B.shoulderTop + B.pecBottom) / 2
      // Just lateral of the armpit crease = arm territory.
      expect(classifyRegion({ x: B.armMinX + 0.02, y, z: 0.05 }, sex)).toBe('leftArm')
      expect(classifyRegion({ x: -(B.armMinX + 0.02), y, z: 0.05 }, sex)).toBe('rightArm')
      // Just medial of it stays chest.
      expect(classifyRegion({ x: B.armMinX - 0.04, y, z: 0.05 }, sex)).toBe('chest')
    }
  })

  it('keeps the armpit / torso side out of the back regions', () => {
    for (const sex of SEXES) {
      const B = REGION_BOUNDS[sex]
      // Lateral chest surface at the armpit curves behind the z-centroid but
      // must read as chest, never upper back.
      const armpit = { x: B.armMinX - 0.05, y: (B.shoulderTop + B.pecBottom) / 2, z: -0.2 }
      expect(classifyRegion(armpit, sex)).toBe('chest')
      expect(classifyRegion({ ...armpit, x: -armpit.x }, sex)).toBe('chest')
    }
  })

  it('classifies the back surface as back regions', () => {
    for (const sex of SEXES) {
      const B = REGION_BOUNDS[sex]
      const back = (y: number) => ({ x: 0, y, z: -0.25 })
      expect(classifyRegion(back((B.shoulderTop + B.pecBottom) / 2), sex)).toBe('upperBack')
      expect(classifyRegion(back((B.navel + B.pubic) / 2), sex)).toBe('lowerBack')
    }
  })

  it('splits the upper abdomen into RUQ / epigastric / LUQ (body right is −x)', () => {
    for (const sex of SEXES) {
      const B = REGION_BOUNDS[sex]
      const y = (B.pecBottom + B.navel) / 2
      expect(classifyRegion({ x: -0.15, y, z: 0.15 }, sex)).toBe('rightUpperAbdomen')
      expect(classifyRegion({ x: 0, y, z: 0.15 }, sex)).toBe('epigastric')
      expect(classifyRegion({ x: 0.15, y, z: 0.15 }, sex)).toBe('leftUpperAbdomen')
    }
  })

  it('sends lateral points below the shoulder to the arms, and the crotch to the legs', () => {
    for (const sex of SEXES) {
      const B = REGION_BOUNDS[sex]
      expect(classifyRegion({ x: -0.6, y: 2.0, z: 0 }, sex)).toBe('rightArm')
      expect(classifyRegion({ x: 0.6, y: 2.0, z: 0 }, sex)).toBe('leftArm')
      expect(classifyRegion({ x: -0.18, y: B.crotch - 0.2, z: 0.05 }, sex)).toBe('rightLeg')
      expect(classifyRegion({ x: 0.18, y: B.crotch - 0.2, z: 0.05 }, sex)).toBe('leftLeg')
    }
  })

  it('only ever returns regions that exist in the anatomy map', () => {
    for (const sex of SEXES) {
      for (let y = 0.1; y < 3.4; y += 0.1) {
        for (const x of [-0.6, -0.15, 0, 0.15, 0.6]) {
          for (const z of [0.15, -0.25]) {
            expect(ANATOMY_MAP[classifyRegion({ x, y, z }, sex)]).toBeDefined()
          }
        }
      }
    }
  })
})
