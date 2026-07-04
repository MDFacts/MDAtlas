import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { BodyPart } from './bodyGeometry'

interface RegionMeshProps {
  part: BodyPart
  ghosted: boolean
  selected: boolean
  onSelect: (regionId: string, point: { x: number; y: number; z: number }) => void
}

function geometryFor(part: BodyPart) {
  const args = part.args
  switch (part.shape) {
    case 'sphere':
      return <sphereGeometry args={args as [number, number, number]} />
    case 'cylinder':
      return <cylinderGeometry args={args as [number, number, number, number]} />
    case 'capsule':
      return <capsuleGeometry args={args as [number, number, number, number]} />
    case 'box':
      return <boxGeometry args={args as [number, number, number]} />
    case 'torus':
      return <torusGeometry args={args as [number, number, number, number]} />
  }
}

export function RegionMesh({ part, ghosted, selected, onSelect }: RegionMeshProps) {
  const [hovered, setHovered] = useState(false)

  const handleDown = (event: ThreeEvent<PointerEvent>) => {
    if (ghosted) {
      return
    }
    event.stopPropagation()
    onSelect(part.regionId, { x: event.point.x, y: event.point.y, z: event.point.z })
  }

  const highlight = !ghosted && (hovered || selected)

  return (
    <mesh
      name={part.key}
      userData={{ regionId: part.regionId }}
      position={part.position}
      rotation={part.rotation ?? [0, 0, 0]}
      scale={part.scale ?? [1, 1, 1]}
      onPointerDown={handleDown}
      onPointerOver={(event) => {
        if (ghosted) {
          return
        }
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
      <meshStandardMaterial
        color={part.color}
        roughness={0.55}
        metalness={0.05}
        transparent={ghosted}
        opacity={ghosted ? 0.14 : 1}
        depthWrite={!ghosted}
        emissive={highlight ? '#2f6fed' : '#000000'}
        emissiveIntensity={highlight ? (selected ? 0.9 : 0.45) : 0}
      />
    </mesh>
  )
}
