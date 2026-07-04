import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { TapPoint } from '../state/assessmentStore'

export function PainMarker({ point }: { point: TapPoint }) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) {
      return
    }
    const pulse = 1 + 0.25 * Math.sin(clock.elapsedTime * 4)
    ref.current.scale.setScalar(pulse)
  })

  return (
    <mesh ref={ref} position={[point.x, point.y, point.z]} raycast={() => null}>
      <sphereGeometry args={[0.055, 16, 12]} />
      <meshStandardMaterial
        color="#ef4444"
        emissive="#ef4444"
        emissiveIntensity={1.4}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}
