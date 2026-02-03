import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Container } from '../../components/layout/Container'
import { AdminQuizCard } from '../../components/admin/AdminQuizCard'
import { PageLoader } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'
import { useAdminQuizzes } from '../../hooks/useAdminQuizzes'
import { deleteQuiz, publishQuiz } from '../../services/quizCreatorService'

export function QuizListPage() {
  const { quizzes, loading, error, refresh } = useAdminQuizzes()
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')

  const filteredQuizzes = useMemo(() => {
    if (!search.trim()) return quizzes
    const term = search.toLowerCase()
    return quizzes.filter(q =>
      q.title.toLowerCase().includes(term) ||
      q.description?.toLowerCase().includes(term)
    )
  }, [quizzes, search])

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

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar quiz..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}

        {quizzes.length === 0 ? (
          <p className="text-sm text-gray-500">Todavia no hay quizzes creados.</p>
        ) : filteredQuizzes.length === 0 ? (
          <p className="text-sm text-gray-500">No se encontraron quizzes con "{search}"</p>
        ) : null}

        <div className="space-y-3">
          {filteredQuizzes.map(quiz => (
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
