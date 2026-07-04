import type { BodyPart } from './bodyGeometry'

/** Shared JSX geometry builder for a body part, used by the fallback body and
 * the invisible hit-proxies so both stay in exact spatial agreement. */
export function geometryFor(part: BodyPart) {
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
      return <torusGeometry args={args as [number, number, number, number]} />
  }
}
