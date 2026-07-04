import type { BodyPart } from './bodyGeometry'

/**
 * Skeleton and organ parts aligned to the NORMALIZED REALISTIC BODIES
 * (male 5'10" × BODY_MODEL_SCALE ≈ 3.47 world units, feet y=0, facing +z,
 * body's right at −x). Landmarks follow the hit-region calibration:
 * shoulders ±0.38 @ y2.80, chest band 2.47–2.89, solar plexus 2.50,
 * navel 2.06, pelvis ≈1.6, hips ±0.17.
 *
 * Shapes are stylized-but-correct: right anatomy in the right place at the
 * right size, readable at a glance — not a medical-grade mesh (that arrives
 * when a layered anatomy model is licensed).
 */

const BONE = '#e8e4d8'

const bone = (
  key: string,
  regionId: string,
  shape: BodyPart['shape'],
  args: number[],
  position: [number, number, number],
  extra: Partial<BodyPart> = {},
): BodyPart => ({ key, regionId, layer: 'skeleton', shape, args, position, color: BONE, ...extra })

const organ = (
  key: string,
  regionId: string,
  shape: BodyPart['shape'],
  args: number[],
  position: [number, number, number],
  color: string,
  extra: Partial<BodyPart> = {},
): BodyPart => ({ key, regionId, layer: 'organs', shape, args, position, color, ...extra })

// --- Vertebral column: cervical → lumbar, posterior of the midline ---
const vertebrae: BodyPart[] = []
for (let i = 0; i < 14; i += 1) {
  const y = 2.98 - i * 0.095
  const radius = i < 3 ? 0.035 : i < 10 ? 0.045 : 0.055
  vertebrae.push(
    bone(`vertebra-${i}`, i < 3 ? 'neck' : i < 10 ? 'upperBack' : 'lowerBack', 'cylinder', [radius, radius, 0.06, 10], [0, y, -0.07]),
  )
}

// --- Ribcage: 7 visible rib pairs forming a barrel, sloping slightly forward-down ---
const ribs: BodyPart[] = []
const RIB_RADII = [0.23, 0.27, 0.3, 0.32, 0.33, 0.32, 0.29]
for (let i = 0; i < RIB_RADII.length; i += 1) {
  ribs.push(
    bone(`rib-${i}`, 'chest', 'torus', [RIB_RADII[i], 0.017, 8, 36], [0, 2.82 - i * 0.073, -0.02], {
      rotation: [Math.PI / 2 + 0.09, 0, 0],
      scale: [1, 1, 0.62],
    }),
  )
}

