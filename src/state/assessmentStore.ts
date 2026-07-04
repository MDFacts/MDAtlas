import { create } from 'zustand'
import { answerQuestion, isComplete, startInterview } from '../clinical/interviewEngine'
import type { InterviewState } from '../clinical/interviewEngine'
import { packForRegion } from '../clinical/packs/index'
import { computeAssessment } from '../clinical/triage'
import type { AssessmentResult, PainProfile } from '../clinical/types'
import type { AnatomyLayer } from '../anatomy/anatomyMap'
import type { BodySex } from '../scene/modelConfig'

export type Phase = 'explore' | 'pain-input' | 'interview' | 'results'

export interface TapPoint {
  x: number
  y: number
  z: number
}

interface AssessmentStore {
  phase: Phase
  activeLayer: AnatomyLayer
  bodySex: BodySex
  selectedRegionId: string | null
  tapPoint: TapPoint | null
  painProfile: PainProfile | null
  interview: InterviewState | null
  result: AssessmentResult | null
  backView: boolean
  /** Live severity (1–10) while describing pain — drives the pain-marker size. */
  draftSeverity: number
  setLayer: (layer: AnatomyLayer) => void
  setBodySex: (sex: BodySex) => void
  setDraftSeverity: (value: number) => void
  toggleView: () => void
  selectRegion: (regionId: string, point: TapPoint) => void
  submitPain: (profile: PainProfile) => void
  answer: (value: string) => void
  restart: () => void
}

const INITIAL = {
  phase: 'explore' as Phase,
  activeLayer: 'skin' as AnatomyLayer,
  selectedRegionId: null,
  tapPoint: null,
  painProfile: null,
  interview: null,
  result: null,
  backView: false,
  draftSeverity: 5,
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  ...INITIAL,
  bodySex: 'male',

  setLayer: (layer) => set({ activeLayer: layer }),

  setBodySex: (sex) => set({ bodySex: sex }),

  setDraftSeverity: (value) => set({ draftSeverity: value }),

  toggleView: () => set((state) => ({ backView: !state.backView })),

  selectRegion: (regionId, point) =>
    set({
      selectedRegionId: regionId,
      tapPoint: point,
      phase: 'pain-input',
      painProfile: null,
      interview: null,
      result: null,
      draftSeverity: 5,
    }),

  submitPain: (profile) => {
    const pack = packForRegion(profile.regionId)
    if (!pack) {
      set({ painProfile: profile, phase: 'results', result: null })
      return
    }
    set({ painProfile: profile, interview: startInterview(pack), phase: 'interview' })
  },

  answer: (value) => {
    const { interview, painProfile } = get()
    if (!interview || !painProfile) {
      return
    }
    const pack = packForRegion(interview.packRegionId)
    if (!pack) {
      return
    }
    const nextInterview = answerQuestion(pack, interview, value)
    if (isComplete(nextInterview)) {
      set({
        interview: nextInterview,
        result: computeAssessment(pack, painProfile, nextInterview.answers),
        phase: 'results',
      })
      return
    }
    set({ interview: nextInterview })
  },

  restart: () => set({ ...INITIAL }),
}))
