import { Link } from 'react-router-dom'
import type { Quiz } from '../../types/quiz'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface AdminQuizCardProps {
  quiz: Quiz
  onPublish: (quizId: string) => Promise<void>
  onDelete: (quizId: string) => Promise<void>
}

export function AdminQuizCard({ quiz, onPublish, onDelete }: AdminQuizCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
          {quiz.description ? (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.description}</p>
          ) : null}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{quiz.question_count ?? 0} preguntas</span>
            <span className="uppercase">{quiz.status}</span>
          </div>
        </div>
        <Link to={`/admin/quiz/${quiz.id}`}>
          <Button type="button" variant="secondary" size="sm">
            Editar
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {quiz.status !== 'published' ? (
          <Button type="button" variant="primary" size="sm" onClick={() => onPublish(quiz.id)}>
            Publicar
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(quiz.id)}>
          Eliminar
        </Button>
      </div>
    </Card>
  )
}
