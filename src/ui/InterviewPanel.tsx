import { currentQuestion } from '../clinical/interviewEngine'
import { packForRegion } from '../clinical/packs/index'
import { useAssessmentStore } from '../state/assessmentStore'
import { Disclaimer } from './Disclaimer'

export function InterviewPanel() {
  const interview = useAssessmentStore((state) => state.interview)
  const answer = useAssessmentStore((state) => state.answer)
  const restart = useAssessmentStore((state) => state.restart)

  if (!interview) {
    return null
  }
  const pack = packForRegion(interview.packRegionId)
  if (!pack) {
    return null
  }
  const question = currentQuestion(pack, interview)
  if (!question) {
    return null
  }

  const answeredCount = Object.keys(interview.answers).length

  return (
    <div className="flex h-full flex-col p-5" data-testid="interview">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">A few smart questions</h2>
        <span className="text-xs text-slate-500">{answeredCount} answered</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Each answer narrows down what could be going on.
      </p>

      <p className="mt-8 text-base font-medium text-slate-200" data-testid="question-text">
        {question.text}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-testid={`answer-${option.value}`}
            onClick={() => answer(option.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-blue-500 hover:bg-blue-600/10"
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={restart}
        className="mt-auto rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
      >
        Start over
      </button>
      <Disclaimer />
    </div>
  )
}
