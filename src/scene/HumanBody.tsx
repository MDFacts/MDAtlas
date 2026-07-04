import { useAssessmentStore } from '../state/assessmentStore'
import { BODY_PARTS } from './bodyGeometry'
import { PainMarker } from './PainMarker'
import { RegionMesh } from './RegionMesh'

export function HumanBody() {
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const selectedRegionId = useAssessmentStore((state) => state.selectedRegionId)
  const tapPoint = useAssessmentStore((state) => state.tapPoint)
  const backView = useAssessmentStore((state) => state.backView)
  const selectRegion = useAssessmentStore((state) => state.selectRegion)

  const showSkinGhost = activeLayer !== 'skin'

  const visibleParts = BODY_PARTS.filter((part) => {
    if (part.layer === activeLayer) {
      return true
    }
    return part.layer === 'skin' && showSkinGhost
  })

  return (
    <group rotation={[0, backView ? Math.PI : 0, 0]}>
      {visibleParts.map((part) => (
        <RegionMesh
          key={part.key}
          part={part}
          ghosted={part.layer === 'skin' && showSkinGhost}
          selected={part.regionId === selectedRegionId}
          onSelect={selectRegion}
        />
      ))}
      {tapPoint ? <PainMarker point={tapPoint} /> : null}
    </group>
  )
}
