import type { BodyPart } from './bodyGeometry'

type ShapeDef = Pick<BodyPart, 'shape' | 'args'>

/** Shared JSX geometry builder for a primitive shape definition, used by the
 * fallback body and the invisible hit-proxies. */
export function geometryFor(part: ShapeDef) {
  const args = part.args
  switch (part.shape) {
    case 'sphere':
      return <sphereGeometry args={args as [number, number, number]} />
    case 'cylinder':
      return <cylinderGeometry args={args as [number, number, number, number]} />
    case 'capsule':
      return <capsuleGeometry args={args as [number, number, number, number]} />
    case 'box':
      return <boxGeometry args={args as [number, number, number]} />
    case 'torus':
      // [radius, tube, radialSegments, tubularSegments, arc?]
      return <torusGeometry args={args as [number, number, number, number, number]} />
  }
}
