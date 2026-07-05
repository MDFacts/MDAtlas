import { Html } from '@react-three/drei'
import { useHoverStore } from './hoverStore'

/** Renders the floating name chip + a small glow dot at whatever structure is
 * currently hovered (region, organ, or bone), driven by the hover store. */
export function HoverChip() {
  const label = useHoverStore((state) => state.label)
  const point = useHoverStore((state) => state.point)

  if (!label || !point) {
    return null
  }

  return (
    <group position={[point.x, point.y, point.z]}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={1.6}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#2f6fed"
          emissiveIntensity={0.7}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <Html
        position={[0.12, 0.09, 0]}
        className="pointer-events-none select-none whitespace-nowrap rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-xs font-semibold text-brand shadow-[0_6px_18px_rgba(23,55,110,0.18)] backdrop-blur"
        zIndexRange={[10, 0]}
      >
        {label}
      </Html>
    </group>
  )
}
