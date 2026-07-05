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

interface PosedBounds {
  box: Box3
  /** Mean of sampled posed vertices — the horizontal midline for a symmetric
   * body, robust to asymmetric finger splay (unlike the bbox min/max center)
   * and to a root anchor that isn't on the mesh's true midline. */
  centroid: Vector3
}

/**
 * Bounds of the model as actually posed on screen, measured in `object`'s local
 * space. Must run after a frame has rendered so the skeleton is posed — only
 * then does applyBoneTransform give true positions for skinned meshes. Static
 * meshes fall back to geometry bounds. Vertices are sampled for speed.
 */
function posedBounds(object: Group): PosedBounds {
  object.updateWorldMatrix(true, true)
  const inverseRoot = object.matrixWorld.clone().invert()
  const box = new Box3()
  const sum = new Vector3()
  let count = 0
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
        sum.add(vertex)
        count += 1
      }
    } else {
      mesh.geometry.computeBoundingBox()
      const geoBox = mesh.geometry.boundingBox
      if (geoBox) {
        box.union(geoBox.clone().applyMatrix4(relative))
      }
    }
  })

  const centroid = count > 0 ? sum.divideScalar(count) : box.getCenter(new Vector3())
  return { box, centroid }
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
    const { box, centroid } = posedBounds(cloned)
    if (box.isEmpty()) {
      return
    }
    const size = box.getSize(new Vector3())
    if (!Number.isFinite(size.y) || size.y < 1e-3) {
      return
    }
    // Horizontal centering uses the vertex centroid (the true midline of a
    // symmetric body), not the root anchor — some exports place the root off the
    // mesh midline. Feet are grounded from the box. Body and skeleton share a
    // midline, so both centre on 0 and stay overlaid.
    cloned.position.set(-centroid.x, -box.min.y, -centroid.z)
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
          opacity: ghost ? 0.22 : 1,
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
