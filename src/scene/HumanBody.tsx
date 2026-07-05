import { Suspense } from 'react'
import { useAssessmentStore } from '../state/assessmentStore'
import { boneLabel, regionForBone } from './boneLabels'
import { BodyErrorBoundary } from './BodyErrorBoundary'
import { HitProxies } from './HitProxies'
import { FEMALE_HIT_SCALE } from './hitRegions'
import { HoverChip } from './HoverChip'
import { BODY_MODELS, SKELETON_MODELS } from './modelConfig'
import { PainMarker } from './PainMarker'
import { ProceduralBody } from './ProceduralBody'
import { RealisticBody } from './RealisticBody'

const SKIN_MATERIAL = { color: '#d9c3b0', roughness: 0.7 }
const SKIN_GHOST_MATERIAL = { color: '#8ba6c8', roughness: 0.6, ghost: true }
const BONE_MATERIAL = { color: '#f2eee2', roughness: 0.5, metalness: 0.04 }
// Nudge the whole organ group back so it nests inside the torso rather than
// bulging toward the belly.
const ORGAN_Z_OFFSET = -0.04
// The skeleton GLB and skin GLB are each centered on their own vertex centroid,
// but the skeleton's ribcage mass sits forward of the body's centroid, so it
// lands too far forward. Shift it back to align the two depth midpoints (even
// tissue margin front and back). The two exports differ in depth, so the offset
// is measured per sex: male body/skel midpoints −0.029/+0.038 → −0.066; female
// −0.034/−0.029 → −0.005.
const SKELETON_Z_OFFSET: Record<'male' | 'female', number> = {
  male: -0.066,
  female: -0.005,
}

export function HumanBody() {
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const bodySex = useAssessmentStore((state) => state.bodySex)
  const selectedRegionId = useAssessmentStore((state) => state.selectedRegionId)
  const tapPoint = useAssessmentStore((state) => state.tapPoint)
  const backView = useAssessmentStore((state) => state.backView)
  const selectRegion = useAssessmentStore((state) => state.selectRegion)

  const modelUrl = BODY_MODELS[bodySex]
  const skeletonUrl = SKELETON_MODELS[bodySex]
  const deeper = activeLayer !== 'skin'
  const skinFallback = <ProceduralBody activeLayer={activeLayer} />
  // Primitive internals are laid out on the male envelope; female shares them at
  // her hit-region scale. Used for organs, and as the skeleton fallback.
  const internalScale = bodySex === 'female' ? FEMALE_HIT_SCALE : 1

  return (
    <group rotation={[0, backView ? Math.PI : 0, 0]}>
      {/* Skin body — solid on the skin layer, ghosted for context under a deeper one. */}
      <BodyErrorBoundary key={`body-${modelUrl}`} fallback={skinFallback}>
        <Suspense fallback={skinFallback}>
          <RealisticBody url={modelUrl} material={deeper ? SKIN_GHOST_MATERIAL : SKIN_MATERIAL} />
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
                hoverLabelFor={boneLabel}
                regionFor={regionForBone}
                onSelect={selectRegion}
              />
            </group>
          </Suspense>
        </BodyErrorBoundary>
      ) : null}

      {/* Organs remain primitive (no organ mesh supplied yet) — interactive so
          each organ names itself on hover and taps start an assessment. */}
      {activeLayer === 'organs' ? (
        <group scale={internalScale} position={[0, 0, ORGAN_Z_OFFSET]}>
          <ProceduralBody activeLayer="organs" internalOnly interactive onSelect={selectRegion} />
        </group>
      ) : null}

      <HitProxies selectedRegionId={selectedRegionId} onSelect={selectRegion} />
      {tapPoint ? <PainMarker point={tapPoint} /> : null}
      <HoverChip />
    </group>
  )
}
