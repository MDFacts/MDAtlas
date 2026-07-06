import type { PartShape } from './bodyGeometry'
import type { BodySex } from './modelConfig'

/**
 * Invisible raycast volumes tuned to the NORMALIZED REALISTIC BODIES. Rather than
 * one hand-authored set scaled between sexes (which never lined up — the two
 * models differ in height, shoulder height, and arm spread), the volumes are
 * generated per sex from LANDMARKS measured off each GLB's posed mesh
 * (see the silhouette profiling in the project history):
 *
 *   world space: feet y=0, model faces +z, body's right at −x, ×BODY_MODEL_SCALE.
 *   Both bodies stand in an A-pose with the arms spread down-and-out — the hands
 *   reach ≈±1.0 at y≈1.55, so the arm volumes follow that diagonal, not a near
 *   vertical line at the side.
 */
export interface HitRegion {
  key: string
  regionId: string
  shape: PartShape
  args: number[]
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}

/**
 * Female height (5'4") relative to male (5'10") — still used to scale the
 * PRIMITIVE organ/skeleton internals (laid out on the male envelope) for the
 * female. The hit-proxies no longer use it; they are generated per sex below.
 */
export const FEMALE_HIT_SCALE = 0.915

// Torso bands are defined by their BOUNDARY heights (world y), read off each
// rendered model with on-screen world-height reference lines and confirmed by
// reading back the hit point of real taps:
//   pecTopY   — chest top (clavicle line)
//   pecBottomY— chest ↔ upper-abdomen boundary (bottom of the pecs/breasts)
//   navelY    — upper ↔ lower abdomen boundary (the navel)
//   pubicY    — lower-abdomen ↔ pelvis boundary (the pubic bone)
//   hipBottomY— bottom of the pelvis bowl
//   genitalY  — centre of the genital volume (sits IN FRONT of the pelvis)
interface Landmarks {
  headY: number
  headR: number
  neckY: number
  shoulderY: number
  shoulderX: number
  shoulderR: number
  pecTopY: number
  pecBottomY: number
  navelY: number
  pubicY: number
  hipBottomY: number
  genitalY: number
  torsoHalfW: number
  abdHalfW: number
  torsoDepthScale: number
  pelvisHalfW: number
  groinR: number
  armShoulderX: number
  armShoulderY: number
  armHandX: number
  armHandY: number
  armR: number
  hipX: number
  legR: number
  footY: number
  legTopY: number
  backZ: number
}

// Height: male ≈3.47, female ≈3.17.
const MALE: Landmarks = {
  headY: 3.15, headR: 0.2,
  neckY: 2.92,
  shoulderY: 2.78, shoulderX: 0.42, shoulderR: 0.16,
  pecTopY: 2.75, pecBottomY: 2.35, navelY: 1.92, pubicY: 1.55, hipBottomY: 1.42, genitalY: 1.38,
  torsoHalfW: 0.3, abdHalfW: 0.27, torsoDepthScale: 0.6,
  pelvisHalfW: 0.33, groinR: 0.14,
  armShoulderX: 0.44, armShoulderY: 2.78, armHandX: 1.01, armHandY: 1.55, armR: 0.12,
  hipX: 0.18, legR: 0.135, footY: 0.05, legTopY: 1.32,
  backZ: -0.34,
}

const FEMALE: Landmarks = {
  headY: 2.92, headR: 0.18,
  neckY: 2.62,
  shoulderY: 2.55, shoulderX: 0.4, shoulderR: 0.15,
  pecTopY: 2.55, pecBottomY: 2.18, navelY: 1.82, pubicY: 1.5, hipBottomY: 1.36, genitalY: 1.29,
  torsoHalfW: 0.25, abdHalfW: 0.23, torsoDepthScale: 0.62,
  pelvisHalfW: 0.32, groinR: 0.13,
  armShoulderX: 0.42, armShoulderY: 2.46, armHandX: 1.02, armHandY: 1.56, armR: 0.115,
  hipX: 0.17, legR: 0.13, footY: 0.05, legTopY: 1.24,
  backZ: -0.32,
}

const region = (
  key: string,
  regionId: string,
  shape: PartShape,
  args: number[],
  position: [number, number, number],
  extra: Partial<HitRegion> = {},
): HitRegion => ({ key, regionId, shape, args, position, ...extra })

/** Capsule following the arm line from the shoulder point to the hand point on
 * the body's +x (left) side; `side = -1` mirrors it to the body's right. */
function armRegion(key: string, regionId: string, L: Landmarks, side: number): HitRegion {
  const sx = L.armShoulderX * side
  const hx = L.armHandX * side
  const mx = (sx + hx) / 2
  const my = (L.armShoulderY + L.armHandY) / 2
  const dx = hx - sx
  const dy = L.armHandY - L.armShoulderY
  const dist = Math.hypot(dx, dy)
  const cylLen = Math.max(0.1, dist - 2 * L.armR)
  // Capsule default axis is +Y; rotating by φ about Z aligns it to the arm line.
  const angle = Math.atan2(dx, -dy)
  return region(key, regionId, 'capsule', [L.armR, cylLen, 6, 12], [mx, my, 0], {
    rotation: [0, 0, angle],
  })
}

