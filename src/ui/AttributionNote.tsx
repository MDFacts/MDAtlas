import { useAssessmentStore } from '../state/assessmentStore'

const CREDITS = {
  male: 'Adapted MetaHuman-style base mesh',
  female: 'Adapted from base mesh by camilooh (CC-BY)',
} as const

/** Demo-mode attribution: kept present but visually quiet in the far corner. */
export function AttributionNote() {
  const bodySex = useAssessmentStore((state) => state.bodySex)

  return (
    <div className="no-print pointer-events-none absolute bottom-1 right-1.5 text-[9px] leading-none text-slate-500 opacity-30">
      {CREDITS[bodySex]}
    </div>
  )
}
