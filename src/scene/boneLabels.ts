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
    let index = node[1]
    // The female export appends a 3-digit duplicate suffix to every node
    // (Object_10 → Object_10001), so the raw index misses the lookup. Strip the
    // suffix when the full index isn't a known node.
    if (!(index in NODE_GROUP) && index.length > 3) {
      index = index.slice(0, -3)
    }
    return NODE_GROUP[index] ?? null
  }
  return null
}

/** Body's left is +x, right is −x. */
function side(x: number): string {
  return x > 0 ? 'Left' : 'Right'
}

// The GLB merges every arm/hand bone into one mesh and every hip/leg bone into
// another, so the specific bone is resolved from the hover point's height in the
// ~3.4-unit envelope (shoulder ≈2.78, elbow ≈2.05, wrist ≈1.5; hip ≈1.55,
// knee ≈0.9, ankle ≈0.15).
function armBoneLabel(p: { x: number; y: number }): string {
  const s = side(p.x)
  if (p.y > 2.05) return `${s} humerus (upper arm)`
  if (p.y > 1.5) return `${s} forearm (radius & ulna)`
  return `${s} hand (carpals & fingers)`
}

function legBoneLabel(p: { x: number; y: number }): string {
  const s = side(p.x)
  if (p.y > 1.5) return `${s} hip bone (ilium)`
  if (p.y > 0.98) return `${s} femur (thigh)`
  if (p.y > 0.84) return `${s} patella (kneecap)`
  if (p.y > 0.16) return `${s} tibia & fibula (shin)`
  return `${s} foot bones`
}

export function boneLabel(name: string, point?: { x: number; y: number }): string | null {
  const group = boneGroup(name)
  if (!group) {
    return null
  }
  if (point) {
    if (group === 'armshands') return armBoneLabel(point)
    if (group === 'hipslegs') return legBoneLabel(point)
  }
  return GROUP_LABELS[group] ?? group
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
