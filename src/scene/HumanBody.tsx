import { Suspense } from 'react'
import { useAssessmentStore } from '../state/assessmentStore'
import { BodyErrorBoundary } from './BodyErrorBoundary'
import { HitProxies } from './HitProxies'
import { FEMALE_HIT_SCALE } from './hitRegions'
import { BODY_MODELS, SKELETON_MODELS } from './modelConfig'
import { PainMarker } from './PainMarker'
import { ProceduralBody } from './ProceduralBody'
import { RealisticBody } from './RealisticBody'

const SKIN_MATERIAL = { color: '#d9c3b0', roughness: 0.7 }
const SKIN_GHOST_MATERIAL = { color: '#8ba6c8', roughness: 0.6, ghost: true }
const BONE_MATERIAL = { color: '#f2eee2', roughness: 0.5, metalness: 0.04 }

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
            <RealisticBody url={skeletonUrl} material={BONE_MATERIAL} />
          </Suspense>
        </BodyErrorBoundary>
      ) : null}

      {/* Organs remain primitive (no organ mesh supplied yet). */}
      {activeLayer === 'organs' ? (
        <group scale={internalScale}>
          <ProceduralBody activeLayer="organs" internalOnly />
        </group>
      ) : null}

      <HitProxies selectedRegionId={selectedRegionId} onSelect={selectRegion} />
      {tapPoint ? <PainMarker point={tapPoint} /> : null}
    </group>
  )
}
