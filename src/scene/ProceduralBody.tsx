import type { AnatomyLayer } from '../anatomy/anatomyMap'
import { BODY_PARTS } from './bodyGeometry'
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

  const visibleParts = BODY_PARTS.filter((part) => {
    if (internalOnly) {
      return part.layer === activeLayer && activeLayer !== 'skin'
    }
    if (part.layer === activeLayer) {
      return true
    }
    return part.layer === 'skin' && showSkinGhost
  })

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
