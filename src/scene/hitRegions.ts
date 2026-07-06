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

interface Landmarks {
  headY: number
  headR: number
  neckY: number
  shoulderY: number
  shoulderX: number
  shoulderR: number
  chestY: number
  chestHalfW: number
  chestHalfH: number
  torsoDepthScale: number
  upperAbdY: number
  upperAbdHalfH: number
  abdHalfW: number
  lowerAbdY: number
  lowerAbdR: number
  pelvisY: number
  pelvisHalfW: number
  pelvisHalfH: number
  groinY: number
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

// Landmarks (world units) CALIBRATED against the rendered body's surface anatomy
// (read off each model with on-screen world-height reference lines), so each band
// lands on the visible feature Nathan named: chest ends just below the pecs/bust,
// upper abs end at the navel, lower abs end at the pubic bone, and the genitals
// sit AT the pubis. Height: male ≈3.47, female ≈3.17.
//   MALE surface: shoulders 2.75 · pec-bottom 2.28 · navel 1.88 · pubis 1.42 · crotch 1.30
//   FEMALE surface: shoulders 2.55 · bust-bottom 2.18 · navel 1.80 · pubis 1.38 · crotch 1.26
const MALE: Landmarks = {
  headY: 3.15, headR: 0.2,
  neckY: 2.92,
  shoulderY: 2.78, shoulderX: 0.42, shoulderR: 0.16,
  chestY: 2.52, chestHalfW: 0.3, chestHalfH: 0.24, torsoDepthScale: 0.6,
  upperAbdY: 2.08, upperAbdHalfH: 0.2, abdHalfW: 0.27,
  lowerAbdY: 1.68, lowerAbdR: 0.2,
  pelvisY: 1.55, pelvisHalfW: 0.33, pelvisHalfH: 0.14,
  groinY: 1.4, groinR: 0.13,
  armShoulderX: 0.44, armShoulderY: 2.78, armHandX: 1.01, armHandY: 1.55, armR: 0.12,
  hipX: 0.18, legR: 0.135, footY: 0.05, legTopY: 1.32,
  backZ: -0.3,
}

const FEMALE: Landmarks = {
  headY: 2.92, headR: 0.18,
  neckY: 2.62,
  shoulderY: 2.55, shoulderX: 0.4, shoulderR: 0.15,
  chestY: 2.37, chestHalfW: 0.25, chestHalfH: 0.2, torsoDepthScale: 0.62,
  upperAbdY: 1.99, upperAbdHalfH: 0.19, abdHalfW: 0.23,
  lowerAbdY: 1.61, lowerAbdR: 0.19,
  pelvisY: 1.48, pelvisHalfW: 0.32, pelvisHalfH: 0.14,
  groinY: 1.36, groinR: 0.12,
  armShoulderX: 0.42, armShoulderY: 2.46, armHandX: 1.02, armHandY: 1.56, armR: 0.115,
  hipX: 0.17, legR: 0.13, footY: 0.05, legTopY: 1.24,
  backZ: -0.28,
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
  const abdW = (2 * L.abdHalfW) / 3 // three quadrant boxes tile the abdomen width
  const abdDepth = 0.36
  const abdH = 2 * L.upperAbdHalfH
  return [
    region('head', 'head', 'sphere', [L.headR, 20, 16], [0, L.headY, 0], { scale: [0.85, 1, 0.9] }),
    region('neck', 'neck', 'cylinder', [0.1, 0.12, 0.22, 16], [0, L.neckY, 0]),
    // Chest: solar plexus up to the clavicles; flattened in depth.
    region('chest', 'chest', 'cylinder', [L.chestHalfW * 0.9, L.chestHalfW, L.chestHalfH * 2, 24], [0, L.chestY, 0], {
      scale: [1, 1, L.torsoDepthScale],
    }),
    // Upper abdomen: a SHORT band (solar plexus → navel) split RUQ / epigastric / LUQ.
    region('rightUpperAbdomen', 'rightUpperAbdomen', 'box', [abdW, abdH, abdDepth], [(-2 * L.abdHalfW) / 3, L.upperAbdY, 0]),
    region('epigastric', 'epigastric', 'box', [abdW, abdH, abdDepth], [0, L.upperAbdY, 0]),
    region('leftUpperAbdomen', 'leftUpperAbdomen', 'box', [abdW, abdH, abdDepth], [(2 * L.abdHalfW) / 3, L.upperAbdY, 0]),
    // Lower abdomen: navel → pelvis, two iliac-fossa bulbs.
    region('rightLowerAbdomen', 'rightLowerAbdomen', 'sphere', [L.lowerAbdR, 16, 12], [-L.abdHalfW * 0.6, L.lowerAbdY, 0.03], {
      scale: [1, 1, 0.6],
    }),
    region('leftLowerAbdomen', 'leftLowerAbdomen', 'sphere', [L.lowerAbdR, 16, 12], [L.abdHalfW * 0.6, L.lowerAbdY, 0.03], {
      scale: [1, 1, 0.6],
    }),
    // Pelvis bowl; genitals = a small volume at the pubis (front, at the groin).
    region('pelvis', 'pelvis', 'cylinder', [L.pelvisHalfW * 0.92, L.pelvisHalfW * 0.82, L.pelvisHalfH * 2, 24], [0, L.pelvisY, 0], {
      scale: [1, 1, 0.62],
    }),
    region('genitals', 'genitals', 'sphere', [L.groinR, 16, 12], [0, L.groinY, 0.06], { scale: [1, 0.8, 0.7] }),
    region('rightShoulder', 'rightShoulder', 'sphere', [L.shoulderR, 16, 12], [-L.shoulderX, L.shoulderY, 0]),
    region('leftShoulder', 'leftShoulder', 'sphere', [L.shoulderR, 16, 12], [L.shoulderX, L.shoulderY, 0]),
    armRegion('rightArm', 'rightArm', L, -1),
    armRegion('leftArm', 'leftArm', L, 1),
    legRegion('rightLeg', 'rightLeg', L, -1),
    legRegion('leftLeg', 'leftLeg', L, 1),
    // Back volumes sit WELL behind the torso (narrower than the body and pushed
    // deep in −z) so a front ray always reaches a front volume first and never
    // selects the back; from behind the model flips 180° and they face the camera.
    region('upperBack', 'upperBack', 'box', [L.chestHalfW * 1.7, L.chestHalfH * 2.2, 0.18], [0, L.chestY - 0.05, L.backZ]),
    region('lowerBack', 'lowerBack', 'box', [L.abdHalfW * 1.7, (L.chestY - L.pelvisY) * 0.6, 0.18], [0, (L.upperAbdY + L.lowerAbdY) / 2, L.backZ]),
  ]
}

const REGIONS_BY_SEX: Record<BodySex, HitRegion[]> = {
  male: buildRegions(MALE),
  female: buildRegions(FEMALE),
}

export function hitRegionsFor(sex: BodySex): HitRegion[] {
  return REGIONS_BY_SEX[sex]
}
