import { describe, expect, it } from 'vitest'
import type { ContentPack } from './types'
import { answerQuestion, currentQuestion, isComplete, startInterview } from './interviewEngine'

const pack: ContentPack = {
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
      id: 'dx',
      name: 'Dx',
      baseWeight: 1,
      supports: {},
      tier: 'self-care',
      specialty: 'GP',
      suggestedTests: [],
      explanation: 'x',
    },
  ],
  redFlags: [],
}

describe('interviewEngine', () => {
  it('starts at the entry node with its question', () => {
    const state = startInterview(pack)
    expect(state.currentNodeId).toBe('q1')
    expect(currentQuestion(pack, state)?.id).toBe('fever')
    expect(isComplete(state)).toBe(false)
  })

  it('advances to the next node on answer and records it', () => {
    const s1 = startInterview(pack)
    const s2 = answerQuestion(pack, s1, 'yes')
    expect(s2.currentNodeId).toBe('q2')
    expect(s2.answers).toEqual({ fever: 'yes' })
    expect(currentQuestion(pack, s2)?.id).toBe('nausea')
  })

  it('completes when the route is null', () => {
    const s1 = startInterview(pack)
    const s2 = answerQuestion(pack, s1, 'no')
    expect(isComplete(s2)).toBe(true)
    expect(currentQuestion(pack, s2)).toBeNull()
    expect(s2.answers).toEqual({ fever: 'no' })
  })

  it('does not mutate prior state', () => {
    const s1 = startInterview(pack)
    const frozen = JSON.stringify(s1)
    answerQuestion(pack, s1, 'yes')
    expect(JSON.stringify(s1)).toBe(frozen)
  })

  it('throws on an answer that is not an option of the current question', () => {
    const s1 = startInterview(pack)
    expect(() => answerQuestion(pack, s1, 'maybe')).toThrow(/not a valid option/)
  })

  it('throws when answering a completed interview', () => {
    const done = answerQuestion(pack, startInterview(pack), 'no')
    expect(() => answerQuestion(pack, done, 'yes')).toThrow(/complete/)
  })
})
