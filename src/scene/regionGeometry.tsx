import { CatmullRomCurve3, Vector3 } from 'three'
import type { BodyPart } from './bodyGeometry'

type ShapeDef = Pick<BodyPart, 'shape' | 'args' | 'points'>

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
    case 'tube': {
      // args: [tubularSegments, radius, radialSegments]; points → smooth spline.
      const [tubularSegments = 64, radius = 0.04, radialSegments = 10] = args
      const curve = new CatmullRomCurve3((part.points ?? []).map((p) => new Vector3(...p)))
      return <tubeGeometry args={[curve, tubularSegments, radius, radialSegments, false]} />
    }
  }
}
