import { Link } from 'react-router-dom'
import type { QuizAttempt, Question } from '../../types/quiz'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ScoreBadge } from './ScoreBadge'
import { QuestionView } from './QuestionView'
import { formatPercentage, formatDuration } from '../../utils/formatters'

interface ResultsViewProps {
  attempt: QuizAttempt
  quiz: { id: string; title: string; show_correct_answers: boolean }
  questions: Question[]
}

export function ResultsView({ attempt, quiz, questions }: ResultsViewProps) {
  const totalPoints = attempt.total_points ?? attempt.total_questions ?? 1
  const percentage = formatPercentage(attempt.score || 0, totalPoints)
  const passed = percentage >= 60

  // Map answers by question_id for easy lookup
  const answersMap = (attempt.answers || []).reduce((acc, ans) => {
    acc[ans.question_id] = ans
    return acc
  }, {} as Record<string, typeof attempt.answers[0]>)

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-4">{quiz.title}</h1>

        <div className="flex justify-center mb-4">
          <ScoreBadge
            score={attempt.score || 0}
            total={totalPoints}
            size="lg"
          />
        </div>

        <p className={`text-lg font-semibold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
          {passed ? '¡Aprobado!' : 'No aprobado'}
        </p>

        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <div>
            <span className="font-medium text-gray-900">{attempt.score}</span>
            <span>/{totalPoints} puntos</span>
          </div>
          {attempt.time_spent_seconds && (
            <div>
              <span className="font-medium text-gray-900">
                {formatDuration(attempt.time_spent_seconds)}
              </span>
              <span> tiempo</span>
            </div>
          )}
        </div>
      </Card>

      {/* Questions Review */}
      {quiz.show_correct_answers && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Revisión de respuestas</h2>

          {questions.map((question, index) => {
            const answer = answersMap[question.id]
            const selectedOption = answer?.selected_option ?? (answer?.selected_index !== undefined
              ? String(answer.selected_index)
              : undefined)
            return (
              <Card key={question.id}>
                <QuestionView
                  question={question}
                  questionNumber={index + 1}
                  totalQuestions={questions.length}
                  selectedOption={selectedOption}
                  onSelectOption={() => {}}
                  showResult
                />
              </Card>
            )
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/quiz/${quiz.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            Reintentar
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button variant="primary" className="w-full">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
