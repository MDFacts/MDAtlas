import type { AnatomyLayer } from '../anatomy/anatomyMap'
import { useAssessmentStore } from '../state/assessmentStore'

const LAYERS: { id: AnatomyLayer; label: string }[] = [
  { id: 'skin', label: 'Skin' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'organs', label: 'Organs' },
]

export function LayerSwitcher() {
  const activeLayer = useAssessmentStore((state) => state.activeLayer)
  const setLayer = useAssessmentStore((state) => state.setLayer)

  return (
    <div className="no-print absolute left-4 top-4 flex flex-col gap-1 rounded-xl bg-slate-900/80 p-1.5 backdrop-blur">
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
  )
}
