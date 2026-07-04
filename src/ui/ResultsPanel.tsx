import { useEffect, useState } from 'react'
import { regionName } from '../anatomy/anatomyMap'
import type { RiskTier } from '../clinical/types'
import { generateProse } from '../llm/proseProvider'
import { useAssessmentStore } from '../state/assessmentStore'
import { Disclaimer } from './Disclaimer'

const TIER_STYLES: Record<RiskTier, { label: string; className: string }> = {
  emergency: {
    label: 'Seek emergency care now',
    className: 'border-red-500 bg-red-950/60 text-red-200',
  },
  urgent: {
    label: 'See a clinician today',
    className: 'border-orange-500 bg-orange-950/60 text-orange-200',
  },
  'primary-care': {
    label: 'Book a doctor visit this week',
    className: 'border-yellow-500 bg-yellow-950/50 text-yellow-200',
  },
  'self-care': {
    label: 'Self-care and monitoring',
    className: 'border-emerald-500 bg-emerald-950/50 text-emerald-200',
  },
}

export function ResultsPanel({ onOpenReport }: { onOpenReport: () => void }) {
  const result = useAssessmentStore((state) => state.result)
  const selectedRegionId = useAssessmentStore((state) => state.selectedRegionId)
  const restart = useAssessmentStore((state) => state.restart)
  const [prose, setProse] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (result) {
      generateProse({ result, audience: 'patient' }).then((text) => {
        if (!cancelled) {
          setProse(text)
        }
      })
    }
    return () => {
      cancelled = true
    }
  }, [result])

  if (!result) {
    return (
      <div className="flex h-full flex-col p-5" data-testid="results-empty">
        <h2 className="text-lg font-semibold text-slate-100">
          {selectedRegionId ? regionName(selectedRegionId) : 'This area'}
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Guided assessment for this area is coming soon. The current prototype covers the full
          head and upper body — head, neck, chest, upper abdomen, upper back, shoulders, arms —
          plus the right lower abdomen.
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Pick another area
        </button>
        <Disclaimer />
      </div>
    )
  }

  const tier = TIER_STYLES[result.tier]
  const maxScore = Math.max(...result.ranked.map((entry) => entry.score), 1)
  const topEntries = result.ranked.filter((entry) => entry.score > 0).slice(0, 4)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-5" data-testid="results">
      <h2 className="text-lg font-semibold text-slate-100">Here’s what we found</h2>

      <div
        className={`mt-3 rounded-xl border px-4 py-3 text-sm font-semibold ${tier.className}`}
        data-testid="tier-banner"
      >
        {tier.label}
      </div>

      {result.triggeredRedFlags.length > 0 ? (
        <div className="mt-3 rounded-xl border border-red-500/60 bg-red-950/40 p-3" data-testid="red-flags">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
            Warning signs in your answers
          </p>
          <ul className="mt-1 list-disc pl-4 text-sm text-red-200">
            {result.triggeredRedFlags.map((flag) => (
              <li key={flag.id}>{flag.label}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-sm font-medium text-slate-300">Possible explanations</p>
      <div className="mt-2 flex flex-col gap-2">
        {topEntries.map((entry) => (
          <div
            key={entry.differential.id}
            className="rounded-xl border border-slate-700 bg-slate-900/60 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">{entry.differential.name}</p>
              <span className="text-xs text-slate-400">
                {Math.round((entry.score / maxScore) * 100)}% match
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-slate-800">
              <div
                className="h-full rounded bg-blue-500"
                style={{ width: `${Math.round((entry.score / maxScore) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {entry.differential.explanation}
            </p>
            {entry.matchedFactors.length > 0 ? (
              <p className="mt-1.5 text-xs text-slate-500">
                Supported by your answers on: {entry.matchedFactors.join(', ')}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {prose ? (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            In plain language
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-300">{prose}</p>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Suggested next steps
        </p>
        <p className="mt-1 text-sm text-slate-300">
          Specialty: {result.ranked[0]?.differential.specialty}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Tests your doctor may consider: {result.ranked[0]?.differential.suggestedTests.join(', ')}
          . These are general suggestions, not diagnostic orders.
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={restart}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          Start over
        </button>
        <button
          type="button"
          onClick={onOpenReport}
          data-testid="open-report"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Doctor-ready report
        </button>
      </div>

      <Disclaimer />
    </div>
  )
}
