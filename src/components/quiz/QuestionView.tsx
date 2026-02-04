import { useState, useEffect, useCallback } from 'react'
import type { Question } from '../../types/quiz'
import { OptionButton } from './OptionButton'
import { useSettings } from '../../hooks/useSettings'

interface QuestionViewProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedOption: string | undefined
  onSelectOption: (optionId: string) => void
  showResult?: boolean
}

const REVEAL_INTERVAL_MS = 600

export function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  showResult = false
}: QuestionViewProps) {
  const { settings } = useSettings()
  const sequential = settings.sequentialOptions && !showResult

  // Whether the user has triggered the reveal
  const [revealed, setRevealed] = useState(!sequential)
  // How many options are currently visible during the sequential animation
  const [visibleCount, setVisibleCount] = useState(sequential ? 0 : question.options.length)

  // Reset state when question changes or setting toggles
  useEffect(() => {
    if (!sequential) {
      setRevealed(true)
      setVisibleCount(question.options.length)
      return
    }
    setRevealed(false)
    setVisibleCount(0)
  }, [question.id, sequential, question.options.length])

  // Animate options in once revealed
  useEffect(() => {
    if (!revealed || !sequential) return

    setVisibleCount(0)
    const total = question.options.length
    let current = 0

    // Show first option immediately
    const timeout = setTimeout(() => {
      current = 1
      setVisibleCount(1)

      if (total <= 1) return

      const interval = setInterval(() => {
        current++
        setVisibleCount(current)
        if (current >= total) clearInterval(interval)
      }, REVEAL_INTERVAL_MS)

      // Store interval id on the timeout's cleanup
      cleanupRef = interval
    }, 100)

    let cleanupRef: ReturnType<typeof setInterval> | null = null

    return () => {
      clearTimeout(timeout)
      if (cleanupRef) clearInterval(cleanupRef)
    }
  }, [revealed, sequential, question.id, question.options.length])

  const handleReveal = useCallback(() => {
    setRevealed(true)
  }, [])

  const allVisible = visibleCount >= question.options.length

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Pregunta {questionNumber} de {totalQuestions}</span>
        <span>{question.points} {question.points === 1 ? 'punto' : 'puntos'}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question text */}
      <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
        {question.question_text}
      </h2>

      {question.image_url ? (
        <img
          src={question.image_url}
          alt=""
          className="w-full rounded-lg max-h-64 object-contain"
        />
      ) : null}

      {/* Reveal trigger — only in sequential mode before options are shown */}
      {sequential && !revealed && (
        <button
          onClick={handleReveal}
          className="w-full py-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50
                     text-emerald-700 font-medium text-sm
                     hover:bg-emerald-100 hover:border-emerald-400
                     active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Mostrar opciones
        </button>
      )}

      {/* Options — hidden entirely until revealed in sequential mode */}
      {(revealed || !sequential) && (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isVisible = !sequential || index < visibleCount
            return (
              <div
                key={option.id}
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  maxHeight: isVisible ? '200px' : '0px',
                  marginBottom: isVisible ? undefined : '0px',
                  overflow: 'hidden',
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                <OptionButton
                  option={option}
                  isSelected={selectedOption === option.id}
                  isCorrect={showResult ? option.id === question.correct_answer : undefined}
                  isWrong={showResult && selectedOption === option.id && option.id !== question.correct_answer}
                  onClick={() => !showResult && onSelectOption(option.id)}
                  disabled={showResult || !isVisible}
                />
              </div>
            )
          })}

          {/* Sequential progress dots */}
          {sequential && !allVisible && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {question.options.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i < visibleCount ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Explanation (only shown in results) */}
      {showResult && question.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Explicación:</p>
          <p className="text-sm text-blue-700">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
