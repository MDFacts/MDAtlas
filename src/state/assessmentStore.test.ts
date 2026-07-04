import { beforeEach, describe, expect, it } from 'vitest'
import type { PainProfile } from '../clinical/types'
import { useAssessmentStore } from './assessmentStore'

const RLQ_PAIN: PainProfile = {
  regionId: 'rightLowerAbdomen',
  painTypes: ['sharp'],
  severity: 8,
  onset: 'today',
  betterFactors: [],
  worseFactors: ['movement'],
  radiatesTo: null,
}

describe('assessmentStore', () => {
  beforeEach(() => {
    useAssessmentStore.getState().restart()
  })

  it('moves explore → pain-input on region select', () => {
    useAssessmentStore.getState().selectRegion('rightLowerAbdomen', { x: 0, y: 0, z: 0 })
    const state = useAssessmentStore.getState()
    expect(state.phase).toBe('pain-input')
    expect(state.selectedRegionId).toBe('rightLowerAbdomen')
  })

  it('starts the interview for a packed region on pain submit', () => {
    const store = useAssessmentStore.getState()
    store.selectRegion('rightLowerAbdomen', { x: 0, y: 0, z: 0 })
    store.submitPain(RLQ_PAIN)
    const state = useAssessmentStore.getState()
    expect(state.phase).toBe('interview')
    expect(state.interview?.currentNodeId).toBe('fever')
  })

  it('goes straight to results (no pack) for an unpacked region', () => {
    const store = useAssessmentStore.getState()
    store.selectRegion('leftLeg', { x: 0, y: 0, z: 0 })
    store.submitPain({ ...RLQ_PAIN, regionId: 'leftLeg' })
    const state = useAssessmentStore.getState()
    expect(state.phase).toBe('results')
    expect(state.result).toBeNull()
  })

  it('walks the appendicitis path to an emergency-tier result', () => {
    const store = useAssessmentStore.getState()
    store.selectRegion('rightLowerAbdomen', { x: 0, y: 0, z: 0 })
    store.submitPain(RLQ_PAIN)
    const answers = ['yes', 'yes', 'yes', 'yes', 'no', 'no-relation', 'no', 'no']
    for (const value of answers) {
      useAssessmentStore.getState().answer(value)
    }
    const state = useAssessmentStore.getState()
    expect(state.phase).toBe('results')
    expect(state.result?.ranked[0].differential.id).toBe('appendicitis')
    expect(state.result?.tier).toBe('emergency')
    expect(state.result?.triggeredRedFlags.map((f) => f.id)).toContain('rf-severe-fever')
  })

  it('restart returns to the initial explore state', () => {
    const store = useAssessmentStore.getState()
    store.selectRegion('chest', { x: 0, y: 0, z: 0 })
    store.restart()
    const state = useAssessmentStore.getState()
    expect(state.phase).toBe('explore')
    expect(state.selectedRegionId).toBeNull()
  })
})
