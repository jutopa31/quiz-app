import { useQuizzes } from '../hooks/useQuizzes'
import { Container } from '../components/layout/Container'
import { QuizCard } from '../components/quiz/QuizCard'
import { PageLoader } from '../components/ui/Spinner'
import { InstallAppBanner } from '../components/ui/InstallAppBanner'

export function HomePage() {
  const { quizzes, loading, error } = useQuizzes()

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quizzes disponibles</h1>

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
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </Container>
  )
}
