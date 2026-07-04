import { Suspense } from 'react'
import { useAssessmentStore } from '../state/assessmentStore'
import { BodyErrorBoundary } from './BodyErrorBoundary'
import { HitProxies } from './HitProxies'
import { BODY_MODELS } from './modelConfig'
import { PainMarker } from './PainMarker'
import { ProceduralBody } from './ProceduralBody'
import { RealisticBody } from './RealisticBody'

export function HumanBody() {
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const bodySex = useAssessmentStore((state) => state.bodySex)
  const selectedRegionId = useAssessmentStore((state) => state.selectedRegionId)
  const tapPoint = useAssessmentStore((state) => state.tapPoint)
  const backView = useAssessmentStore((state) => state.backView)
  const selectRegion = useAssessmentStore((state) => state.selectRegion)

  const modelUrl = BODY_MODELS[bodySex]
  const fallback = <ProceduralBody activeLayer={activeLayer} />
  const showInternalParts = activeLayer !== 'skin'

  return (
    <group rotation={[0, backView ? Math.PI : 0, 0]}>
      {/* Realistic GLB with a graceful procedural fallback if a model is missing. */}
      <BodyErrorBoundary key={modelUrl} fallback={fallback}>
        <Suspense fallback={fallback}>
          <RealisticBody url={modelUrl} activeLayer={activeLayer} />
          {/* Internal structures still come from the anatomical primitives. */}
          {showInternalParts ? <ProceduralBody activeLayer={activeLayer} internalOnly /> : null}
        </Suspense>
      </BodyErrorBoundary>

      <HitProxies selectedRegionId={selectedRegionId} onSelect={selectRegion} />
      {tapPoint ? <PainMarker point={tapPoint} /> : null}
    </group>
  )
}
