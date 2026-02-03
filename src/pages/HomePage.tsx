import { useMemo, useState } from 'react'
import { useQuizzes } from '../hooks/useQuizzes'
import { Container } from '../components/layout/Container'
import { QuizCard } from '../components/quiz/QuizCard'
import { PageLoader } from '../components/ui/Spinner'
import { InstallAppBanner } from '../components/ui/InstallAppBanner'

export function HomePage() {
  const { quizzes, loading, error } = useQuizzes()
  const [search, setSearch] = useState('')

  const filteredQuizzes = useMemo(() => {
    if (!search.trim()) return quizzes
    const term = search.toLowerCase()
    return quizzes.filter(q =>
      q.title.toLowerCase().includes(term) ||
      q.description?.toLowerCase().includes(term)
    )
  }, [quizzes, search])

  if (loading) {
    return (
      <Container>
        <PageLoader />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <InstallAppBanner />
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Quizzes disponibles</h1>

      {quizzes.length > 0 && (
        <div className="relative mb-4">
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
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No hay quizzes disponibles</p>
          <p className="text-sm text-gray-400 mt-1">Los quizzes aparecerán aquí cuando sean publicados</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron quizzes con "{search}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuizzes.map(quiz => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </Container>
  )
}
