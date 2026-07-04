import { describe, expect, it } from 'vitest'
import type { AssessmentResult } from '../clinical/types'
import { offlineProvider } from './offlineProvider'

const result: AssessmentResult = {
  regionId: 'rightLowerAbdomen',
  pain: {
    regionId: 'rightLowerAbdomen',
    painTypes: ['sharp'],
    severity: 8,
    onset: 'today',
    betterFactors: [],
    worseFactors: ['Movement'],
    radiatesTo: null,
  },
  answers: { fever: 'yes', walkingPain: 'yes' },
  ranked: [
    {
      differential: {
        id: 'appendicitis',
        name: 'Appendicitis',
        baseWeight: 1,
        supports: { fever: ['yes'] },
        tier: 'urgent',
        specialty: 'Emergency medicine',
        suggestedTests: ['CBC'],
        explanation: 'Inflammation of the appendix.',
      },
      score: 3,
      matchedFactors: ['fever', 'walkingPain'],
    },
  ],
  triggeredRedFlags: [
    {
      id: 'rf-severe-fever',
      label: 'Fever with severe pain',
      tier: 'emergency',
      when: [{ questionId: 'fever', answers: ['yes'] }],
      minSeverity: 7,
    },
  ],
  tier: 'emergency',
}

describe('offlineProvider', () => {
  it('writes patient prose with top condition, reasons, tier copy, and red flags', async () => {
    const prose = await offlineProvider.generate({ result, audience: 'patient' })
    expect(prose).toContain('Appendicitis')
    expect(prose).toContain('fever')
    expect(prose).toContain('emergency department')
    expect(prose).toContain('Warning signs noted')
    expect(prose).not.toContain('diagnos')
  })

  it('writes doctor prose with severity, answers, and tier', async () => {
    const prose = await offlineProvider.generate({ result, audience: 'doctor' })
    expect(prose).toContain('severity 8/10')
    expect(prose).toContain('fever: yes')
    expect(prose).toContain('Appendicitis (score 3)')
    expect(prose).toContain('emergency')
  })
})
