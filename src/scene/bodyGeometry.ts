import type { AnatomyLayer } from '../anatomy/anatomyMap'

export type PartShape = 'sphere' | 'cylinder' | 'capsule' | 'box' | 'torus' | 'tube'

export interface BodyPart {
  key: string
  regionId: string
  layer: AnatomyLayer
  shape: PartShape
  /** Geometry args in three.js constructor order for the shape. For 'tube':
   * [tubularSegments, radius, radialSegments]. */
  args: number[]
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  color: string
  /** Human-readable name shown on hover (organs/skeleton layers). */
  label?: string
  /** Control points for a 'tube' shape — a smooth spline is fit through them. */
  points?: [number, number, number][]
}

const SKIN = '#c9d4e4'

const skin = (
  key: string,
  regionId: string,
  shape: PartShape,
  args: number[],
  position: [number, number, number],
  extra: Partial<BodyPart> = {},
): BodyPart => ({ key, regionId, layer: 'skin', shape, args, position, color: SKIN, ...extra })

export const BODY_PARTS: BodyPart[] = [
  // --- Skin layer (body's right side is negative x; model faces +z) ---
  skin('head', 'head', 'sphere', [0.28, 32, 24], [0, 3.12, 0], { scale: [0.85, 1, 0.9] }),
  skin('neck', 'neck', 'cylinder', [0.1, 0.12, 0.24, 20], [0, 2.86, 0]),
  skin('chest', 'chest', 'cylinder', [0.34, 0.39, 0.58, 28], [0, 2.48, 0], {
    scale: [1, 1, 0.62],
  }),
  skin('upperAbdomen', 'upperAbdomen', 'cylinder', [0.3, 0.33, 0.4, 28], [0, 2.0, 0], {
    scale: [1, 1, 0.6],
  }),
  skin('rightLowerAbdomen', 'rightLowerAbdomen', 'sphere', [0.2, 24, 18], [-0.14, 1.66, 0.02], {
    scale: [1, 0.85, 0.6],
  }),
  skin('leftLowerAbdomen', 'leftLowerAbdomen', 'sphere', [0.2, 24, 18], [0.14, 1.66, 0.02], {
    scale: [1, 0.85, 0.6],
  }),
  skin('pelvis', 'pelvis', 'cylinder', [0.31, 0.26, 0.36, 28], [0, 1.36, 0], {
    scale: [1, 1, 0.65],
  }),
  skin('rightShoulder', 'rightShoulder', 'sphere', [0.16, 24, 18], [-0.47, 2.68, 0]),
  skin('leftShoulder', 'leftShoulder', 'sphere', [0.16, 24, 18], [0.47, 2.68, 0]),
  skin('rightArm', 'rightArm', 'capsule', [0.1, 1.0, 8, 16], [-0.62, 2.02, 0], {
    rotation: [0, 0, -0.09],
  }),
  skin('leftArm', 'leftArm', 'capsule', [0.1, 1.0, 8, 16], [0.62, 2.02, 0], {
    rotation: [0, 0, 0.09],
  }),
  skin('rightLeg', 'rightLeg', 'capsule', [0.135, 1.2, 8, 16], [-0.18, 0.62, 0]),
  skin('leftLeg', 'leftLeg', 'capsule', [0.135, 1.2, 8, 16], [0.18, 0.62, 0]),
  skin('upperBack', 'upperBack', 'box', [0.6, 0.52, 0.1], [0, 2.48, -0.2]),
  skin('lowerBack', 'lowerBack', 'box', [0.48, 0.5, 0.1], [0, 1.8, -0.17]),

]
