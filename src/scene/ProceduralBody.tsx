import type { ThreeEvent } from '@react-three/fiber'
import type { AnatomyLayer } from '../anatomy/anatomyMap'
import { BODY_PARTS } from './bodyGeometry'
import { useHoverStore } from './hoverStore'
import { ORGAN_PARTS, SKELETON_PARTS } from './internalAnatomy'
import { geometryFor } from './regionGeometry'

/**
 * Body assembled from primitives. Two roles:
 *  - Standalone fallback (internalOnly=false) when the realistic GLB is absent:
 *    renders the active layer, ghosting skin when a deeper layer is shown.
 *  - Internal overlay (internalOnly=true) alongside the realistic mesh: renders
 *    only skeleton/organ structures, since the realistic mesh supplies the skin.
 *
 * When `interactive` (the organs overlay), each part reports its label to the
 * hover store on pointer-over. Tap detection stays with HitProxies.
 */
export function ProceduralBody({
  activeLayer,
  internalOnly = false,
  interactive = false,
  onSelect,
}: {
  activeLayer: AnatomyLayer
  internalOnly?: boolean
  interactive?: boolean
  onSelect?: (regionId: string, point: { x: number; y: number; z: number }) => void
}) {
  const setHover = useHoverStore((state) => state.setHover)
  const clearHover = useHoverStore((state) => state.clearHover)
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
        const hoverable = interactive && !!part.label
        return (
          <mesh
            key={part.key}
            position={part.position}
            rotation={part.rotation ?? [0, 0, 0]}
            scale={part.scale ?? [1, 1, 1]}
            raycast={hoverable ? undefined : () => null}
            castShadow={!ghosted}
            receiveShadow={!ghosted}
            onPointerMove={
              hoverable
                ? (event: ThreeEvent<PointerEvent>) => {
                    event.stopPropagation()
                    setHover(
                      part.label as string,
                      { x: event.point.x, y: event.point.y, z: event.point.z },
                      'organ',
                    )
                  }
                : undefined
            }
            onPointerOut={hoverable ? () => clearHover('organ') : undefined}
            onPointerDown={
              hoverable && onSelect
                ? (event: ThreeEvent<PointerEvent>) => {
                    event.stopPropagation()
                    onSelect(part.regionId, { x: event.point.x, y: event.point.y, z: event.point.z })
                  }
                : undefined
            }
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
