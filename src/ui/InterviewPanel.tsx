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
  const estimate = Math.max(answeredCount + 1, 6)
  const progress = Math.min(100, (answeredCount / estimate) * 100)

  return (
    <div className="flex h-full flex-col p-6" data-testid="interview">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Step 03 · Smart follow-up</span>
        <span className="font-mono text-[11px] text-muted">{answeredCount} answered</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas-deep">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-cyan transition-[width] duration-500"
          style={{ width: `${Math.max(8, progress)}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-muted">Each answer narrows down what could be going on.</p>

      <p
        key={interview.currentNodeId}
        className="reveal mt-8 font-display text-xl font-semibold leading-snug text-ink"
        data-testid="question-text"
      >
        {question.text}
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {question.options.map((option, i) => (
          <button
            key={option.value}
            type="button"
            data-testid={`answer-${option.value}`}
            onClick={() => answer(option.value)}
            className="option reveal group flex items-center justify-between px-4 py-3.5 text-left text-sm font-semibold"
            style={{ animationDelay: `${80 + i * 55}ms` }}
          >
            {option.label}
            <span className="text-brand opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
              →
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={restart}
        className="btn btn-ghost mt-auto px-4 py-2.5 text-sm"
      >
        Start over
      </button>
      <Disclaimer />
    </div>
  )
}
