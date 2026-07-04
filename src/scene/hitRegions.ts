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
  region('chest', 'chest', 'cylinder', [0.34, 0.38, 0.58, 24], [0, 2.56, 0], {
    scale: [1, 1, 0.58],
  }),
  region('upperAbdomen', 'upperAbdomen', 'cylinder', [0.28, 0.32, 0.4, 24], [0, 2.1, 0], {
    scale: [1, 1, 0.55],
  }),
  region('rightLowerAbdomen', 'rightLowerAbdomen', 'sphere', [0.19, 16, 12], [-0.14, 1.8, 0.04], {
    scale: [1, 0.85, 0.55],
  }),
  region('leftLowerAbdomen', 'leftLowerAbdomen', 'sphere', [0.19, 16, 12], [0.14, 1.8, 0.04], {
    scale: [1, 0.85, 0.55],
  }),
  region('pelvis', 'pelvis', 'cylinder', [0.3, 0.26, 0.36, 24], [0, 1.6, 0], {
    scale: [1, 1, 0.6],
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
  region('upperBack', 'upperBack', 'box', [0.62, 0.6, 0.14], [0, 2.55, -0.16]),
  region('lowerBack', 'lowerBack', 'box', [0.46, 0.5, 0.12], [0, 1.98, -0.14]),
]
