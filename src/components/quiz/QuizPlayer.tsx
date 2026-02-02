import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Quiz, Question } from '../../types/quiz'
import { QuestionView } from './QuestionView'
import { Button } from '../ui/Button'
import { createAttempt, submitAttempt } from '../../services/attemptService'
import { useAuth } from '../auth/AuthProvider'

interface QuizPlayerProps {
  quiz: Quiz
  questions: Question[]
}

export function QuizPlayer({ quiz, questions }: QuizPlayerProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [startedAt] = useState(new Date())
  const [submitting, setSubmitting] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === questions.length - 1
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length

  // Create attempt on first answer
  const handleSelectOption = async (optionId: string) => {
    // Create attempt if not exists
    if (!attemptId && user) {
      const attempt = await createAttempt(quiz.id, user.id, user.email ?? undefined)
      if (attempt) {
        setAttemptId(attempt.id)
      }
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }))
  }

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!attemptId || !user) return

    setSubmitting(true)
    const result = await submitAttempt(attemptId, user.id, answers, questions, startedAt)
    setSubmitting(false)

    if (result) {
      navigate(`/results/${attemptId}`, {
        state: {
          attempt: result,
          quiz: {
            ...quiz,
            show_correct_answers: quiz.show_correct_answers ?? true
          },
          questions
        }
      })
    }
  }

  return (
    <>
      {/* Scrollable content area */}
      <div className="pb-24">
        {/* Quiz title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {answeredCount}/{questions.length} respondidas
          </p>
        </div>

        {/* Question */}
        <QuestionView
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedOption={answers[currentQuestion.id]}
          onSelectOption={handleSelectOption}
        />
      </div>

      {/* Fixed navigation - above BottomNav */}
      <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-30">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="flex-1"
          >
            Anterior
          </Button>

          {isLastQuestion ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              loading={submitting}
              className="flex-1"
            >
              Enviar
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex-1"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
