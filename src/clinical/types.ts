export type PainType =
  | 'aching'
  | 'sharp'
  | 'burning'
  | 'stabbing'
  | 'throbbing'
  | 'tingling'
  | 'numbness'
  | 'cramping'
  | 'pressure'

export type RiskTier = 'emergency' | 'urgent' | 'primary-care' | 'self-care'

export interface PainProfile {
  regionId: string
  painTypes: PainType[]
  severity: number
  onset: string
  betterFactors: string[]
  worseFactors: string[]
  radiatesTo: string | null
}

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  text: string
  options: QuestionOption[]
}

export interface TreeNode {
  question: Question
  next: Record<string, string | null>
}

export interface Differential {
  id: string
  name: string
  baseWeight: number
  supports: Record<string, string[]>
  tier: RiskTier
  specialty: string
  suggestedTests: string[]
  explanation: string
}

export interface RedFlagCondition {
  questionId: string
  answers: string[]
}

export interface RedFlag {
  id: string
  label: string
  tier: RiskTier
  when: RedFlagCondition[]
  minSeverity?: number
}

export interface ContentPack {
  regionId: string
  entryNodeId: string
  nodes: Record<string, TreeNode>
  differentials: Differential[]
  redFlags: RedFlag[]
}

export interface RankedDifferential {
  differential: Differential
  score: number
  matchedFactors: string[]
}

export interface AssessmentResult {
  regionId: string
  pain: PainProfile
  answers: Record<string, string>
  ranked: RankedDifferential[]
  triggeredRedFlags: RedFlag[]
  tier: RiskTier
}