export const SKELETON_PARTS: BodyPart[] = [
  // Skull + jaw
  bone('skull', 'head', 'sphere', [0.195, 24, 18], [0, 3.28, 0], { scale: [0.82, 0.95, 0.9] }),
  bone('mandible', 'head', 'box', [0.15, 0.07, 0.11], [0, 3.07, 0.04]),

  ...vertebrae,
  ...ribs,

  // Sternum closing the ribcage at the front
  bone('sternum', 'chest', 'box', [0.06, 0.42, 0.025], [0, 2.6, 0.195], { rotation: [-0.08, 0, 0] }),

  // Shoulder girdle
  bone('rightClavicle', 'rightShoulder', 'cylinder', [0.02, 0.02, 0.32, 10], [-0.19, 2.85, 0.1], {
    rotation: [0, 0, 1.35],
  }),
  bone('leftClavicle', 'leftShoulder', 'cylinder', [0.02, 0.02, 0.32, 10], [0.19, 2.85, 0.1], {
    rotation: [0, 0, -1.35],
  }),
  bone('rightScapula', 'upperBack', 'box', [0.17, 0.22, 0.025], [-0.17, 2.6, -0.19], {
    rotation: [0, -0.15, 0],
  }),
  bone('leftScapula', 'upperBack', 'box', [0.17, 0.22, 0.025], [0.17, 2.6, -0.19], {
    rotation: [0, 0.15, 0],
  }),

  // Pelvis: iliac wings, sacrum, pubic bridge
  bone('rightIliac', 'pelvis', 'sphere', [0.17, 16, 12], [-0.13, 1.6, -0.02], {
    scale: [0.6, 0.85, 0.4],
    rotation: [0, 0, 0.4],
  }),
  bone('leftIliac', 'pelvis', 'sphere', [0.17, 16, 12], [0.13, 1.6, -0.02], {
    scale: [0.6, 0.85, 0.4],
    rotation: [0, 0, -0.4],
  }),
  bone('sacrum', 'lowerBack', 'box', [0.11, 0.2, 0.05], [0, 1.56, -0.09], { rotation: [0.15, 0, 0] }),
  bone('pubis', 'pelvis', 'box', [0.14, 0.05, 0.04], [0, 1.44, 0.1]),

  // Arms (A-pose ≈17° out): humerus → elbow → radius/ulna → hand
  bone('rightHumerusHead', 'rightShoulder', 'sphere', [0.05, 12, 10], [-0.38, 2.78, 0]),
  bone('leftHumerusHead', 'leftShoulder', 'sphere', [0.05, 12, 10], [0.38, 2.78, 0]),
  bone('rightHumerus', 'rightArm', 'cylinder', [0.035, 0.04, 0.62, 10], [-0.47, 2.5, 0], {
    rotation: [0, 0, -0.3],
  }),
  bone('leftHumerus', 'leftArm', 'cylinder', [0.035, 0.04, 0.62, 10], [0.47, 2.5, 0], {
    rotation: [0, 0, 0.3],
  }),
  bone('rightElbow', 'rightArm', 'sphere', [0.042, 12, 10], [-0.56, 2.21, 0]),
  bone('leftElbow', 'leftArm', 'sphere', [0.042, 12, 10], [0.56, 2.21, 0]),
  bone('rightRadius', 'rightArm', 'cylinder', [0.022, 0.026, 0.58, 8], [-0.645, 1.93, 0.02], {
    rotation: [0, 0, -0.3],
  }),
  bone('rightUlna', 'rightArm', 'cylinder', [0.018, 0.022, 0.58, 8], [-0.655, 1.92, -0.02], {
    rotation: [0, 0, -0.3],
  }),
  bone('leftRadius', 'leftArm', 'cylinder', [0.022, 0.026, 0.58, 8], [0.645, 1.93, 0.02], {
    rotation: [0, 0, 0.3],
  }),
  bone('leftUlna', 'leftArm', 'cylinder', [0.018, 0.022, 0.58, 8], [0.655, 1.92, -0.02], {
    rotation: [0, 0, 0.3],
  }),
  bone('rightHand', 'rightArm', 'box', [0.06, 0.14, 0.03], [-0.74, 1.6, 0], {
    rotation: [0, 0, -0.3],
  }),
  bone('leftHand', 'leftArm', 'box', [0.06, 0.14, 0.03], [0.74, 1.6, 0], {
    rotation: [0, 0, 0.3],
  }),

  // Legs: femur → knee → tibia/fibula → foot
  bone('rightFemurHead', 'pelvis', 'sphere', [0.045, 12, 10], [-0.16, 1.56, 0]),
  bone('leftFemurHead', 'pelvis', 'sphere', [0.045, 12, 10], [0.16, 1.56, 0]),
  bone('rightFemur', 'rightLeg', 'cylinder', [0.04, 0.046, 0.62, 10], [-0.175, 1.24, 0], {
    rotation: [0, 0, -0.03],
  }),
  bone('leftFemur', 'leftLeg', 'cylinder', [0.04, 0.046, 0.62, 10], [0.175, 1.24, 0], {
    rotation: [0, 0, 0.03],
  }),
  bone('rightPatella', 'rightLeg', 'sphere', [0.042, 12, 10], [-0.185, 0.92, 0.06]),
  bone('leftPatella', 'leftLeg', 'sphere', [0.042, 12, 10], [0.185, 0.92, 0.06]),
  bone('rightTibia', 'rightLeg', 'cylinder', [0.03, 0.036, 0.7, 10], [-0.185, 0.53, 0]),
  bone('leftTibia', 'leftLeg', 'cylinder', [0.03, 0.036, 0.7, 10], [0.185, 0.53, 0]),
  bone('rightFibula', 'rightLeg', 'cylinder', [0.016, 0.018, 0.68, 8], [-0.225, 0.53, -0.01]),
  bone('leftFibula', 'leftLeg', 'cylinder', [0.016, 0.018, 0.68, 8], [0.225, 0.53, -0.01]),
  bone('rightFoot', 'rightLeg', 'box', [0.09, 0.05, 0.24], [-0.19, 0.06, 0.07]),
  bone('leftFoot', 'leftLeg', 'box', [0.09, 0.05, 0.24], [0.19, 0.06, 0.07]),
]

