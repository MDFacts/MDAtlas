import { useEffect, useState } from 'react'
import { regionName } from '../anatomy/anatomyMap'
import { packForRegion } from '../clinical/packs/index'
import type { AssessmentResult } from '../clinical/types'
import { generateProse } from '../llm/proseProvider'
import { PulseIcon } from './icons'

function questionTextFor(result: AssessmentResult, questionId: string): string {
  const pack = packForRegion(result.regionId)
  if (!pack) {
    return questionId
  }
  const node = Object.values(pack.nodes).find((entry) => entry.question.id === questionId)
  return node?.question.text ?? questionId
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mt-7 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
      {children}
    </h2>
  )
}

export function DoctorReport({ result, onClose }: { result: AssessmentResult; onClose: () => void }) {
  const [summary, setSummary] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    generateProse({ result, audience: 'doctor' }).then((text) => {
      if (!cancelled) {
        setSummary(text)
      }
    })
    return () => {
      cancelled = true
    }
  }, [result])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-canvas p-4 sm:p-8" data-testid="doctor-report">
      <div className="mx-auto max-w-2xl">
        <div className="no-print mb-5 flex justify-between">
          <button type="button" onClick={onClose} className="btn btn-ghost px-4 py-2 text-sm">
            ← Back
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary px-4 py-2 text-sm"
          >
            Print / Save as PDF
          </button>
        </div>

        <div className="card p-7 text-ink sm:p-9">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-blue-500 to-brand-deep text-white">
              <PulseIcon width={20} height={20} strokeWidth={2} />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold">MDAtlas Symptom Report</h1>
              <p className="text-xs text-muted">
                Generated {new Date().toLocaleDateString()} · patient-reported, not a diagnosis
              </p>
            </div>
          </div>

          <SectionTitle>Primary concern</SectionTitle>
          <p className="mt-1.5 text-sm text-ink-soft">
            <b className="text-ink">{result.pain.painTypes.join(', ')}</b> pain —{' '}
            {regionName(result.regionId)}, severity{' '}
            <b className="text-ink">{result.pain.severity}/10</b>, started: {result.pain.onset}
            {result.pain.radiatesTo ? `, radiates to ${result.pain.radiatesTo}` : ''}
          </p>
          {result.pain.worseFactors.length > 0 ? (
            <p className="mt-1 text-sm text-ink-soft">
              Aggravated by: {result.pain.worseFactors.join(', ')}
            </p>
          ) : null}
          {result.pain.betterFactors.length > 0 ? (
            <p className="mt-1 text-sm text-ink-soft">
              Relieved by: {result.pain.betterFactors.join(', ')}
            </p>
          ) : null}

          {summary ? (
            <>
              <SectionTitle>Clinical summary</SectionTitle>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{summary}</p>
            </>
          ) : null}

          <SectionTitle>Interview responses</SectionTitle>
          <table className="mt-2 w-full border-collapse text-sm">
            <tbody>
              {Object.entries(result.answers).map(([questionId, value]) => (
                <tr key={questionId} className="border-b border-line">
                  <td className="py-2 pr-4 text-ink-soft">{questionTextFor(result, questionId)}</td>
                  <td className="py-2 text-right font-semibold capitalize text-ink">
                    {value.replace(/-/g, ' ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.triggeredRedFlags.length > 0 ? (
            <>
              <h2 className="mt-7 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red-600">
                Flags for review
              </h2>
              <ul className="mt-1.5 space-y-1 text-sm text-red-700">
                {result.triggeredRedFlags.map((flag) => (
                  <li key={flag.id} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                    {flag.label}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <SectionTitle>Weighted considerations</SectionTitle>
          <ul className="mt-1.5 space-y-1 text-sm text-ink-soft">
            {result.ranked
              .filter((entry) => entry.score > 0)
              .slice(0, 4)
              .map((entry) => (
                <li key={entry.differential.id} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  <span>
                    <b className="text-ink">{entry.differential.name}</b> — score {entry.score}
                    {entry.matchedFactors.length > 0
                      ? ` (supported by: ${entry.matchedFactors.join(', ')})`
                      : ''}
                  </span>
                </li>
              ))}
          </ul>

          <SectionTitle>Tests that may be considered</SectionTitle>
          <p className="mt-1.5 text-sm text-ink-soft">
            {result.ranked[0]?.differential.suggestedTests.join(', ')} — general suggestions only, at
            the treating clinician’s discretion.
          </p>

          <p className="mt-8 border-t border-line pt-4 text-xs text-muted">
            MDAtlas by MDfacts.ai — AI-assisted symptom assessment for education and doctor
            preparation. Not a medical device; does not provide diagnoses.
          </p>
        </div>
      </div>
    </div>
  )
}
