import type { AnatomyLayer } from '../anatomy/anatomyMap'
import { BODY_PARTS } from './bodyGeometry'
import { ORGAN_PARTS, SKELETON_PARTS } from './internalAnatomy'
import { geometryFor } from './regionGeometry'

/**
 * Body assembled from primitives. Two roles:
 *  - Standalone fallback (internalOnly=false) when the realistic GLB is absent:
 *    renders the active layer, ghosting skin when a deeper layer is shown.
 *  - Internal overlay (internalOnly=true) alongside the realistic mesh: renders
 *    only skeleton/organ structures, since the realistic mesh supplies the skin.
 * Purely visual — tap detection is handled by HitProxies.
 */
export function ProceduralBody({
  activeLayer,
  internalOnly = false,
}: {
  activeLayer: AnatomyLayer
  internalOnly?: boolean
}) {
  const showSkinGhost = activeLayer !== 'skin'

  const skinParts = BODY_PARTS.filter((part) => part.layer === 'skin')
  const internalParts =
    activeLayer === 'skeleton' ? SKELETON_PARTS : activeLayer === 'organs' ? ORGAN_PARTS : []

  const visibleParts = internalOnly
    ? internalParts
    : activeLayer === 'skin'
      ? skinParts
      : [...skinParts, ...internalParts]

  return (
    <group>
      {visibleParts.map((part) => {
        const ghosted = !internalOnly && part.layer === 'skin' && showSkinGhost
        return (
          <mesh
            key={part.key}
            position={part.position}
            rotation={part.rotation ?? [0, 0, 0]}
            scale={part.scale ?? [1, 1, 1]}
            raycast={() => null}
            castShadow={!ghosted}
            receiveShadow={!ghosted}
          >
            {geometryFor(part)}
            <meshStandardMaterial
              key={ghosted ? 'ghosted' : 'solid'}
              color={part.color}
              roughness={0.6}
              metalness={0.04}
              transparent={ghosted}
              opacity={ghosted ? 0.12 : 1}
              depthWrite={!ghosted}
            />
          </mesh>
        )
      })}
    </group>
  )
}
