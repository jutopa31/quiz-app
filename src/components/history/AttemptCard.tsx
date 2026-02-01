import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { ScoreBadge } from '../quiz/ScoreBadge'
import { formatDateTime, formatDuration } from '../../utils/formatters'
import type { QuizAttempt } from '../../types/quiz'

interface AttemptCardProps {
  attempt: QuizAttempt & { academy_quizzes?: { id: string; title: string } }
}

export function AttemptCard({ attempt }: AttemptCardProps) {
  const quizTitle = attempt.academy_quizzes?.title || 'Quiz'

  return (
    <Link to={`/results/${attempt.id}`}>
      <Card className="hover:shadow-md transition-shadow active:scale-[0.98]">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{quizTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDateTime((attempt.completed_at ?? attempt.created_at)!)}
            </p>
            {attempt.time_spent_seconds && (
              <p className="text-xs text-gray-400 mt-1">
                Duración: {formatDuration(attempt.time_spent_seconds)}
              </p>
            )}
          </div>

          <ScoreBadge
            score={attempt.score || 0}
            total={attempt.total_points ?? attempt.total_questions ?? 1}
            size="sm"
          />
        </div>
      </Card>
    </Link>
  )
}
