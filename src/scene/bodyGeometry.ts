import type { AnatomyLayer } from '../anatomy/anatomyMap'

export type PartShape = 'sphere' | 'cylinder' | 'capsule' | 'box' | 'torus'

export interface BodyPart {
  key: string
  regionId: string
  layer: AnatomyLayer
  shape: PartShape
  /** Geometry args in three.js constructor order for the shape. */
  args: number[]
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  color: string
}

const SKIN = '#c9d4e4'
const BONE = '#e8e4d8'

const skin = (
  key: string,
  regionId: string,
  shape: PartShape,
  args: number[],
  position: [number, number, number],
  extra: Partial<BodyPart> = {},
): BodyPart => ({ key, regionId, layer: 'skin', shape, args, position, color: SKIN, ...extra })

const bone = (
  key: string,
  regionId: string,
  shape: PartShape,
  args: number[],
  position: [number, number, number],
  extra: Partial<BodyPart> = {},
): BodyPart => ({ key, regionId, layer: 'skeleton', shape, args, position, color: BONE, ...extra })

const organ = (
  key: string,
  regionId: string,
  shape: PartShape,
  args: number[],
  position: [number, number, number],
  color: string,
  extra: Partial<BodyPart> = {},
): BodyPart => ({ key, regionId, layer: 'organs', shape, args, position, color, ...extra })

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

  // --- Skeleton layer ---
  bone('skull', 'head', 'sphere', [0.21, 24, 18], [0, 3.12, 0], { scale: [0.85, 1, 0.9] }),
  bone('cervicalSpine', 'neck', 'cylinder', [0.045, 0.045, 0.3, 12], [0, 2.86, -0.03]),
  bone('spine', 'upperBack', 'cylinder', [0.05, 0.05, 1.5, 12], [0, 2.05, -0.08]),
  bone('ribs1', 'chest', 'torus', [0.3, 0.025, 10, 32], [0, 2.62, 0], {
    rotation: [Math.PI / 2, 0, 0],
    scale: [1, 1, 0.62],
  }),
  bone('ribs2', 'chest', 'torus', [0.33, 0.025, 10, 32], [0, 2.48, 0], {
    rotation: [Math.PI / 2, 0, 0],
    scale: [1, 1, 0.62],
  }),
  bone('ribs3', 'chest', 'torus', [0.34, 0.025, 10, 32], [0, 2.34, 0], {
    rotation: [Math.PI / 2, 0, 0],
    scale: [1, 1, 0.62],
  }),
  bone('rightClavicle', 'rightShoulder', 'cylinder', [0.03, 0.03, 0.42, 10], [-0.24, 2.7, 0.05], {
    rotation: [0, 0, 1.45],
  }),
  bone('leftClavicle', 'leftShoulder', 'cylinder', [0.03, 0.03, 0.42, 10], [0.24, 2.7, 0.05], {
    rotation: [0, 0, -1.45],
  }),
  bone('pelvisBone', 'pelvis', 'sphere', [0.27, 20, 16], [0, 1.38, 0], { scale: [1.1, 0.7, 0.7] }),
  bone('rightHumerus', 'rightArm', 'cylinder', [0.04, 0.04, 1.0, 10], [-0.62, 2.02, 0], {
    rotation: [0, 0, -0.09],
  }),
  bone('leftHumerus', 'leftArm', 'cylinder', [0.04, 0.04, 1.0, 10], [0.62, 2.02, 0], {
    rotation: [0, 0, 0.09],
  }),
  bone('rightFemur', 'rightLeg', 'cylinder', [0.05, 0.05, 1.2, 10], [-0.18, 0.62, 0]),
  bone('leftFemur', 'leftLeg', 'cylinder', [0.05, 0.05, 1.2, 10], [0.18, 0.62, 0]),

  // --- Organs layer ---
  organ('heart', 'chest', 'sphere', [0.13, 20, 16], [0.07, 2.44, 0.06], '#c0392b', {
    scale: [0.9, 1.1, 0.9],
  }),
  organ('rightLung', 'chest', 'capsule', [0.12, 0.26, 6, 12], [-0.19, 2.5, 0], '#d98a8a'),
  organ('leftLung', 'chest', 'capsule', [0.1, 0.24, 6, 12], [0.21, 2.5, 0], '#d98a8a'),
  organ('liver', 'upperAbdomen', 'sphere', [0.16, 20, 16], [-0.13, 2.02, 0.04], '#8e4a2f', {
    scale: [1.15, 0.75, 0.75],
  }),
  organ('stomach', 'upperAbdomen', 'sphere', [0.12, 20, 16], [0.12, 2.04, 0.05], '#d9a066', {
    scale: [1, 0.8, 0.8],
  }),
  organ('intestines', 'upperAbdomen', 'torus', [0.17, 0.07, 10, 24], [0, 1.72, 0.04], '#c98a6b', {
    rotation: [Math.PI / 2, 0, 0],
  }),
  organ('appendix', 'rightLowerAbdomen', 'capsule', [0.03, 0.08, 4, 8], [-0.17, 1.56, 0.07], '#b5651d', {
    rotation: [0, 0, 0.7],
  }),
  organ('cecum', 'rightLowerAbdomen', 'sphere', [0.09, 16, 12], [-0.14, 1.64, 0.03], '#c98a6b'),
  organ('sigmoid', 'leftLowerAbdomen', 'sphere', [0.09, 16, 12], [0.14, 1.64, 0.03], '#c98a6b'),
  organ('bladder', 'pelvis', 'sphere', [0.1, 16, 12], [0, 1.34, 0.08], '#e0c068'),
  organ('rightKidney', 'lowerBack', 'capsule', [0.06, 0.1, 6, 10], [-0.15, 1.95, -0.14], '#7d3c3c'),
  organ('leftKidney', 'lowerBack', 'capsule', [0.06, 0.1, 6, 10], [0.15, 1.95, -0.14], '#7d3c3c'),
]

export function partsForLayer(layer: AnatomyLayer): BodyPart[] {
  return BODY_PARTS.filter((part) => part.layer === layer)
}
