import { describe, expect, it } from 'vitest'
import type { ContentPack, PainProfile } from './types'
import { computeAssessment } from './triage'

const pack: ContentPack = {
  regionId: 'testRegion',
  entryNodeId: 'q1',
  nodes: {
    q1: {
      question: {
        id: 'fever',
        text: 'Fever?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      next: { yes: 'q2', no: 'q2' },
    },
    q2: {
      question: {
        id: 'walkingPain',
        text: 'Worse when walking?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'appendicitis',
      name: 'Appendicitis',
      baseWeight: 1,
      supports: { fever: ['yes'], walkingPain: ['yes'] },
      tier: 'urgent',
      specialty: 'Emergency medicine',
      suggestedTests: ['CBC'],
      explanation: 'Inflamed appendix.',
    },
    {
      id: 'strain',
      name: 'Muscle strain',
      baseWeight: 2,
      supports: { walkingPain: ['yes'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: [],
      explanation: 'Overused muscle.',
    },
  ],
  redFlags: [
    {
      id: 'rf-fever',
      label: 'Fever with severe pain',
      tier: 'emergency',
      when: [{ questionId: 'fever', answers: ['yes'] }],
      minSeverity: 8,
    },
  ],
}

function pain(severity: number): PainProfile {
  return {
    regionId: 'testRegion',
    painTypes: ['sharp'],
    severity,
    onset: 'today',
    betterFactors: [],
    worseFactors: [],
    radiatesTo: null,
  }
}

describe('computeAssessment', () => {
  it('scores base weight plus one per matched support and ranks descending', () => {
    const result = computeAssessment(pack, pain(5), { fever: 'yes', walkingPain: 'yes' })
    const appendicitis = result.ranked.find((r) => r.differential.id === 'appendicitis')
    const strain = result.ranked.find((r) => r.differential.id === 'strain')
    expect(appendicitis?.score).toBe(3)
    expect(strain?.score).toBe(3)
    expect(appendicitis?.matchedFactors).toEqual(['fever', 'walkingPain'])
  })

  it('ranks higher scores first', () => {
    const result = computeAssessment(pack, pain(5), { fever: 'no', walkingPain: 'yes' })
    expect(result.ranked[0].differential.id).toBe('strain')
    expect(result.ranked[0].score).toBe(3)
    expect(result.ranked[1].score).toBe(2)
  })

  it('uses top differential tier when no red flag triggers', () => {
    const result = computeAssessment(pack, pain(5), { fever: 'no', walkingPain: 'yes' })
    expect(result.triggeredRedFlags).toEqual([])
    expect(result.tier).toBe('self-care')
  })

  it('does not trigger a red flag below minSeverity', () => {
    const result = computeAssessment(pack, pain(7), { fever: 'yes', walkingPain: 'no' })
    expect(result.triggeredRedFlags).toEqual([])
  })

  it('triggers red flag at minSeverity and escalates the tier', () => {
    const result = computeAssessment(pack, pain(8), { fever: 'yes', walkingPain: 'no' })
    expect(result.triggeredRedFlags.map((f) => f.id)).toEqual(['rf-fever'])
    expect(result.tier).toBe('emergency')
  })

  it('never de-escalates below the top differential tier', () => {
    const urgentFlagPack: ContentPack = {
      ...pack,
      differentials: [{ ...pack.differentials[0], tier: 'emergency' }],
      redFlags: [{ ...pack.redFlags[0], tier: 'urgent', minSeverity: 1 }],
    }
    const result = computeAssessment(urgentFlagPack, pain(9), { fever: 'yes', walkingPain: 'yes' })
    expect(result.tier).toBe('emergency')
  })
})
