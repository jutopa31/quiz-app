import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { ScoreBadge } from './ScoreBadge'
import type { Quiz } from '../../types/quiz'

interface QuizCardProps {
  quiz: Quiz
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Link to={`/quiz/${quiz.id}`}>
      <Card className="hover:shadow-md transition-shadow active:scale-[0.98]">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>{quiz.question_count} preguntas</span>
              {quiz.time_limit_minutes && (
                <span>{quiz.time_limit_minutes} min</span>
              )}
            </div>
          </div>

          {quiz.user_best_score !== null && quiz.user_best_score !== undefined && (
            <ScoreBadge
              score={quiz.user_best_score}
              total={100}
              size="sm"
            />
          )}
        </div>

        {quiz.user_attempts_count !== undefined && quiz.user_attempts_count > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
            {quiz.user_attempts_count} {quiz.user_attempts_count === 1 ? 'intento' : 'intentos'}
          </div>
        )}
      </Card>
    </Link>
  )
}
