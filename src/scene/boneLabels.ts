/**
 * Friendly names for the skeleton GLB's sub-meshes. Each mesh name carries the
 * anatomical group either as `…Shape_<Group>_…` (glTF mesh name) or via the
 * `Object_<n>` node name; both forms are handled so the label survives however
 * three.js exposes the name.
 */
const GROUP_LABELS: Record<string, string> = {
  discs: 'Intervertebral discs',
  ribs: 'Ribs',
  sternum: 'Sternum',
  ribcartilage: 'Rib cartilage',
  spine: 'Spine (vertebrae)',
  hyoid: 'Hyoid bone',
  cranium: 'Skull',
  upperteeth: 'Upper teeth',
  mandible: 'Jaw (mandible)',
  lowerteeth: 'Lower teeth',
  armshands: 'Arm & hand bones',
  hipslegs: 'Hip & leg bones',
  sacrum: 'Sacrum',
  hipcartilage: 'Hip cartilage',
}

// Object_<n> node index → group, identical across the male and female exports.
const NODE_GROUP: Record<string, string> = {
  '10': 'discs',
  '11': 'ribs',
  '12': 'sternum',
  '13': 'ribcartilage',
  '14': 'spine',
  '15': 'hyoid',
  '16': 'cranium',
  '17': 'upperteeth',
  '18': 'mandible',
  '19': 'lowerteeth',
  '6': 'armshands',
  '7': 'hipslegs',
  '8': 'sacrum',
  '9': 'hipcartilage',
}

function boneGroup(name: string): string | null {
  const shape = name.match(/Shape_([A-Za-z]+)/i)
  if (shape) {
    return shape[1].toLowerCase()
  }
  const node = name.match(/Object_(\d+)/)
  if (node) {
    return NODE_GROUP[node[1]] ?? null
  }
  return null
}

export function boneLabel(name: string): string | null {
  const group = boneGroup(name)
  return group ? (GROUP_LABELS[group] ?? group) : null
}

/** Map a clicked bone to the assessment region it belongs to, so tapping a bone
 * on the skeleton layer starts an assessment like tapping the body does. Body's
 * left is +x, right is −x. */
export function regionForBone(name: string, point: { x: number; y: number }): string | null {
  const group = boneGroup(name)
  const left = point.x > 0
  switch (group) {
    case 'cranium':
    case 'upperteeth':
    case 'lowerteeth':
    case 'mandible':
      return 'head'
    case 'hyoid':
      return 'neck'
    case 'ribs':
    case 'sternum':
    case 'ribcartilage':
      return 'chest'
    case 'spine':
    case 'discs':
      return point.y > 2.3 ? 'upperBack' : 'lowerBack'
    case 'sacrum':
    case 'hipcartilage':
      return 'pelvis'
    case 'armshands':
      return left ? 'leftArm' : 'rightArm'
    case 'hipslegs':
      return point.y > 1.5 ? 'pelvis' : left ? 'leftLeg' : 'rightLeg'
    default:
      return null
  }
}