function legRegion(key: string, regionId: string, L: Landmarks, side: number): HitRegion {
  const midY = (L.legTopY + L.footY) / 2
  const cylLen = Math.max(0.1, L.legTopY - L.footY - 2 * L.legR)
  return region(key, regionId, 'capsule', [L.legR, cylLen, 6, 12], [L.hipX * side, midY, 0], {
    rotation: [0, 0, 0.02 * side],
  })
}

function buildRegions(L: Landmarks): HitRegion[] {
  const depth = 0.36
  const uaW = (2 * L.abdHalfW) / 3 // three quadrant boxes tile the upper-abdomen width
  const uaH = L.pecBottomY - L.navelY
  const uaY = (L.pecBottomY + L.navelY) / 2
  const laH = L.navelY - L.pubicY
  const laY = (L.navelY + L.pubicY) / 2
  const chestH = L.pecTopY - L.pecBottomY
  const chestY = (L.pecTopY + L.pecBottomY) / 2
  const pelH = L.pubicY - L.hipBottomY
  const pelY = (L.pubicY + L.hipBottomY) / 2
  return [
    region('head', 'head', 'sphere', [L.headR, 20, 16], [0, L.headY, 0], { scale: [0.85, 1, 0.9] }),
    region('neck', 'neck', 'cylinder', [0.1, 0.12, 0.22, 16], [0, L.neckY, 0]),
    // Chest: pecs/breasts down to just below them; flattened in depth.
    region('chest', 'chest', 'cylinder', [L.torsoHalfW * 0.9, L.torsoHalfW, chestH, 24], [0, chestY, 0], {
      scale: [1, 1, L.torsoDepthScale],
    }),
    // Upper abdomen: pecs → navel, split RUQ / epigastric / LUQ (tiles full width).
    region('rightUpperAbdomen', 'rightUpperAbdomen', 'box', [uaW, uaH, depth], [(-2 * L.abdHalfW) / 3, uaY, 0]),
    region('epigastric', 'epigastric', 'box', [uaW, uaH, depth], [0, uaY, 0]),
    region('leftUpperAbdomen', 'leftUpperAbdomen', 'box', [uaW, uaH, depth], [(2 * L.abdHalfW) / 3, uaY, 0]),
    // Lower abdomen: navel → pubic bone. Two boxes that MEET at the midline so a
    // centre tap never slips through to the back volume.
    region('rightLowerAbdomen', 'rightLowerAbdomen', 'box', [L.abdHalfW, laH, depth], [-L.abdHalfW / 2, laY, 0.01]),
    region('leftLowerAbdomen', 'leftLowerAbdomen', 'box', [L.abdHalfW, laH, depth], [L.abdHalfW / 2, laY, 0.01]),
    // Pelvis bowl (pubic bone → hip), SHALLOW in depth so the genitals volume in
    // front of it wins the groin tap.
    region('pelvis', 'pelvis', 'cylinder', [L.pelvisHalfW * 0.92, L.pelvisHalfW * 0.8, pelH, 24], [0, pelY, 0], {
      scale: [1, 1, 0.42],
    }),
    // Genitals: a small volume pushed well forward at the pubis so it is the
    // front-most thing there and is selected before the pelvis behind it.
    region('genitals', 'genitals', 'sphere', [L.groinR, 16, 12], [0, L.genitalY, 0.12], { scale: [1, 0.8, 0.85] }),
    region('rightShoulder', 'rightShoulder', 'sphere', [L.shoulderR, 16, 12], [-L.shoulderX, L.shoulderY, 0]),
    region('leftShoulder', 'leftShoulder', 'sphere', [L.shoulderR, 16, 12], [L.shoulderX, L.shoulderY, 0]),
    armRegion('rightArm', 'rightArm', L, -1),
    armRegion('leftArm', 'leftArm', L, 1),
    legRegion('rightLeg', 'rightLeg', L, -1),
    legRegion('leftLeg', 'leftLeg', L, 1),
    // Back volumes sit WELL behind the torso (pushed deep in −z). The front is now
    // gap-free, so a front ray always hits a front volume first and never selects
    // the back; from behind the model flips 180° and these face the camera.
    region('upperBack', 'upperBack', 'box', [L.torsoHalfW * 1.7, chestH * 1.3, 0.18], [0, chestY - 0.05, L.backZ]),
    region('lowerBack', 'lowerBack', 'box', [L.abdHalfW * 1.7, uaH + laH, 0.18], [0, (uaY + laY) / 2, L.backZ]),
  ]
}

const REGIONS_BY_SEX: Record<BodySex, HitRegion[]> = {
  male: buildRegions(MALE),
  female: buildRegions(FEMALE),
}

export function hitRegionsFor(sex: BodySex): HitRegion[] {
  return REGIONS_BY_SEX[sex]
}
