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
  label: string,
  shape: BodyPart['shape'],
  args: number[],
  position: [number, number, number],
  color: string,
  extra: Partial<BodyPart> = {},
): BodyPart => ({ key, regionId, layer: 'organs', shape, args, position, color, label, ...extra })

const ORGAN_COL = {
  lung: '#d98f8f',
  heart: '#b03a3a',
  liver: '#7a3b28',
  gallbladder: '#4a7a3b',
  stomach: '#d9a066',
  pancreas: '#d8b27a',
  spleen: '#6d3b52',
  kidney: '#7d3c3c',
  colon: '#c98a6b',
  bowel: '#d8a07a',
  appendix: '#b5651d',
  bladder: '#e0c068',
  brain: '#c795a0',
  airway: '#b98f86',
}

// --- Vertebral column: cervical → lumbar, posterior of the midline ---
const vertebrae: BodyPart[] = []
for (let i = 0; i < 14; i += 1) {
  const y = 2.98 - i * 0.095
  const radius = i < 3 ? 0.035 : i < 10 ? 0.045 : 0.055
  vertebrae.push(
    bone(`vertebra-${i}`, i < 3 ? 'neck' : i < 10 ? 'upperBack' : 'lowerBack', 'cylinder', [radius, radius, 0.06, 10], [0, y, -0.07]),
  )
}

