import { useEffect, useState } from 'react'
import { regionName } from '../anatomy/anatomyMap'
import type { RiskTier } from '../clinical/types'
import { generateProse } from '../llm/proseProvider'
import { useAssessmentStore } from '../state/assessmentStore'
import { Disclaimer } from './Disclaimer'

interface TierStyle {
  label: string
  timeframe: string
  ring: string
  badge: string
  text: string
  glyph: string
}

const TIER_STYLES: Record<RiskTier, TierStyle> = {
  emergency: {
    label: 'Seek emergency care now',
    timeframe: 'Go to an ER or call emergency services',
    ring: 'border-red-200 bg-red-50',
    badge: 'bg-red-600',
    text: 'text-red-700',
    glyph: 'M12 3 2 21h20L12 3Zm0 6v5m0 3h.01',
  },
  urgent: {
    label: 'See a clinician today',
    timeframe: 'Urgent care or same-day appointment',
    ring: 'border-orange-200 bg-orange-50',
    badge: 'bg-orange-500',
    text: 'text-orange-700',
    glyph: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  'primary-care': {
    label: 'Book a doctor visit this week',
    timeframe: 'Routine primary-care appointment',
    ring: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-500',
    text: 'text-amber-700',
    glyph: 'M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  },
  'self-care': {
    label: 'Self-care and monitoring',
    timeframe: 'Watch for changes; care for it at home',
    ring: 'border-emerald-200 bg-emerald-50',
    badge: 'bg-emerald-500',
    text: 'text-emerald-700',
    glyph: 'M20 6 9 17l-5-5',
  },
}

function TierBadge({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
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
      <div className="flex h-full flex-col p-6" data-testid="results-empty">
        <span className="eyebrow">Coming soon</span>
        <h2 className="mt-2 font-display text-xl font-bold text-ink">
          {selectedRegionId ? regionName(selectedRegionId) : 'This area'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Guided assessment for this area is on the way. This prototype covers the full head and
          upper body — head, neck, chest, upper abdomen, upper back, shoulders, arms — plus the
          right lower abdomen.
        </p>
        <button type="button" onClick={restart} className="btn btn-primary mt-6 px-4 py-2.5 text-sm">
          Pick another area
        </button>
        <Disclaimer />
      </div>
    )
  }

  const tier = TIER_STYLES[result.tier]
  const maxScore = Math.max(...result.ranked.map((entry) => entry.score), 1)
  const topEntries = result.ranked.filter((entry) => entry.score > 0).slice(0, 4)
  const top = result.ranked[0]

  return (
    <div className="flex h-full flex-col p-6" data-testid="results">
      <span className="eyebrow reveal">Step 04 · What we found</span>
      <h2 className="reveal mt-2 font-display text-2xl font-bold leading-tight text-ink" style={{ animationDelay: '60ms' }}>
        Here’s what we found
      </h2>

      {/* Risk tier banner */}
      <div
        className={`reveal mt-4 flex items-center gap-3.5 rounded-2xl border p-4 ${tier.ring}`}
        style={{ animationDelay: '120ms' }}
        data-testid="tier-banner"
      >
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tier.badge} shadow-lg`}>
          <TierBadge path={tier.glyph} />
        </span>
        <div>
          <p className={`text-[15px] font-bold leading-tight ${tier.text}`}>{tier.label}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{tier.timeframe}</p>
        </div>
      </div>

      {result.triggeredRedFlags.length > 0 ? (
        <div
          className="reveal mt-3 rounded-2xl border border-red-200 bg-red-50 p-4"
          style={{ animationDelay: '170ms' }}
          data-testid="red-flags"
        >
          <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-700">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-red-600 text-[10px] text-white">!</span>
            Warning signs in your answers
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-red-800">
            {result.triggeredRedFlags.map((flag) => (
              <li key={flag.id} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                {flag.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Likelihood bars */}
      <p className="reveal mt-6 flex items-center justify-between" style={{ animationDelay: '210ms' }}>
        <span className="text-sm font-bold text-ink">Possible explanations</span>
        <span className="font-mono text-[10px] text-muted">ranked by likelihood</span>
      </p>
      <div className="mt-3 space-y-2.5">
        {topEntries.map((entry, i) => {
          const pct = Math.round((entry.score / maxScore) * 100)
          return (
            <div
              key={entry.differential.id}
              className="reveal card p-3.5"
              style={{ animationDelay: `${260 + i * 60}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink">{entry.differential.name}</p>
                <span className="font-mono text-sm font-semibold text-brand">{pct}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas-deep">
                <div
                  className="bar-fill h-full rounded-full bg-gradient-to-r from-brand to-cyan"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft">
                {entry.differential.explanation}
              </p>
              {entry.matchedFactors.length > 0 ? (
                <p className="mt-2 font-mono text-[10px] text-muted">
                  Supported by: {entry.matchedFactors.join(', ')}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      {prose ? (
        <div className="reveal card-tint mt-4 p-4" style={{ animationDelay: '380ms' }}>
          <span className="eyebrow">In plain language</span>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{prose}</p>
        </div>
      ) : null}

      {/* Next steps */}
      <div className="reveal mt-4 grid gap-2.5 sm:grid-cols-2" style={{ animationDelay: '430ms' }}>
        <div className="card p-4">
          <span className="eyebrow">Specialty</span>
          <p className="mt-1.5 text-sm font-bold text-ink">{top?.differential.specialty}</p>
        </div>
        <div className="card p-4">
          <span className="eyebrow">Tests to discuss</span>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            {top?.differential.suggestedTests.join(', ')}
          </p>
        </div>
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted">
        General suggestions, not diagnostic orders.
      </p>

      <div className="mt-6 flex gap-2">
        <button type="button" onClick={restart} className="btn btn-ghost px-4 py-2.5 text-sm">
          Start over
        </button>
        <button
          type="button"
          onClick={onOpenReport}
          data-testid="open-report"
          className="btn btn-primary flex-1 px-4 py-2.5 text-sm"
        >
          Doctor-ready report
        </button>
      </div>

      <Disclaimer />
    </div>
  )
}
