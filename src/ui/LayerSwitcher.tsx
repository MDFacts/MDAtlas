import { useEffect, useRef, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import type { AnatomyLayer } from '../anatomy/anatomyMap'
import type { BodySex } from '../scene/modelConfig'
import { useAssessmentStore } from '../state/assessmentStore'
import { CloseIcon, MenuIcon, OrganIcon, SkeletonIcon, SkinIcon } from './icons'

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
  // Collapsed by default on mobile; always open (and toggle hidden) on md+.
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close the mobile menu when tapping anywhere outside it (e.g. the model).
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <div ref={rootRef} className="no-print absolute left-4 top-4 flex flex-col items-start gap-2.5">
      {/* Mobile-only toggle — a menu icon that expands the panels. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Hide controls' : 'Show controls'}
        aria-expanded={open}
        className="glass grid h-10 w-10 place-items-center rounded-2xl text-ink-soft transition hover:text-brand md:hidden"
      >
        {open ? (
          <CloseIcon width={18} height={18} className="text-brand" />
        ) : (
          <MenuIcon width={18} height={18} className="text-brand" />
        )}
      </button>

      {/* Panels — hidden on mobile until opened, always shown on md+. */}
      <div className={`${open ? 'flex' : 'hidden'} flex-col gap-2.5 md:flex`}>
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
    </div>
  )
}
