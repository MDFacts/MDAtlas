import { useEffect, useState } from 'react'
import { regionName } from '../anatomy/anatomyMap'
import { packForRegion } from '../clinical/packs/index'
import type { AssessmentResult } from '../clinical/types'
import { generateProse } from '../llm/proseProvider'

function questionTextFor(result: AssessmentResult, questionId: string): string {
  const pack = packForRegion(result.regionId)
  if (!pack) {
    return questionId
  }
  const node = Object.values(pack.nodes).find((entry) => entry.question.id === questionId)
  return node?.question.text ?? questionId
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-8 text-slate-900" data-testid="doctor-report">
      <div className="mx-auto max-w-2xl">
        <div className="no-print mb-6 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Print / Save as PDF
          </button>
        </div>

        <h1 className="text-2xl font-bold">MDAtlas Symptom Report</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generated {new Date().toLocaleDateString()} — for discussion with a healthcare
          professional. This is patient-reported information, not a diagnosis.
        </p>

        <h2 className="mt-6 text-lg font-semibold">Primary concern</h2>
        <p className="mt-1 text-sm">
          {result.pain.painTypes.join(', ')} pain — {regionName(result.regionId)}, severity{' '}
          {result.pain.severity}/10, started: {result.pain.onset}
          {result.pain.radiatesTo ? `, radiates to ${result.pain.radiatesTo}` : ''}
        </p>
        {result.pain.worseFactors.length > 0 ? (
          <p className="mt-1 text-sm">Aggravated by: {result.pain.worseFactors.join(', ')}</p>
        ) : null}
        {result.pain.betterFactors.length > 0 ? (
          <p className="mt-1 text-sm">Relieved by: {result.pain.betterFactors.join(', ')}</p>
        ) : null}

        {summary ? (
          <>
            <h2 className="mt-6 text-lg font-semibold">Clinical summary</h2>
            <p className="mt-1 text-sm leading-relaxed">{summary}</p>
          </>
        ) : null}

        <h2 className="mt-6 text-lg font-semibold">Interview responses</h2>
        <table className="mt-2 w-full border-collapse text-sm">
          <tbody>
            {Object.entries(result.answers).map(([questionId, value]) => (
              <tr key={questionId} className="border-b border-slate-200">
                <td className="py-1.5 pr-4 text-slate-600">
                  {questionTextFor(result, questionId)}
                </td>
                <td className="py-1.5 font-medium capitalize">{value.replace(/-/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {result.triggeredRedFlags.length > 0 ? (
          <>
            <h2 className="mt-6 text-lg font-semibold text-red-700">Flags for review</h2>
            <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
              {result.triggeredRedFlags.map((flag) => (
                <li key={flag.id}>{flag.label}</li>
              ))}
            </ul>
          </>
        ) : null}

        <h2 className="mt-6 text-lg font-semibold">Weighted considerations</h2>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {result.ranked
            .filter((entry) => entry.score > 0)
            .slice(0, 4)
            .map((entry) => (
              <li key={entry.differential.id}>
                {entry.differential.name} — score {entry.score}
                {entry.matchedFactors.length > 0
                  ? ` (supported by: ${entry.matchedFactors.join(', ')})`
                  : ''}
              </li>
            ))}
        </ul>

        <h2 className="mt-6 text-lg font-semibold">Tests that may be considered</h2>
        <p className="mt-1 text-sm">
          {result.ranked[0]?.differential.suggestedTests.join(', ')} — general suggestions only,
          at the treating clinician’s discretion.
        </p>

        <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          MDAtlas by MDfacts.ai — AI-assisted symptom assessment for education and doctor
          preparation. Not a medical device; does not provide diagnoses.
        </p>
      </div>
    </div>
  )
}
