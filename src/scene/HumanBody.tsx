import { Suspense, useCallback } from 'react'
import { regionName } from '../anatomy/anatomyMap'
import { useAssessmentStore } from '../state/assessmentStore'
import { boneLabel, regionForBone } from './boneLabels'
import { BodyErrorBoundary } from './BodyErrorBoundary'
import { HoverChip } from './HoverChip'
import { BODY_MODELS, FEMALE_HIT_SCALE, SKELETON_MODELS } from './modelConfig'
import { PainMarker } from './PainMarker'
import { ProceduralBody } from './ProceduralBody'
import { RealisticBody } from './RealisticBody'
import { classifyRegion } from './regionClassifier'
import type { Point3 } from './regionClassifier'

const SKIN_MATERIAL = { color: '#d9c3b0', roughness: 0.7 }
const SKIN_GHOST_MATERIAL = { color: '#8ba6c8', roughness: 0.6, ghost: true }
const BONE_MATERIAL = { color: '#f2eee2', roughness: 0.5, metalness: 0.04 }
// Depth offset for the whole organ group (the primitives are laid out on the
// MALE envelope). Male nests them back off the belly; the female is shallower
// and her head/torso sit further forward, so the same layout (even scaled by
// FEMALE_HIT_SCALE) lands too deep and the brain breaches the back of her skull
// — she needs a forward shift. Measured: female head interior centre ≈ −0.05 at
// brain height, so +0.025 here centres the scaled brain in it.
const ORGAN_Z_OFFSET: Record<'male' | 'female', number> = {
  male: -0.04,
  female: 0.025,
}
// Female organs are the (larger) male layout at FEMALE_HIT_SCALE. Trim every
// organ but the brain to an effective 0.85 (0.85 / FEMALE_HIT_SCALE cancels the
// group scale), leaving the brain full-size, and lift the bladder so it clears
// the groin. Male is untouched (scale 1, no lift).
const FEMALE_ORGAN_SIZE = 0.85 / FEMALE_HIT_SCALE
const FEMALE_PART_LIFT = { bladder: 0.09 }
// The skeleton GLB and skin GLB are each centered on their own vertex centroid,
// but the skeleton's ribcage mass sits forward of the body's centroid, so it
// lands too far forward. Shift it back to align the two depth midpoints (even
// tissue margin front and back). The two exports differ in depth, so the offset
// is measured per sex: male body/skel midpoints −0.029/+0.038 → −0.066; female
// −0.034/−0.019 → −0.015.
const SKELETON_Z_OFFSET: Record<'male' | 'female', number> = {
  male: -0.066,
  female: -0.015,
}

export function HumanBody() {
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const bodySex = useAssessmentStore((state) => state.bodySex)
  const tapPoint = useAssessmentStore((state) => state.tapPoint)
  const backView = useAssessmentStore((state) => state.backView)
  const selectRegion = useAssessmentStore((state) => state.selectRegion)

  const modelUrl = BODY_MODELS[bodySex]
  const skeletonUrl = SKELETON_MODELS[bodySex]
  const deeper = activeLayer !== 'skin'
  // Primitive internals are laid out on the male envelope; female shares them at
  // a proportional scale. Used for organs, and as the skeleton fallback.
  const internalScale = bodySex === 'female' ? FEMALE_HIT_SCALE : 1

  // Skin-layer taps raycast the VISIBLE body mesh and classify the true surface
  // hit point — no invisible proxy volumes that can drift out of alignment or
  // occlude other body parts. Events arrive in world space; the whole body group
  // is rotated π for the back view, so un-rotate back into body-local space
  // before classifying.
  const regionForSkin = useCallback(
    (_name: string, point: Point3) => {
      const local = backView ? { x: -point.x, y: point.y, z: -point.z } : point
      return classifyRegion(local, bodySex)
    },
    [backView, bodySex],
  )
  const hoverLabelForSkin = useCallback(
    (name: string, point: Point3) => regionName(regionForSkin(name, point)),
    [regionForSkin],
  )
  const skinInteractive = activeLayer === 'skin'

  // Bone labels/regions are position-based too — un-rotate the hit point for the
  // back view so side (L/R) and depth (scapula vs clavicle) read correctly.
  const toLocal = useCallback(
    (point: Point3): Point3 => (backView ? { x: -point.x, y: point.y, z: -point.z } : point),
    [backView],
  )
  const boneLabelLocal = useCallback(
    (name: string, point: Point3) => boneLabel(name, toLocal(point)),
    [toLocal],
  )
  const regionForBoneLocal = useCallback(
    (name: string, point: Point3) => regionForBone(name, toLocal(point)),
    [toLocal],
  )

  const skinFallback = (
    <ProceduralBody
      activeLayer={activeLayer}
      interactive={skinInteractive}
      onSelect={selectRegion}
    />
  )

  return (
    <group rotation={[0, backView ? Math.PI : 0, 0]}>
      {/* Skin body — solid + tappable on the skin layer, ghosted for context
          under a deeper one. */}
      <BodyErrorBoundary key={`body-${modelUrl}`} fallback={skinFallback}>
        <Suspense fallback={skinFallback}>
          <RealisticBody
            url={modelUrl}
            material={deeper ? SKIN_GHOST_MATERIAL : SKIN_MATERIAL}
            hoverLabelFor={skinInteractive ? hoverLabelForSkin : undefined}
            regionFor={skinInteractive ? regionForSkin : undefined}
            onSelect={skinInteractive ? selectRegion : undefined}
          />
        </Suspense>
      </BodyErrorBoundary>

      {/* Realistic skeleton overlay on the skeleton layer. */}
      {activeLayer === 'skeleton' ? (
        <BodyErrorBoundary
          key={`skel-${skeletonUrl}`}
          fallback={
            <group scale={internalScale}>
              <ProceduralBody activeLayer="skeleton" internalOnly />
            </group>
          }
        >
          <Suspense fallback={null}>
            <group position={[0, 0, SKELETON_Z_OFFSET[bodySex]]}>
              <RealisticBody
                url={skeletonUrl}
                material={BONE_MATERIAL}
                hoverLabelFor={boneLabelLocal}
                regionFor={regionForBoneLocal}
                onSelect={selectRegion}
              />
            </group>
          </Suspense>
        </BodyErrorBoundary>
      ) : null}

      {/* Organs remain primitive (no organ mesh supplied yet) — interactive so
          each organ names itself on hover and taps start an assessment. */}
      {activeLayer === 'organs' ? (
        <group scale={internalScale} position={[0, 0, ORGAN_Z_OFFSET[bodySex]]}>
          <ProceduralBody
            activeLayer="organs"
            internalOnly
            interactive
            onSelect={selectRegion}
            organSizeScale={bodySex === 'female' ? FEMALE_ORGAN_SIZE : 1}
            partLift={bodySex === 'female' ? FEMALE_PART_LIFT : undefined}
          />
        </group>
      ) : null}

      {tapPoint ? <PainMarker point={tapPoint} /> : null}
      <HoverChip />
    </group>
  )
}
