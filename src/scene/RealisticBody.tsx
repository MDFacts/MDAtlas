import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, Color, Matrix4, Mesh, MeshStandardMaterial, SkinnedMesh, Vector3 } from 'three'
import type { Group } from 'three'
import { SkeletonUtils } from 'three-stdlib'
import type { AnatomyLayer } from '../anatomy/anatomyMap'
import { BODY_MODEL_SCALE } from './modelConfig'

const SKIN_COLOR = new Color('#c8b6a6')
const MAX_SAMPLES = 4000

/**
 * Bounds of the model as actually posed on screen, measured in `object`'s local
 * space. This must run after a frame has rendered so the skeleton is posed —
 * only then does applyBoneTransform give true positions for skinned meshes.
 * Static meshes fall back to geometry bounds. Vertices are sampled for speed.
 */
function posedBounds(object: Group): Box3 {
  object.updateWorldMatrix(true, true)
  const inverseRoot = object.matrixWorld.clone().invert()
  const box = new Box3()
  const relative = new Matrix4()
  const vertex = new Vector3()

  object.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || !mesh.geometry) {
      return
    }
    relative.multiplyMatrices(inverseRoot, mesh.matrixWorld)

    if ((mesh as SkinnedMesh).isSkinnedMesh) {
      const skinned = mesh as SkinnedMesh
      const position = skinned.geometry.attributes.position
      const step = Math.max(1, Math.floor(position.count / MAX_SAMPLES))
      for (let i = 0; i < position.count; i += step) {
        vertex.fromBufferAttribute(position, i)
        skinned.applyBoneTransform(i, vertex)
        vertex.applyMatrix4(relative)
        box.expandByPoint(vertex)
      }
    } else {
      mesh.geometry.computeBoundingBox()
      const geoBox = mesh.geometry.boundingBox
      if (geoBox) {
        box.union(geoBox.clone().applyMatrix4(relative))
      }
    }
  })
  return box
}

/**
 * Loads and displays a realistic body GLB. The models are pre-normalized to a
 * shared scale, so a single BODY_MODEL_SCALE is applied to the root and only the
 * per-model centering/grounding is measured at runtime (once the pose is live).
 * Applies a soft matte skin material and shadow casting; when a deeper layer is
 * active the body ghosts to a translucent silhouette.
 */
export function RealisticBody({ url, activeLayer }: { url: string; activeLayer: AnatomyLayer }) {
  const { scene } = useGLTF(url)
  const root = useRef<Group>(null)
  const fitted = useRef(false)

  // SkeletonUtils.clone preserves skinned-mesh bindings that Object3D.clone breaks.
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as Group, [scene])

  // Re-fit whenever the model changes.
  useLayoutEffect(() => {
    fitted.current = false
    cloned.position.set(0, 0, 0)
  }, [cloned])

  // Center horizontally and drop feet to the ground once the skeleton is posed.
  useFrame(() => {
    if (fitted.current) {
      return
    }
    const box = posedBounds(cloned)
    if (box.isEmpty()) {
      return
    }
    const size = box.getSize(new Vector3())
    if (!Number.isFinite(size.y) || size.y < 1e-3) {
      return
    }
    const center = box.getCenter(new Vector3())
    cloned.position.set(-center.x, -box.min.y, -center.z)
    fitted.current = true
  })

  const ghost = activeLayer !== 'skin'

  useLayoutEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshStandardMaterial({
          color: SKIN_COLOR,
          roughness: 0.72,
          metalness: 0.02,
          transparent: ghost,
          opacity: ghost ? 0.12 : 1,
          depthWrite: !ghost,
        })
        child.castShadow = !ghost
        child.receiveShadow = !ghost
        child.raycast = () => null // taps handled by hit-proxies
      }
    })
  }, [cloned, ghost])

  return (
    <group ref={root} scale={BODY_MODEL_SCALE}>
      <primitive object={cloned} />
    </group>
  )
}
