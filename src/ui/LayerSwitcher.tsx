import type { AnatomyLayer } from '../anatomy/anatomyMap'
import type { BodySex } from '../scene/modelConfig'
import { useAssessmentStore } from '../state/assessmentStore'

const LAYERS: { id: AnatomyLayer; label: string }[] = [
  { id: 'skin', label: 'Skin' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'organs', label: 'Organs' },
]

const BODIES: { id: BodySex; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
]

export function LayerSwitcher() {
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const setLayer = useAssessmentStore((state) => state.setLayer)
  const bodySex = useAssessmentStore((state) => state.bodySex)
  const setBodySex = useAssessmentStore((state) => state.setBodySex)

  return (
    <div className="no-print absolute left-4 top-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-xl bg-slate-900/80 p-1.5 backdrop-blur">
        <span className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Layer
        </span>
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => setLayer(layer.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              activeLayer === layer.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-xl bg-slate-900/80 p-1.5 backdrop-blur">
        <span className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Body
        </span>
        {BODIES.map((body) => (
          <button
            key={body.id}
            type="button"
            onClick={() => setBodySex(body.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              bodySex === body.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {body.label}
          </button>
        ))}
      </div>
    </div>
  )
}