// --- Small-bowel coils tucked inside the colon frame ---
const bowelCoils: BodyPart[] = [
  [-0.05, 1.82, 0.07, 0.085],
  [0.06, 1.78, 0.05, 0.075],
  [0, 1.7, 0.07, 0.08],
].map(([x, y, z, r], i) =>
  organ(`smallBowel-${i}`, 'rightLowerAbdomen', 'torus', [r, 0.042, 8, 24], [x, y, z], '#d8a07a', {
    rotation: [0.15 * (i - 1), 0, 0.5 * i],
  }),
)

export const ORGAN_PARTS: BodyPart[] = [
  organ('brain', 'head', 'sphere', [0.165, 24, 18], [0, 3.3, 0], '#c795a0', {
    scale: [0.85, 0.8, 0.95],
  }),

  // Thorax — right lung larger (liver below), heart tilted apex-down-left
  organ('rightLung', 'chest', 'capsule', [0.14, 0.34, 8, 14], [-0.2, 2.62, 0], '#d98f8f', {
    rotation: [0, 0, -0.08],
    scale: [1, 1, 0.75],
  }),
  organ('leftLung', 'chest', 'capsule', [0.125, 0.3, 8, 14], [0.21, 2.64, 0], '#d98f8f', {
    rotation: [0, 0, 0.08],
    scale: [1, 1, 0.75],
  }),
  organ('heart', 'chest', 'sphere', [0.12, 20, 16], [0.05, 2.6, 0.03], '#b03a3a', {
    scale: [0.85, 1.15, 0.85],
    rotation: [0.15, 0, 0.35],
  }),

  // Right upper quadrant
  organ('liver', 'rightUpperAbdomen', 'sphere', [0.19, 20, 16], [-0.14, 2.32, 0.02], '#7a3b28', {
    scale: [1.3, 0.6, 0.8],
    rotation: [0, 0, 0.15],
  }),
  organ('gallbladder', 'rightUpperAbdomen', 'capsule', [0.03, 0.06, 6, 10], [-0.1, 2.2, 0.13], '#4a7a3b', {
    rotation: [0.4, 0, 0.5],
  }),

  // Epigastrium
  organ('stomach', 'epigastric', 'torus', [0.09, 0.05, 10, 24, 3.6], [0.09, 2.3, 0.06], '#d9a066', {
    rotation: [0.2, 0.3, 0.7],
  }),
  organ('pancreas', 'epigastric', 'capsule', [0.035, 0.22, 6, 10], [0, 2.16, -0.03], '#d8b27a', {
    rotation: [0, 0, 1.4],
  }),

  // Left upper quadrant
  organ('spleen', 'leftUpperAbdomen', 'capsule', [0.05, 0.11, 6, 10], [0.22, 2.32, -0.06], '#6d3b52', {
    rotation: [0.3, 0, 0.5],
  }),

  // Retroperitoneum
  organ('rightKidney', 'lowerBack', 'capsule', [0.055, 0.1, 8, 12], [-0.15, 2.05, -0.14], '#7d3c3c', {
    rotation: [0, 0, -0.15],
  }),
  organ('leftKidney', 'lowerBack', 'capsule', [0.055, 0.1, 8, 12], [0.15, 2.08, -0.14], '#7d3c3c', {
    rotation: [0, 0, 0.15],
  }),

  // Lower abdomen: colon frame in the coronal plane, small bowel inside
  organ('colonFrame', 'leftLowerAbdomen', 'torus', [0.17, 0.045, 10, 32, 4.2], [0, 1.86, 0.04], '#c98a6b', {
    rotation: [0, 0, 2.65],
  }),
  ...bowelCoils,
  organ('cecum', 'rightLowerAbdomen', 'sphere', [0.065, 12, 10], [-0.16, 1.74, 0.05], '#c98a6b'),
  organ('appendix', 'rightLowerAbdomen', 'capsule', [0.022, 0.07, 4, 8], [-0.17, 1.65, 0.07], '#b5651d', {
    rotation: [0, 0, 0.6],
  }),

  // Pelvis
  organ('bladder', 'pelvis', 'sphere', [0.08, 16, 12], [0, 1.48, 0.07], '#e0c068', {
    scale: [1, 0.85, 0.9],
  }),
]
