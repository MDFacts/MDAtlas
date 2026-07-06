import type { ThreeEvent } from '@react-three/fiber'
import type { AnatomyLayer } from '../anatomy/anatomyMap'
import { regionName } from '../anatomy/anatomyMap'
import type { BodyPart } from './bodyGeometry'
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
 * When `interactive`, each part reports its label (or its region's name for
 * skin parts) on hover, and taps select the part's region directly — the same
 * mesh-is-the-hit-target model the realistic body uses.
 */
export function ProceduralBody({
  activeLayer,
  internalOnly = false,
  interactive = false,
  onSelect,
  organSizeScale = 1,
  partLift,
}: {
  activeLayer: AnatomyLayer
  internalOnly?: boolean
  interactive?: boolean
  onSelect?: (regionId: string, point: { x: number; y: number; z: number }) => void
  /** Shrinks every organ EXCEPT the brain about its own centre (the female
   * organs are a scaled male layout; this trims them without moving them or the
   * brain). 1 = no change. */
  organSizeScale?: number
  /** Per-part vertical nudge (part.key → Δy in the layout frame). */
  partLift?: Record<string, number>
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
        const label = part.label ?? (part.layer === 'skin' ? regionName(part.regionId) : undefined)
        const hoverable = interactive && !!label
        // Trim size in place (skip the brain), and apply any per-part lift. A
        // tube (the colon) has no mesh scale — thin its radius instead.
        const shrink = organSizeScale !== 1 && part.key !== 'brain'
        const geomPart: Pick<BodyPart, 'shape' | 'args' | 'points'> =
          shrink && part.shape === 'tube'
            ? { ...part, args: [part.args[0], part.args[1] * organSizeScale, part.args[2]] }
            : part
        const baseScale = part.scale ?? [1, 1, 1]
        const scale =
          shrink && part.shape !== 'tube'
            ? ([baseScale[0] * organSizeScale, baseScale[1] * organSizeScale, baseScale[2] * organSizeScale] as [number, number, number])
            : baseScale
        const lift = partLift?.[part.key]
        const position: [number, number, number] = lift
          ? [part.position[0], part.position[1] + lift, part.position[2]]
          : part.position
        return (
          <mesh
            key={part.key}
            position={position}
            rotation={part.rotation ?? [0, 0, 0]}
            scale={scale}
            raycast={hoverable ? undefined : () => null}
            castShadow={!ghosted}
            receiveShadow={!ghosted}
            onPointerMove={
              hoverable
                ? (event: ThreeEvent<PointerEvent>) => {
                    event.stopPropagation()
                    setHover(
                      label as string,
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
                    const point = { x: event.point.x, y: event.point.y, z: event.point.z }
                    // Touch has no hover — show the name chip on the tap itself.
                    setHover(label as string, point, 'organ')
                    onSelect(part.regionId, point)
                  }
                : undefined
            }
          >
            {geometryFor(geomPart)}
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
