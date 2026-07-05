import type { PartShape } from './bodyGeometry'

/**
 * Invisible raycast volumes tuned to the NORMALIZED REALISTIC BODIES (not the
 * procedural fallback — that keeps its own layout in bodyGeometry.ts).
 *
 * Coordinates assume the male model: 5'10" (≈1.78 m) × BODY_MODEL_SCALE (1.95)
 * ≈ 3.47 world units tall, feet at y=0, A-pose arms ≈35° off vertical, facing
 * +z, body's right side at −x. The female (5'4") reuses the same volumes under
 * a FEMALE_HIT_SCALE group scale.
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

/** Female height (5'4") relative to male (5'10") — scales the proxy group. */
export const FEMALE_HIT_SCALE = 0.915

const region = (
  key: string,
  regionId: string,
  shape: PartShape,
  args: number[],
  position: [number, number, number],
  extra: Partial<HitRegion> = {},
): HitRegion => ({ key, regionId, shape, args, position, ...extra })

const ARM_TILT = 0.3 // A-pose: ~17° off vertical (measured against the male model)

export const HIT_REGIONS: HitRegion[] = [
  region('head', 'head', 'sphere', [0.26, 20, 16], [0, 3.24, 0], { scale: [0.8, 1, 0.9] }),
  region('neck', 'neck', 'cylinder', [0.1, 0.12, 0.22, 16], [0, 2.98, 0]),
  // Chest ends at the solar plexus (xiphoid ≈ y 2.50 on the male) — it must not
  // reach toward the navel; everything below is upper abdomen.
  region('chest', 'chest', 'cylinder', [0.34, 0.38, 0.42, 24], [0, 2.68, 0], {
    scale: [1, 1, 0.58],
  }),
  // Solar plexus down to the navel, tiled into RUQ / epigastric / LUQ. Bottoms
  // overlap the lower-abdomen volumes so no front ray slips through to the back
  // regions. Body's right side is −x.
  region('rightUpperAbdomen', 'rightUpperAbdomen', 'box', [0.24, 0.45, 0.36], [-0.2, 2.27, 0]),
  region('epigastric', 'epigastric', 'box', [0.2, 0.45, 0.36], [0, 2.27, 0]),
  region('leftUpperAbdomen', 'leftUpperAbdomen', 'box', [0.24, 0.45, 0.36], [0.2, 2.27, 0]),
  region('rightLowerAbdomen', 'rightLowerAbdomen', 'sphere', [0.19, 16, 12], [-0.14, 1.9, 0.04], {
    scale: [1, 1, 0.55],
  }),
  region('leftLowerAbdomen', 'leftLowerAbdomen', 'sphere', [0.19, 16, 12], [0.14, 1.9, 0.04], {
    scale: [1, 1, 0.55],
  }),
  // Pelvis = the lower-abdomen/hip bowl; genitals = the groin below the pubic
  // bone (a distinct zone).
  region('pelvis', 'pelvis', 'cylinder', [0.3, 0.26, 0.26, 24], [0, 1.67, 0], {
    scale: [1, 1, 0.6],
  }),
  region('genitals', 'genitals', 'sphere', [0.12, 16, 12], [0, 1.43, 0.05], {
    scale: [1, 0.85, 0.7],
  }),
  region('rightShoulder', 'rightShoulder', 'sphere', [0.17, 16, 12], [-0.38, 2.8, 0]),
  region('leftShoulder', 'leftShoulder', 'sphere', [0.17, 16, 12], [0.38, 2.8, 0]),
  region('rightArm', 'rightArm', 'capsule', [0.1, 1.45, 6, 12], [-0.55, 1.98, 0], {
    rotation: [0, 0, -ARM_TILT],
  }),
  region('leftArm', 'leftArm', 'capsule', [0.1, 1.45, 6, 12], [0.55, 1.98, 0], {
    rotation: [0, 0, ARM_TILT],
  }),
  region('rightLeg', 'rightLeg', 'capsule', [0.13, 1.4, 6, 12], [-0.16, 0.8, 0], {
    rotation: [0, 0, 0.02],
  }),
  region('leftLeg', 'leftLeg', 'capsule', [0.13, 1.4, 6, 12], [0.16, 0.8, 0], {
    rotation: [0, 0, -0.02],
  }),
  // Back volumes sit proud of the torso depth so rays from the back view always
  // reach them before the front torso volumes.
  region('upperBack', 'upperBack', 'box', [0.62, 0.6, 0.2], [0, 2.55, -0.24]),
  region('lowerBack', 'lowerBack', 'box', [0.46, 0.52, 0.2], [0, 1.97, -0.22]),
]
