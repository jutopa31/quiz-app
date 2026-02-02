import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Container } from '../../components/layout/Container'
import { AdminQuizCard } from '../../components/admin/AdminQuizCard'
import { PageLoader } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'
import { useAdminQuizzes } from '../../hooks/useAdminQuizzes'
import { deleteQuiz, publishQuiz } from '../../services/quizCreatorService'

export function QuizListPage() {
  const { quizzes, loading, error, refresh } = useAdminQuizzes()
  const [actionLoading, setActionLoading] = useState(false)

  const handlePublish = async (quizId: string) => {
    setActionLoading(true)
    await publishQuiz(quizId)
    await refresh()
    setActionLoading(false)
  }

  const handleDelete = async (quizId: string) => {
    console.log('🗑️ [QuizListPage] handleDelete called with quizId:', quizId)
    setActionLoading(true)
    const success = await deleteQuiz(quizId)
    console.log('🗑️ [QuizListPage] deleteQuiz returned:', success)
    await refresh()
    setActionLoading(false)
    if (!success) {
      alert('Error al eliminar el quiz. Revisa la consola para más detalles.')
    }
  }

  if (loading) {
    return (
      <Container>
        <PageLoader />
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <Link to="/admin/quiz/new">
            <Button type="button" variant="primary">
              Nuevo quiz
            </Button>
          </Link>
        </div>

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}

        {quizzes.length === 0 ? (
          <p className="text-sm text-gray-500">Todavia no hay quizzes creados.</p>
        ) : null}

        <div className="space-y-3">
          {quizzes.map(quiz => (
            <AdminQuizCard
              key={quiz.id}
              quiz={quiz}
              onPublish={handlePublish}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {actionLoading ? (
          <p className="text-xs text-gray-400">Actualizando...</p>
        ) : null}
      </div>
    </Container>
  )
}
