import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Mesh } from 'three'
import { useAssessmentStore } from '../state/assessmentStore'
import type { TapPoint } from '../state/assessmentStore'

// Severity 1 → 10 maps to a small amber dot → a large deep-red flare, echoing
// the severity meter in the panel.
const MIN_RADIUS = 0.032
const MAX_RADIUS = 0.11
const LOW_COLOR = new Color('#f59e0b') // amber
const HIGH_COLOR = new Color('#dc2626') // deep red

export function PainMarker({ point }: { point: TapPoint }) {
  const core = useRef<Mesh>(null)
  const glow = useRef<Mesh>(null)
  const severity = useAssessmentStore((state) => state.draftSeverity)

  const { radius, color } = useMemo(() => {
    const t = (Math.min(10, Math.max(1, severity)) - 1) / 9
    return {
      radius: MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * t,
      color: LOW_COLOR.clone().lerp(HIGH_COLOR, t),
    }
  }, [severity])

  useFrame(({ clock }) => {
    const pulse = 1 + 0.22 * Math.sin(clock.elapsedTime * 4)
    core.current?.scale.setScalar(pulse)
    glow.current?.scale.setScalar(1 + 0.32 * Math.sin(clock.elapsedTime * 4 + 0.6))
  })

  return (
    <group position={[point.x, point.y, point.z]}>
      <mesh ref={core} raycast={() => null}>
        <sphereGeometry args={[radius, 20, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh ref={glow} raycast={() => null}>
        <sphereGeometry args={[radius * 1.9, 20, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
