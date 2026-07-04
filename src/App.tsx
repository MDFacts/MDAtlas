import { useEffect, useState } from 'react'
import { BodyViewport } from './scene/BodyViewport'
import { useAssessmentStore } from './state/assessmentStore'
import { Disclaimer } from './ui/Disclaimer'
import { DoctorReport } from './ui/DoctorReport'
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

function ExplorePanel() {
  return (
    <div className="flex h-full flex-col p-5">
      <h2 className="text-lg font-semibold text-slate-100">Where does it hurt?</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Rotate the body, switch anatomy layers, and tap exactly where you feel pain. MDAtlas will
        ask a few smart questions and help you understand what could be going on — and how soon to
        see someone.
      </p>
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">Guided assessments live in this prototype:</p>
        <ul className="mt-1 list-disc pl-4">
          <li>Head and neck</li>
          <li>Chest, upper abdomen, upper back</li>
          <li>Shoulders and arms</li>
          <li>Right lower abdomen</li>
        </ul>
      </div>
      <Disclaimer />
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
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <header className="no-print flex items-center justify-between border-b border-slate-800 px-5 py-3">
        <div>
          <span className="text-lg font-bold tracking-tight">
            MD<span className="text-blue-500">Atlas</span>
          </span>
          <span className="ml-3 hidden text-xs text-slate-500 sm:inline">
            Map your body. Understand your health.
          </span>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
          Prototype — educational use only
        </span>
      </header>

      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="relative min-h-[50vh] flex-1">
          <BodyViewport />
          <LayerSwitcher />
        </section>
        <aside className="w-full border-t border-slate-800 md:w-[420px] md:border-l md:border-t-0">
          {phase === 'explore' ? <ExplorePanel /> : null}
          {phase === 'pain-input' ? <PainInputPanel /> : null}
          {phase === 'interview' ? <InterviewPanel /> : null}
          {phase === 'results' ? <ResultsPanel onOpenReport={() => setShowReport(true)} /> : null}
        </aside>
      </main>

      {showReport && result ? (
        <DoctorReport result={result} onClose={() => setShowReport(false)} />
      ) : null}
    </div>
  )
}
