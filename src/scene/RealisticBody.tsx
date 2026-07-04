import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Color, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import type { Group } from 'three'
import type { AnatomyLayer } from '../anatomy/anatomyMap'
import { BODY_GROUND_Y, BODY_MODEL_URL, BODY_TARGET_HEIGHT } from './modelConfig'

const SKIN_COLOR = new Color('#c8b6a6')

/**
 * Loads and displays the realistic body GLB, fit into the shared coordinate
 * envelope so the invisible hit-proxies line up. Applies a soft matte skin
 * material and enables shadow casting. When a deeper layer is active the body
 * ghosts to a translucent silhouette so internal structures show through.
 */
export function RealisticBody({ activeLayer }: { activeLayer: AnatomyLayer }) {
  const { scene } = useGLTF(BODY_MODEL_URL)
  const root = useRef<Group>(null)

  const cloned = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    const group = root.current
    if (!group) {
      return
    }
    // Fit to target height and recenter horizontally, feet to the ground.
    const box = new Box3().setFromObject(cloned)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    const height = size.y || 1
    const scale = BODY_TARGET_HEIGHT / height
    cloned.scale.setScalar(scale)
    cloned.position.set(
      -center.x * scale,
      -box.min.y * scale + BODY_GROUND_Y,
      -center.z * scale,
    )
  }, [cloned])

  const ghost = activeLayer !== 'skin'

  useLayoutEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        const material = new MeshStandardMaterial({
          color: SKIN_COLOR,
          roughness: 0.72,
          metalness: 0.02,
          transparent: ghost,
          opacity: ghost ? 0.12 : 1,
          depthWrite: !ghost,
        })
        child.material = material
        child.castShadow = !ghost
        child.receiveShadow = !ghost
        child.raycast = () => null // taps handled by hit-proxies
      }
    })
  }, [cloned, ghost])

  return <group ref={root}>{<primitive object={cloned} />}</group>
}
