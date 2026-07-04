import type { ContentPack, Question } from './types'

export interface InterviewState {
  packRegionId: string
  currentNodeId: string | null
  answers: Record<string, string>
}

export function startInterview(pack: ContentPack): InterviewState {
  return {
    packRegionId: pack.regionId,
    currentNodeId: pack.entryNodeId,
    answers: {},
  }
}

export function isComplete(state: InterviewState): boolean {
  return state.currentNodeId === null
}

export function currentQuestion(pack: ContentPack, state: InterviewState): Question | null {
  if (state.currentNodeId === null) {
    return null
  }
  const node = pack.nodes[state.currentNodeId]
  if (!node) {
    throw new Error(`Interview state points to unknown node "${state.currentNodeId}"`)
  }
  return node.question
}

export function answerQuestion(
  pack: ContentPack,
  state: InterviewState,
  value: string,
): InterviewState {
  if (state.currentNodeId === null) {
    throw new Error('Cannot answer: interview is already complete')
  }
  const node = pack.nodes[state.currentNodeId]
  if (!node) {
    throw new Error(`Interview state points to unknown node "${state.currentNodeId}"`)
  }
  const isOption = node.question.options.some((option) => option.value === value)
  if (!isOption) {
    throw new Error(`"${value}" is not a valid option for question "${node.question.id}"`)
  }
  return {
    ...state,
    currentNodeId: node.next[value] ?? null,
    answers: { ...state.answers, [node.question.id]: value },
  }
}
