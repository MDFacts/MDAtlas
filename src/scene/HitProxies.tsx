import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { regionName } from '../anatomy/anatomyMap'
import { useAssessmentStore } from '../state/assessmentStore'
import { FEMALE_HIT_SCALE, HIT_REGIONS } from './hitRegions'
import type { HitRegion } from './hitRegions'
import { geometryFor } from './regionGeometry'

/** Set VITE-free debug via URL: ?debugProxies shows the volumes for calibration. */
const DEBUG_PROXIES =
  typeof window !== 'undefined' && window.location.search.includes('debugProxies')

interface HoverState {
  regionId: string
  point: { x: number; y: number; z: number }
}

interface ProxyProps {
  region: HitRegion
  onSelect: (regionId: string, point: { x: number; y: number; z: number }) => void
  onHover: (hover: HoverState | null) => void
}

/**
 * An invisible raycast volume aligned to the realistic body. Hover feedback is
 * NOT the volume itself (primitive shapes would clash with the realistic mesh);
 * instead HitProxies renders a surface glow dot + region label at the pointer.
 */
function HitProxy({ region, onSelect, onHover }: ProxyProps) {
  return (
    <mesh
      userData={{ regionId: region.regionId }}
      position={region.position}
      rotation={region.rotation ?? [0, 0, 0]}
      scale={region.scale ?? [1, 1, 1]}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        onSelect(region.regionId, { x: event.point.x, y: event.point.y, z: event.point.z })
      }}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        onHover({
          regionId: region.regionId,
          point: { x: event.point.x, y: event.point.y, z: event.point.z },
        })
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = 'auto'
      }}
    >
      {geometryFor(region)}
      <meshStandardMaterial
        color="#3b82f6"
        transparent
        opacity={DEBUG_PROXIES ? 0.3 : 0}
        depthWrite={false}
        wireframe={DEBUG_PROXIES}
      />
    </mesh>
  )
}

export function HitProxies({
  onSelect,
}: {
  selectedRegionId: string | null
  onSelect: (regionId: string, point: { x: number; y: number; z: number }) => void
}) {
  const bodySex = useAssessmentStore((state) => state.bodySex)
  const [hover, setHover] = useState<HoverState | null>(null)

  const groupScale = bodySex === 'female' ? FEMALE_HIT_SCALE : 1

  return (
    <>
      <group scale={groupScale}>
        {HIT_REGIONS.map((region) => (
          <HitProxy key={region.key} region={region} onSelect={onSelect} onHover={setHover} />
        ))}
      </group>

      {hover ? (
        <group position={[hover.point.x, hover.point.y, hover.point.z]}>
          {/* Soft glow that hugs the model surface at the pointer. */}
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.045, 16, 12]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={1.6}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#2f6fed"
              emissiveIntensity={0.7}
              transparent
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
          <Html
            position={[0.14, 0.1, 0]}
            className="pointer-events-none select-none whitespace-nowrap rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-xs font-semibold text-brand shadow-[0_6px_18px_rgba(23,55,110,0.18)] backdrop-blur"
            zIndexRange={[10, 0]}
          >
            {regionName(hover.regionId)}
          </Html>
        </group>
      ) : null}
    </>
  )
}
