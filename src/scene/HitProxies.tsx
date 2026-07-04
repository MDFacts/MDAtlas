import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { BODY_PARTS } from './bodyGeometry'
import type { BodyPart } from './bodyGeometry'
import { geometryFor } from './regionGeometry'

interface HitProxyProps {
  part: BodyPart
  selected: boolean
  onSelect: (regionId: string, point: { x: number; y: number; z: number }) => void
}

/**
 * An invisible, raycastable volume over the visible body. Tapping it selects the
 * region; hovering or selecting paints a translucent highlight so the user sees
 * exactly which structure they marked — independent of the underlying mesh.
 */
function HitProxy({ part, selected, onSelect }: HitProxyProps) {
  const [hovered, setHovered] = useState(false)
  const active = hovered || selected

  return (
    <group position={part.position} rotation={part.rotation ?? [0, 0, 0]} scale={part.scale ?? [1, 1, 1]}>
      <mesh
        userData={{ regionId: part.regionId }}
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation()
          onSelect(part.regionId, { x: event.point.x, y: event.point.y, z: event.point.z })
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        {geometryFor(part)}
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {active ? (
        <mesh raycast={() => null} scale={1.03}>
          {geometryFor(part)}
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#2f6fed"
            emissiveIntensity={selected ? 0.7 : 0.35}
            transparent
            opacity={selected ? 0.5 : 0.28}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  )
}

/** Only skin-layer parts are tappable — one proxy per selectable region. */
export function HitProxies({
  selectedRegionId,
  onSelect,
}: {
  selectedRegionId: string | null
  onSelect: (regionId: string, point: { x: number; y: number; z: number }) => void
}) {
  return (
    <group>
      {BODY_PARTS.filter((part) => part.layer === 'skin').map((part) => (
        <HitProxy
          key={part.key}
          part={part}
          selected={part.regionId === selectedRegionId}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
