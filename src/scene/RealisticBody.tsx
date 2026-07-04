import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, Color, Matrix4, Mesh, MeshStandardMaterial, SkinnedMesh, Vector3 } from 'three'
import type { Group } from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { BODY_MODEL_SCALE } from './modelConfig'

const MAX_SAMPLES = 4000

export interface BodyMaterial {
  color: string
  roughness: number
  metalness?: number
  /** Ghosted = translucent silhouette (used for context under a deeper layer). */
  ghost?: boolean
}

/**
 * Bounds of the model as actually posed on screen, measured in `object`'s local
 * space. Must run after a frame has rendered so the skeleton is posed — only
 * then does applyBoneTransform give true positions for skinned meshes. Static
 * meshes fall back to geometry bounds. Vertices are sampled for speed.
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
 * Loads and displays a realistic GLB (skin body or skeleton) that shares the
 * normalized coordinate space. A single BODY_MODEL_SCALE is applied to the root;
 * the model is re-centered/grounded from its posed bounds once the pose is live.
 * Because the body and skeleton share centering and feet, applying this to each
 * keeps them overlaid. Material is configurable (skin tone vs bone, ghosted or
 * solid).
 */
export function RealisticBody({ url, material }: { url: string; material: BodyMaterial }) {
  const { scene } = useGLTF(url)
  const root = useRef<Group>(null)
  const fitted = useRef(false)

  // SkeletonUtils.clone preserves skinned-mesh bindings that Object3D.clone breaks.
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as Group, [scene])

  useLayoutEffect(() => {
    fitted.current = false
    cloned.position.set(0, 0, 0)
  }, [cloned])

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

  const ghost = material.ghost ?? false
  const color = useMemo(() => new Color(material.color), [material.color])

  useLayoutEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshStandardMaterial({
          color,
          roughness: material.roughness,
          metalness: material.metalness ?? 0.02,
          transparent: ghost,
          opacity: ghost ? 0.18 : 1,
          depthWrite: !ghost,
        })
        child.castShadow = !ghost
        child.receiveShadow = !ghost
        child.raycast = () => null // taps handled by hit-proxies
      }
    })
  }, [cloned, ghost, color, material.roughness, material.metalness])

  return (
    <group ref={root} scale={BODY_MODEL_SCALE}>
      <primitive object={cloned} />
    </group>
  )
}
