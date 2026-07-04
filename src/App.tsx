import { useEffect, useState } from 'react'
import { BodyViewport } from './scene/BodyViewport'
import { useAssessmentStore } from './state/assessmentStore'
import { AttributionNote } from './ui/AttributionNote'
import { Disclaimer } from './ui/Disclaimer'
import { DoctorReport } from './ui/DoctorReport'
import { LockIcon, PulseIcon, ShieldIcon, SparkIcon } from './ui/icons'
import { InterviewPanel } from './ui/InterviewPanel'
import { LayerSwitcher } from './ui/LayerSwitcher'
import { PainInputPanel } from './ui/PainInputPanel'
import { ResultsPanel } from './ui/ResultsPanel'

declare global {
  interface Window {
    __mdatlas?: {
      selectRegion: (regionId: string) => void
    }
  }
}

const TRUST = [
  { icon: SparkIcon, label: 'AI-Powered' },
  { icon: ShieldIcon, label: 'Evidence-Based' },
  { icon: LockIcon, label: 'Private & Secure' },
]

function Header() {
  return (
    <header className="no-print sticky top-0 z-30 glass">
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b from-blue-500 to-brand-deep text-white shadow-[0_6px_16px_rgba(37,99,235,0.35)]">
            <PulseIcon width={20} height={20} strokeWidth={2} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight text-ink">
              MD<span className="text-brand">Atlas</span>
            </div>
            <div className="hidden text-[11px] text-muted sm:block">
              Map your body. Understand your health.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 lg:flex">
            {TRUST.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-ink-soft"
              >
                <Icon width={13} height={13} className="text-brand" />
                {label}
              </span>
            ))}
          </div>
          <span className="rounded-full border border-line bg-white/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
            Prototype
          </span>
        </div>
      </div>
    </header>
  )
}

function ExplorePanel() {
  return (
    <div className="flex h-full flex-col p-6">
      <span className="eyebrow reveal" style={{ animationDelay: '40ms' }}>
        Step 01 · Select area
      </span>
      <h2
        className="reveal mt-2 font-display text-2xl font-bold leading-tight text-ink"
        style={{ animationDelay: '90ms' }}
      >
        Where does it hurt?
      </h2>
      <p
        className="reveal mt-3 text-sm leading-relaxed text-ink-soft"
        style={{ animationDelay: '150ms' }}
      >
        Rotate the body, peel through anatomy layers, and tap exactly where you feel pain. MDAtlas
        asks a few smart questions and helps you understand what could be going on — and how soon to
        see someone.
      </p>

      <div className="reveal card-tint mt-6 p-4" style={{ animationDelay: '220ms' }}>
        <span className="eyebrow">Guided assessments live now</span>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {['Head & neck', 'Chest', 'Upper abdomen', 'Upper back', 'Shoulders & arms', 'Lower abdomen'].map(
            (region) => (
              <span
                key={region}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-2 text-xs font-semibold text-ink-soft"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand to-cyan" />
                {region}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="mt-auto">
        <Disclaimer />
      </div>
    </div>
  )
}

export default function App() {
  const phase = useAssessmentStore((state) => state.phase)
  const result = useAssessmentStore((state) => state.result)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    window.__mdatlas = {
      selectRegion: (regionId: string) =>
        useAssessmentStore.getState().selectRegion(regionId, { x: 0, y: 2, z: 0.3 }),
    }
    return () => {
      delete window.__mdatlas
    }
  }, [])

  useEffect(() => {
    if (phase !== 'results') {
      setShowReport(false)
    }
  }, [phase])

  return (
    <div className="flex h-full flex-col text-ink">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:flex-row">
        <section className="relative min-h-[46vh] flex-1 overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-b from-white/50 to-white/10 shadow-[0_20px_60px_rgba(23,55,110,0.10)]">
          <BodyViewport />
          <LayerSwitcher />
          <AttributionNote />
        </section>

        <aside className="glass flex w-full flex-col overflow-hidden rounded-3xl md:w-[430px]">
          <div className="min-h-0 flex-1 overflow-y-auto" key={phase}>
            {phase === 'explore' ? <ExplorePanel /> : null}
            {phase === 'pain-input' ? <PainInputPanel /> : null}
            {phase === 'interview' ? <InterviewPanel /> : null}
            {phase === 'results' ? <ResultsPanel onOpenReport={() => setShowReport(true)} /> : null}
          </div>
        </aside>
      </main>

      {showReport && result ? (
        <DoctorReport result={result} onClose={() => setShowReport(false)} />
      ) : null}
    </div>
  )
}
