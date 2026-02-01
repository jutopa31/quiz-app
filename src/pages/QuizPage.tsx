import { useParams, Link } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import { Container } from '../components/layout/Container'
import { QuizPlayer } from '../components/quiz/QuizPlayer'
import { PageLoader } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

export function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const { quiz, questions, loading, error } = useQuiz(quizId)

  if (loading) {
    return (
      <Container>
        <PageLoader />
      </Container>
    )
  }

  if (error || !quiz) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || 'Quiz no encontrado'}</p>
          <Link to="/">
            <Button variant="secondary">Volver al inicio</Button>
          </Link>
        </div>
      </Container>
    )
  }

  if (questions.length === 0) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Este quiz no tiene preguntas</p>
          <Link to="/">
            <Button variant="secondary">Volver al inicio</Button>
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <QuizPlayer quiz={quiz} questions={questions} />
    </Container>
  )
}
