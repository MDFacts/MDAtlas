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
  { value: 'hours', label: 'In the last few hours' },
  { value: 'today', label: 'Today' },
  { value: '2-3-days', label: '2–3 days ago' },
  { value: 'week', label: 'About a week ago' },
  { value: 'longer', label: 'Longer than a week' },
]

const FACTORS = ['Movement', 'Rest', 'Eating', 'Breathing deeply', 'Pressing on it', 'Heat or ice']

function toggle(list: readonly string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function PainInputPanel() {
  const regionId = useAssessmentStore((state) => state.selectedRegionId)
  const submitPain = useAssessmentStore((state) => state.submitPain)
  const restart = useAssessmentStore((state) => state.restart)

  const [painTypes, setPainTypes] = useState<PainType[]>([])
  const [severity, setSeverity] = useState(5)
  const [onset, setOnset] = useState('')
  const [betterFactors, setBetterFactors] = useState<string[]>([])
  const [worseFactors, setWorseFactors] = useState<string[]>([])
  const [radiates, setRadiates] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!regionId) {
    return null
  }

  const handleSubmit = () => {
    const candidate = {
      regionId,
      painTypes,
      severity,
      onset,
      betterFactors,
      worseFactors,
      radiatesTo: radiates.trim() === '' ? null : radiates.trim(),
    }
    const parsed = painProfileSchema.safeParse(candidate)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please complete the form')
      return
    }
    setError(null)
    submitPain(parsed.data)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-5" data-testid="pain-input">
      <h2 className="text-lg font-semibold text-slate-100">
        Describe your pain — {regionName(regionId)}
      </h2>

      <p className="mt-4 text-sm font-medium text-slate-300">What does it feel like?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PAIN_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setPainTypes((prev) => toggle(prev, type) as PainType[])}
            className={`rounded-full border px-3 py-1 text-sm capitalize transition ${
              painTypes.includes(type)
                ? 'border-blue-500 bg-blue-600/30 text-blue-200'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-300">
        How severe is it? <span className="text-blue-400">{severity}/10</span>
      </p>
      <input
        type="range"
        min={1}
        max={10}
        value={severity}
        onChange={(event) => setSeverity(Number(event.target.value))}
        className="mt-2 w-full accent-blue-500"
        data-testid="severity-slider"
      />

      <p className="mt-5 text-sm font-medium text-slate-300">When did it start?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ONSETS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setOnset(option.value)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              onset === option.value
                ? 'border-blue-500 bg-blue-600/30 text-blue-200'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-300">What makes it better?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {FACTORS.map((factor) => (
          <button
            key={factor}
            type="button"
            onClick={() => setBetterFactors((prev) => toggle(prev, factor))}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              betterFactors.includes(factor)
                ? 'border-emerald-500 bg-emerald-600/20 text-emerald-200'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {factor}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-300">What makes it worse?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {FACTORS.map((factor) => (
          <button
            key={factor}
            type="button"
            onClick={() => setWorseFactors((prev) => toggle(prev, factor))}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              worseFactors.includes(factor)
                ? 'border-rose-500 bg-rose-600/20 text-rose-200'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {factor}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-300">Does it spread anywhere? (optional)</p>
      <input
        type="text"
        value={radiates}
        onChange={(event) => setRadiates(event.target.value)}
        placeholder="e.g. down my right leg"
        className="mt-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
      />

      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={restart}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          data-testid="pain-submit"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Next
        </button>
      </div>

      <Disclaimer />
    </div>
  )
}