// --- Ribcage: 12 rib pairs forming a barrel that widens mid-thorax then tapers,
// sloping forward-down. Lower pairs overlie the upper abdomen. ---
const ribs: BodyPart[] = []
const RIB_RADII = [0.2, 0.24, 0.27, 0.295, 0.315, 0.325, 0.33, 0.325, 0.31, 0.285, 0.25, 0.21]
for (let i = 0; i < RIB_RADII.length; i += 1) {
  ribs.push(
    bone(`rib-${i}`, i < 8 ? 'chest' : 'epigastric', 'torus', [RIB_RADII[i], 0.015, 8, 40], [0, 2.86 - i * 0.066, -0.02], {
      rotation: [Math.PI / 2 + 0.12, 0, 0],
      scale: [1, 1, 0.6],
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

  // Pelvis: broad iliac wings, sacrum, pubic bridge. The hip sockets sit near the
  // outer edges so the femoral heads attach wide, not at the midline.
  bone('rightIliac', 'pelvis', 'sphere', [0.2, 16, 12], [-0.17, 1.62, -0.02], {
    scale: [0.62, 0.9, 0.42],
    rotation: [0, 0, 0.35],
  }),
  bone('leftIliac', 'pelvis', 'sphere', [0.2, 16, 12], [0.17, 1.62, -0.02], {
    scale: [0.62, 0.9, 0.42],
    rotation: [0, 0, -0.35],
  }),
  bone('sacrum', 'lowerBack', 'box', [0.12, 0.22, 0.05], [0, 1.57, -0.09], { rotation: [0.15, 0, 0] }),
  bone('pubis', 'pelvis', 'box', [0.2, 0.05, 0.04], [0, 1.44, 0.1]),

  // Arms follow the model's A-pose line shoulder → elbow → wrist → hand
  // (≈16° off vertical, ending near the hips), matching the arm hit-regions.
  bone('rightHumerusHead', 'rightShoulder', 'sphere', [0.052, 12, 10], [-0.37, 2.79, 0]),
  bone('leftHumerusHead', 'leftShoulder', 'sphere', [0.052, 12, 10], [0.37, 2.79, 0]),
  bone('rightHumerus', 'rightArm', 'cylinder', [0.035, 0.042, 0.74, 10], [-0.46, 2.42, 0], {
    rotation: [0, 0, -0.28],
  }),
  bone('leftHumerus', 'leftArm', 'cylinder', [0.035, 0.042, 0.74, 10], [0.46, 2.42, 0], {
    rotation: [0, 0, 0.28],
  }),
  bone('rightElbow', 'rightArm', 'sphere', [0.044, 12, 10], [-0.55, 2.06, 0]),
  bone('leftElbow', 'leftArm', 'sphere', [0.044, 12, 10], [0.55, 2.06, 0]),
  bone('rightRadius', 'rightArm', 'cylinder', [0.022, 0.028, 0.66, 8], [-0.65, 1.72, 0.02], {
    rotation: [0, 0, -0.28],
  }),
  bone('rightUlna', 'rightArm', 'cylinder', [0.018, 0.023, 0.66, 8], [-0.66, 1.71, -0.02], {
    rotation: [0, 0, -0.28],
  }),
  bone('leftRadius', 'leftArm', 'cylinder', [0.022, 0.028, 0.66, 8], [0.65, 1.72, 0.02], {
    rotation: [0, 0, 0.28],
  }),
  bone('leftUlna', 'leftArm', 'cylinder', [0.018, 0.023, 0.66, 8], [0.66, 1.71, -0.02], {
    rotation: [0, 0, 0.28],
  }),
  bone('rightHand', 'rightArm', 'box', [0.06, 0.15, 0.03], [-0.75, 1.35, 0], {
    rotation: [0, 0, -0.28],
  }),
  bone('leftHand', 'leftArm', 'box', [0.06, 0.15, 0.03], [0.75, 1.35, 0], {
    rotation: [0, 0, 0.28],
  }),

  // Legs: femoral head sits wide in the hip socket, angling in toward the knee
  // (natural Q-angle), then tibia/fibula → foot.
  bone('rightFemurHead', 'pelvis', 'sphere', [0.055, 12, 10], [-0.2, 1.58, 0]),
  bone('leftFemurHead', 'pelvis', 'sphere', [0.055, 12, 10], [0.2, 1.58, 0]),
  bone('rightFemurNeck', 'pelvis', 'cylinder', [0.028, 0.032, 0.12, 8], [-0.17, 1.53, 0], {
    rotation: [0, 0, 0.9],
  }),
  bone('leftFemurNeck', 'pelvis', 'cylinder', [0.028, 0.032, 0.12, 8], [0.17, 1.53, 0], {
    rotation: [0, 0, -0.9],
  }),
  bone('rightFemur', 'rightLeg', 'cylinder', [0.04, 0.048, 0.66, 10], [-0.19, 1.22, 0], {
    rotation: [0, 0, 0.03],
  }),
  bone('leftFemur', 'leftLeg', 'cylinder', [0.04, 0.048, 0.66, 10], [0.19, 1.22, 0], {
    rotation: [0, 0, -0.03],
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

// --- Small-bowel: coil mass tucked inside the colon frame (kept compact so it
// stays within the abdominal wall) ---
const bowelCoils: BodyPart[] = [
  [-0.05, 2.02, 0.0, 0.06],
  [0.06, 2.01, -0.01, 0.058],
  [-0.01, 1.95, 0.01, 0.065],
  [0.04, 1.89, 0.0, 0.06],
  [-0.06, 1.88, -0.01, 0.055],
  [0.01, 1.83, 0.0, 0.058],
].map(([x, y, z, r], i) =>
  organ(`smallBowel-${i}`, 'rightLowerAbdomen', 'Small intestine', 'torus', [r, 0.035, 8, 22], [x, y, z], ORGAN_COL.bowel, {
    rotation: [0.2 * (i - 2), 0.3 * i, 0.7 * i],
  }),
)

// Torso interior is roughly ±0.24 wide (x) and ±0.12 deep (z); organs are sized
// to stay comfortably inside the visible body wall.
export const ORGAN_PARTS: BodyPart[] = [
  organ('brain', 'head', 'Brain', 'sphere', [0.155, 24, 18], [0, 3.3, -0.02], ORGAN_COL.brain, {
    scale: [0.86, 0.82, 0.96],
  }),

  // Airway: trachea splitting into the two main bronchi
  organ('trachea', 'neck', 'Trachea', 'cylinder', [0.026, 0.028, 0.3, 12], [0, 2.86, -0.03], ORGAN_COL.airway),
  organ('bronchusR', 'chest', 'Bronchus', 'cylinder', [0.015, 0.019, 0.13, 8], [-0.055, 2.68, -0.04], ORGAN_COL.airway, {
    rotation: [0, 0, 0.7],
  }),
  organ('bronchusL', 'chest', 'Bronchus', 'cylinder', [0.015, 0.019, 0.13, 8], [0.055, 2.68, -0.04], ORGAN_COL.airway, {
    rotation: [0, 0, -0.7],
  }),

  // Lungs — fill the ribcage without reaching the body wall; right lung a touch
  // larger and higher, medial sides notched around the heart (two stacked lobes).
  organ('rightLungUpper', 'chest', 'Right lung', 'capsule', [0.115, 0.2, 8, 16], [-0.145, 2.66, -0.04], ORGAN_COL.lung, {
    rotation: [0, 0, -0.05],
    scale: [1, 1, 0.7],
  }),
  organ('rightLungLower', 'chest', 'Right lung', 'capsule', [0.11, 0.12, 8, 16], [-0.145, 2.47, -0.04], ORGAN_COL.lung, {
    scale: [1, 1, 0.7],
  }),
  organ('leftLungUpper', 'chest', 'Left lung', 'capsule', [0.105, 0.2, 8, 16], [0.15, 2.66, -0.04], ORGAN_COL.lung, {
    rotation: [0, 0, 0.05],
    scale: [1, 1, 0.7],
  }),
  organ('leftLungLower', 'chest', 'Left lung', 'capsule', [0.1, 0.11, 8, 16], [0.155, 2.48, -0.04], ORGAN_COL.lung, {
    scale: [1, 1, 0.7],
  }),
  organ('heart', 'chest', 'Heart', 'sphere', [0.095, 20, 16], [0.015, 2.56, -0.01], ORGAN_COL.heart, {
    scale: [0.95, 1.2, 0.85],
    rotation: [0.2, 0, 0.32],
  }),

  // Liver — broad wedge under the right ribs, larger right lobe crossing the
  // midline; sized to stay within the abdominal wall.
  organ('liverRight', 'rightUpperAbdomen', 'Liver', 'sphere', [0.135, 20, 16], [-0.09, 2.36, -0.03], ORGAN_COL.liver, {
    scale: [1.2, 0.6, 0.82],
    rotation: [0, 0, 0.12],
  }),
  organ('liverLeft', 'epigastric', 'Liver', 'sphere', [0.09, 18, 14], [0.08, 2.35, -0.02], ORGAN_COL.liver, {
    scale: [1.1, 0.5, 0.75],
    rotation: [0, 0, -0.1],
  }),
  organ('gallbladder', 'rightUpperAbdomen', 'Gallbladder', 'capsule', [0.026, 0.05, 6, 10], [-0.1, 2.26, 0.02], ORGAN_COL.gallbladder, {
    rotation: [0.4, 0, 0.5],
  }),

  // Epigastrium — stomach (J-shaped) with pancreas behind it
  organ('stomach', 'epigastric', 'Stomach', 'torus', [0.075, 0.045, 10, 22, 3.7], [0.09, 2.34, -0.02], ORGAN_COL.stomach, {
    rotation: [0.2, 0.3, 0.7],
    scale: [1.1, 1.15, 0.9],
  }),
  organ('pancreas', 'epigastric', 'Pancreas', 'capsule', [0.03, 0.18, 6, 10], [-0.02, 2.21, -0.06], ORGAN_COL.pancreas, {
    rotation: [0, 0.2, 1.35],
  }),

  // Left upper quadrant — spleen behind the stomach
  organ('spleen', 'leftUpperAbdomen', 'Spleen', 'capsule', [0.042, 0.08, 6, 10], [0.185, 2.38, -0.07], ORGAN_COL.spleen, {
    rotation: [0.3, 0, 0.5],
  }),

  // Retroperitoneum — kidneys sit high and posterior
  organ('rightKidney', 'lowerBack', 'Right kidney', 'capsule', [0.045, 0.08, 8, 12], [-0.13, 2.14, -0.13], ORGAN_COL.kidney, {
    rotation: [0, 0, -0.18],
  }),
  organ('leftKidney', 'lowerBack', 'Left kidney', 'capsule', [0.045, 0.08, 8, 12], [0.13, 2.17, -0.13], ORGAN_COL.kidney, {
    rotation: [0, 0, 0.18],
  }),

  // Large intestine — one continuous tube framing the small bowel:
  // cecum → ascending (right) → transverse (across) → descending (left) → sigmoid.
  {
    key: 'colon',
    regionId: 'leftLowerAbdomen',
    layer: 'organs',
    label: 'Large intestine',
    color: ORGAN_COL.colon,
    shape: 'tube',
    args: [96, 0.043, 12],
    position: [0, 0, 0],
    points: [
      [-0.17, 1.72, -0.01], // cecum
      [-0.185, 1.82, -0.03], // ascending, low
      [-0.185, 1.97, -0.04], // ascending, high
      [-0.16, 2.13, -0.05], // hepatic flexure
      [-0.08, 2.15, -0.03], // transverse, right
      [0, 2.11, -0.02], // transverse, mid (dips forward)
      [0.09, 2.15, -0.03], // transverse, left
      [0.17, 2.14, -0.05], // splenic flexure
      [0.185, 1.95, -0.04], // descending, high
      [0.18, 1.8, -0.03], // descending, low
      [0.1, 1.72, -0.01], // sigmoid
      [0.02, 1.67, -0.02], // sigmoid → rectum
    ],
  },
  organ('appendix', 'rightLowerAbdomen', 'Appendix', 'capsule', [0.016, 0.06, 4, 8], [-0.16, 1.7, 0], ORGAN_COL.appendix, {
    rotation: [0, 0, 0.5],
  }),

  // Small intestine coils, tucked inside the colon frame
  ...bowelCoils,

  // Pelvis — bladder tucked snugly below the small bowel, behind the pubic bone
  organ('bladder', 'pelvis', 'Bladder', 'sphere', [0.065, 16, 12], [0, 1.67, -0.01], ORGAN_COL.bladder, {
    scale: [1.05, 0.85, 0.9],
  }),
]
