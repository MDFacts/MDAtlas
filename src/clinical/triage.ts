import type {
  AssessmentResult,
  ContentPack,
  PainProfile,
  RankedDifferential,
  RedFlag,
  RiskTier,
} from './types'

const TIER_SEVERITY: Record<RiskTier, number> = {
  emergency: 3,
  urgent: 2,
  'primary-care': 1,
  'self-care': 0,
}

export function mostSevereTier(tiers: readonly RiskTier[]): RiskTier {
  return tiers.reduce(
    (worst, tier) => (TIER_SEVERITY[tier] > TIER_SEVERITY[worst] ? tier : worst),
    'self-care' as RiskTier,
  )
}

function rankDifferentials(
  pack: ContentPack,
  answers: Record<string, string>,
): RankedDifferential[] {
  return pack.differentials
    .map((differential) => {
      const matchedFactors = Object.entries(differential.supports)
        .filter(([questionId, values]) => {
          const answer = answers[questionId]
          return answer !== undefined && values.includes(answer)
        })
        .map(([questionId]) => questionId)
      return {
        differential,
        score: differential.baseWeight + matchedFactors.length,
        matchedFactors,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function triggeredRedFlags(
  pack: ContentPack,
  pain: PainProfile,
  answers: Record<string, string>,
): RedFlag[] {
  return pack.redFlags.filter((flag) => {
    if (flag.minSeverity !== undefined && pain.severity < flag.minSeverity) {
      return false
    }
    return flag.when.some((condition) => {
      const answer = answers[condition.questionId]
      return answer !== undefined && condition.answers.includes(answer)
    })
  })
}

export function computeAssessment(
  pack: ContentPack,
  pain: PainProfile,
  answers: Record<string, string>,
): AssessmentResult {
  const ranked = rankDifferentials(pack, answers)
  const flags = triggeredRedFlags(pack, pain, answers)
  const candidateTiers: RiskTier[] = [
    ...flags.map((flag) => flag.tier),
    ...(ranked.length > 0 ? [ranked[0].differential.tier] : []),
  ]
  return {
    regionId: pack.regionId,
    pain,
    answers,
    ranked,
    triggeredRedFlags: flags,
    tier: mostSevereTier(candidateTiers),
  }
}
