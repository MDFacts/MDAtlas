import { useState } from 'react'
import { regionName } from '../anatomy/anatomyMap'
import { painProfileSchema } from '../clinical/painProfileSchema'
import type { PainType } from '../clinical/types'
import { useAssessmentStore } from '../state/assessmentStore'
import { Disclaimer } from './Disclaimer'

const PAIN_TYPES: PainType[] = [
  'aching',
  'sharp',
  'burning',
  'stabbing',
  'throbbing',
  'tingling',
  'numbness',
  'cramping',
  'pressure',
]

const ONSETS = [
  { value: 'hours', label: 'Last few hours' },
  { value: 'today', label: 'Today' },
  { value: '2-3-days', label: '2–3 days ago' },
  { value: 'week', label: 'About a week' },
  { value: 'longer', label: 'Over a week' },
]

const FACTORS = ['Movement', 'Rest', 'Eating', 'Breathing deeply', 'Pressing on it', 'Heat or ice']

function toggle(list: readonly string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function FactorGroup({
  label,
  tone,
  selected,
  onToggle,
}: {
  label: string
  tone: 'good' | 'bad'
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <>
      <p className="mt-5 text-sm font-bold text-ink">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {FACTORS.map((factor) => (
          <button
            key={factor}
            type="button"
            data-active={selected.includes(factor)}
            data-tone={tone}
            onClick={() => onToggle(factor)}
            className="chip px-3 py-1.5 text-xs"
          >
            {factor}
          </button>
        ))}
      </div>
    </>
  )
}

export function PainInputPanel() {
  const regionId = useAssessmentStore((state) => state.selectedRegionId)
  const submitPain = useAssessmentStore((state) => state.submitPain)
  const restart = useAssessmentStore((state) => state.restart)
  const severity = useAssessmentStore((state) => state.draftSeverity)
  const setSeverity = useAssessmentStore((state) => state.setDraftSeverity)

  const [painTypes, setPainTypes] = useState<PainType[]>([])
  const [onset, setOnset] = useState('')
  const [betterFactors, setBetterFactors] = useState<string[]>([])
  const [worseFactors, setWorseFactors] = useState<string[]>([])
  const [radiates, setRadiates] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!regionId) {
    return null
  }

  const handleSubmit = () => {
    const parsed = painProfileSchema.safeParse({
      regionId,
      painTypes,
      severity,
      onset,
      betterFactors,
      worseFactors,
      radiatesTo: radiates.trim() === '' ? null : radiates.trim(),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please complete the form')
      return
    }
    setError(null)
    submitPain(parsed.data)
  }

  const sevColor =
    severity >= 8 ? 'text-danger' : severity >= 5 ? 'text-warn' : 'text-brand'

  return (
    <div className="flex h-full flex-col p-6" data-testid="pain-input">
      <span className="eyebrow">Step 02 · Describe</span>
      <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-ink">Describe your pain</h2>
      <p className="mt-1 inline-flex items-center gap-2 text-sm text-ink-soft">
        <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_0_3px_rgba(37,99,235,0.15)]" />
        {regionName(regionId)}
      </p>

      <p className="mt-6 text-sm font-bold text-ink">What does it feel like?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PAIN_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            data-active={painTypes.includes(type)}
            onClick={() => setPainTypes((prev) => toggle(prev, type) as PainType[])}
            className="chip px-3.5 py-1.5 text-sm capitalize"
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <p className="text-sm font-bold text-ink">How severe is it?</p>
        <span className={`font-mono text-lg font-semibold ${sevColor}`}>
          {severity}
          <span className="text-sm text-muted">/10</span>
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={severity}
        onChange={(event) => setSeverity(Number(event.target.value))}
        className="sev mt-3 w-full"
        style={{ ['--pct' as string]: `${((severity - 1) / 9) * 100}%` }}
        data-testid="severity-slider"
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
        <span>Mild</span>
        <span>Severe</span>
      </div>

      <p className="mt-6 text-sm font-bold text-ink">When did it start?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ONSETS.map((option) => (
          <button
            key={option.value}
            type="button"
            data-active={onset === option.value}
            onClick={() => setOnset(option.value)}
            className="chip px-3.5 py-1.5 text-sm"
          >
            {option.label}
          </button>
        ))}
      </div>

      <FactorGroup
        label="What makes it better?"
        tone="good"
        selected={betterFactors}
        onToggle={(v) => setBetterFactors((prev) => toggle(prev, v))}
      />
      <FactorGroup
        label="What makes it worse?"
        tone="bad"
        selected={worseFactors}
        onToggle={(v) => setWorseFactors((prev) => toggle(prev, v))}
      />

      <p className="mt-6 text-sm font-bold text-ink">
        Does it spread anywhere? <span className="font-medium text-muted">(optional)</span>
      </p>
      <input
        type="text"
        value={radiates}
        onChange={(event) => setRadiates(event.target.value)}
        placeholder="e.g. down my right leg"
        className="field mt-2 px-3.5 py-2.5 text-sm"
      />

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex gap-2">
        <button type="button" onClick={restart} className="btn btn-ghost px-4 py-2.5 text-sm">
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          data-testid="pain-submit"
          className="btn btn-primary flex-1 px-4 py-2.5 text-sm"
        >
          Continue →
        </button>
      </div>

      <Disclaimer />
    </div>
  )
}
