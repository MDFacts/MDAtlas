import { Suspense } from 'react'
import { useAssessmentStore } from '../state/assessmentStore'
import { BodyErrorBoundary } from './BodyErrorBoundary'
import { HitProxies } from './HitProxies'
import { BODY_MODEL_URL } from './modelConfig'
import { PainMarker } from './PainMarker'
import { ProceduralBody } from './ProceduralBody'
import { RealisticBody } from './RealisticBody'
import { useModelAvailable } from './useModelAvailable'

export function HumanBody() {
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const selectedRegionId = useAssessmentStore((state) => state.selectedRegionId)
  const tapPoint = useAssessmentStore((state) => state.tapPoint)
  const backView = useAssessmentStore((state) => state.backView)
  const selectRegion = useAssessmentStore((state) => state.selectRegion)
  const modelState = useModelAvailable(BODY_MODEL_URL)

  const fallback = <ProceduralBody activeLayer={activeLayer} />
  const showInternalParts = activeLayer !== 'skin'
  const useRealistic = modelState === 'available'

  return (
    <group rotation={[0, backView ? Math.PI : 0, 0]}>
      {useRealistic ? (
        <BodyErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <RealisticBody activeLayer={activeLayer} />
            {/* Internal structures still come from the anatomical primitives. */}
            {showInternalParts ? <ProceduralBody activeLayer={activeLayer} internalOnly /> : null}
          </Suspense>
        </BodyErrorBoundary>
      ) : (
        fallback
      )}

      <HitProxies selectedRegionId={selectedRegionId} onSelect={selectRegion} />
      {tapPoint ? <PainMarker point={tapPoint} /> : null}
    </group>
  )
}
