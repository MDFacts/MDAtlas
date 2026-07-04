import { regionName } from '../anatomy/anatomyMap'
import type { AssessmentResult, RiskTier } from '../clinical/types'
import type { ProseProvider, ProseRequest } from './proseProvider'

const TIER_COPY: Record<RiskTier, string> = {
  emergency:
    'Some of your answers match warning signs that deserve immediate attention. Please go to an emergency department now or call emergency services.',
  urgent:
    'Your answers suggest this should be looked at by a clinician today — an urgent care visit or same-day appointment is a sensible next step.',
  'primary-care':
    'This pattern is usually not an emergency, but it is worth booking an appointment with your doctor this week.',
  'self-care':
    'This pattern usually improves with self-care. Monitor how it develops, and see a doctor if it worsens or does not settle.',
}

function patientProse(result: AssessmentResult): string {
  const top = result.ranked.slice(0, 3)
  const region = regionName(result.regionId).toLowerCase()
  const lines = [
    `Based on where you pointed (${region}) and your answers, here is what could be going on.`,
    '',
    ...top.map((entry, index) => {
      const why =
        entry.matchedFactors.length > 0
          ? ` Your answers about ${entry.matchedFactors.join(', ')} support this.`
          : ''
      return `${index + 1}. ${entry.differential.name}: ${entry.differential.explanation}${why}`
    }),
    '',
    TIER_COPY[result.tier],
  ]
  if (result.triggeredRedFlags.length > 0) {
    lines.push(
      '',
      `Warning signs noted: ${result.triggeredRedFlags.map((flag) => flag.label).join('; ')}.`,
    )
  }
  return lines.join('\n')
}

function doctorProse(result: AssessmentResult): string {
  const region = regionName(result.regionId)
  const pain = result.pain
  const answerSummary = Object.entries(result.answers)
    .map(([questionId, value]) => `${questionId}: ${value}`)
    .join('; ')
  const differentials = result.ranked
    .slice(0, 4)
    .map((entry) => `${entry.differential.name} (score ${entry.score})`)
    .join(', ')
  const flags =
    result.triggeredRedFlags.length > 0
      ? `Red flags: ${result.triggeredRedFlags.map((flag) => flag.label).join('; ')}.`
      : 'No red flags triggered.'
  return [
    `Patient-reported ${pain.painTypes.join(', ')} pain in the ${region}, severity ${pain.severity}/10, onset ${pain.onset}.`,
    pain.radiatesTo ? `Radiates to: ${pain.radiatesTo}.` : 'No radiation reported.',
    `Structured interview responses — ${answerSummary}.`,
    `Weighted differential considerations: ${differentials}.`,
    flags,
    `Suggested care level: ${result.tier}.`,
  ].join(' ')
}

export const offlineProvider: ProseProvider = {
  name: 'offline',
  generate(request: ProseRequest): Promise<string> {
    const prose =
      request.audience === 'patient' ? patientProse(request.result) : doctorProse(request.result)
    return Promise.resolve(prose)
  },
}
