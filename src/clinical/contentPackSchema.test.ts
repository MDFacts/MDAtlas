import { describe, expect, it } from 'vitest'
import { contentPackSchema } from './contentPackSchema'

const validPack = {
  regionId: 'testRegion',
  entryNodeId: 'q1',
  nodes: {
    q1: {
      question: {
        id: 'fever',
        text: 'Do you have a fever?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      next: { yes: 'q2', no: null },
    },
    q2: {
      question: {
        id: 'nausea',
        text: 'Any nausea?',
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
      id: 'test-dx',
      name: 'Test condition',
      baseWeight: 2,
      supports: { fever: ['yes'] },
      tier: 'urgent',
      specialty: 'General medicine',
      suggestedTests: ['CBC'],
      explanation: 'A test condition.',
    },
  ],
  redFlags: [
    {
      id: 'rf-fever-nausea',
      label: 'Fever with nausea',
      tier: 'emergency',
      when: [{ questionId: 'fever', answers: ['yes'] }],
      minSeverity: 7,
    },
  ],
}

describe('contentPackSchema', () => {
  it('parses a valid pack', () => {
    expect(() => contentPackSchema.parse(validPack)).not.toThrow()
  })

  it('rejects a pack whose next points to a missing node', () => {
    const broken = {
      ...validPack,
      nodes: {
        ...validPack.nodes,
        q1: { ...validPack.nodes.q1, next: { yes: 'missing', no: null } },
      },
    }
    expect(() => contentPackSchema.parse(broken)).toThrow(/missing/)
  })

  it('rejects a pack whose entryNodeId does not exist', () => {
    const broken = { ...validPack, entryNodeId: 'nope' }
    expect(() => contentPackSchema.parse(broken)).toThrow()
  })

  it('rejects differential supports referencing unknown question ids', () => {
    const broken = {
      ...validPack,
      differentials: [
        { ...validPack.differentials[0], supports: { ghostQuestion: ['yes'] } },
      ],
    }
    expect(() => contentPackSchema.parse(broken)).toThrow(/ghostQuestion/)
  })

  it('rejects red flags referencing unknown question ids', () => {
    const broken = {
      ...validPack,
      redFlags: [
        { ...validPack.redFlags[0], when: [{ questionId: 'ghost', answers: ['yes'] }] },
      ],
    }
    expect(() => contentPackSchema.parse(broken)).toThrow(/ghost/)
  })

  it('rejects out-of-range base weights', () => {
    const broken = {
      ...validPack,
      differentials: [{ ...validPack.differentials[0], baseWeight: -1 }],
    }
    expect(() => contentPackSchema.parse(broken)).toThrow()
  })
})
