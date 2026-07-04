import type { ComponentType, SVGProps } from 'react'
import type { AnatomyLayer } from '../anatomy/anatomyMap'
import type { BodySex } from '../scene/modelConfig'
import { useAssessmentStore } from '../state/assessmentStore'
import { OrganIcon, SkeletonIcon, SkinIcon } from './icons'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const LAYERS: { id: AnatomyLayer; label: string; icon: IconType }[] = [
  { id: 'skin', label: 'Skin', icon: SkinIcon },
  { id: 'skeleton', label: 'Skeleton', icon: SkeletonIcon },
  { id: 'organs', label: 'Organs', icon: OrganIcon },
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
    <div className="no-print absolute left-4 top-4 flex flex-col gap-2.5">
      <div className="glass rounded-2xl p-2">
        <span className="eyebrow block px-1.5 pb-1.5 pt-0.5">Layer</span>
        <div className="flex flex-col gap-1">
          {LAYERS.map(({ id, label, icon: Icon }) => {
            const active = activeLayer === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLayer(id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-gradient-to-b from-blue-500 to-brand-deep text-white shadow-[0_6px_14px_rgba(37,99,235,0.32)]'
                    : 'text-ink-soft hover:bg-brand-tint'
                }`}
              >
                <Icon width={16} height={16} className={active ? 'text-white' : 'text-brand'} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-2">
        <span className="eyebrow block px-1.5 pb-1.5 pt-0.5">Body</span>
        <div className="flex gap-1">
          {BODIES.map(({ id, label }) => {
            const active = bodySex === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setBodySex(id)}
                className={`flex-1 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-gradient-to-b from-blue-500 to-brand-deep text-white shadow-[0_6px_14px_rgba(37,99,235,0.32)]'
                    : 'text-ink-soft hover:bg-brand-tint'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
