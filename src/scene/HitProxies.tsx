import type { ThreeEvent } from '@react-three/fiber'
import { Mesh } from 'three'
import { regionName } from '../anatomy/anatomyMap'
import { useAssessmentStore } from '../state/assessmentStore'
import { FEMALE_HIT_SCALE, HIT_REGIONS } from './hitRegions'
import type { HitRegion } from './hitRegions'
import { useHoverStore } from './hoverStore'
import { geometryFor } from './regionGeometry'

/** Set VITE-free debug via URL: ?debugProxies shows the volumes for calibration. */
const DEBUG_PROXIES =
  typeof window !== 'undefined' && window.location.search.includes('debugProxies')

interface ProxyProps {
  region: HitRegion
  /** Region-name hover only on the skin layer; deeper layers let the actual
   * organ/bone meshes provide their own hover names. */
  hoverEnabled: boolean
  onSelect: (regionId: string, point: { x: number; y: number; z: number }) => void
}

/**
 * An invisible raycast volume over the visible body. It always handles the tap
 * (region selection drives the assessment on every layer). On the skin layer it
 * also names the region on hover; on deeper layers it stays hover-silent so the
 * pointer reaches the organ/bone beneath it.
 */
function HitProxy({ region, hoverEnabled, onSelect }: ProxyProps) {
  const setHover = useHoverStore((state) => state.setHover)
  const clearHover = useHoverStore((state) => state.clearHover)

  return (
    <mesh
      userData={{ regionId: region.regionId }}
      position={region.position}
      rotation={region.rotation ?? [0, 0, 0]}
      scale={region.scale ?? [1, 1, 1]}
      raycast={hoverEnabled ? meshRaycast : noRaycast}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        onSelect(region.regionId, { x: event.point.x, y: event.point.y, z: event.point.z })
      }}
      onPointerMove={
        hoverEnabled
          ? (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation()
              setHover(
                regionName(region.regionId),
                { x: event.point.x, y: event.point.y, z: event.point.z },
                'region',
              )
            }
          : undefined
      }
      onPointerOver={(event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        if (hoverEnabled) {
          clearHover('region')
        }
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

/** No-op raycast: keeps the proxy out of the intersection set entirely so it
 * can't block hover/clicks on the organ or bone meshes behind it. */
const noRaycast = () => null

/** The real mesh raycast, assigned explicitly when the proxy should be tappable.
 * We must NOT pass `undefined` to re-enable it: R3F does not restore the default
 * raycast when a prop goes from `noRaycast` back to `undefined`, so the proxy
 * would stay un-raycastable after visiting a deeper layer and returning to skin
 * (taps silently miss). Assigning the prototype method guarantees restoration. */
const meshRaycast = Mesh.prototype.raycast

export function HitProxies({
  onSelect,
}: {
  selectedRegionId: string | null
  onSelect: (regionId: string, point: { x: number; y: number; z: number }) => void
}) {
  const bodySex = useAssessmentStore((state) => state.bodySex)
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const hoverEnabled = activeLayer === 'skin'
  const groupScale = bodySex === 'female' ? FEMALE_HIT_SCALE : 1

  return (
    <group scale={groupScale}>
      {HIT_REGIONS.map((region) => (
        <HitProxy
          key={region.key}
          region={region}
          hoverEnabled={hoverEnabled}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
