import { useParams, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Container } from '../components/layout/Container'
import { ResultsView } from '../components/quiz/ResultsView'
import { PageLoader } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { fetchAttemptDetail } from '../services/attemptService'
import { useAuth } from '../components/auth/AuthProvider'
import type { QuizAttempt, Question } from '../types/quiz'

export function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { user } = useAuth()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    attempt: QuizAttempt
    quiz: { id: string; title: string; show_correct_answers: boolean }
    questions: Question[]
  } | null>(null)

  useEffect(() => {
    const state = location.state as {
      attempt?: QuizAttempt
      quiz?: { id: string; title: string; show_correct_answers: boolean }
      questions?: Question[]
    } | null

    if (state?.attempt && state?.quiz && state?.questions) {
      setData({
        attempt: state.attempt,
        quiz: state.quiz,
        questions: state.questions
      })
      setLoading(false)
      return
    }

    if (!attemptId || !user) return

    fetchAttemptDetail(attemptId, user.id).then(result => {
      setData(result)
      setLoading(false)
    })
  }, [attemptId, user])

  if (loading) {
    return (
      <Container>
        <PageLoader />
      </Container>
    )
  }

  if (!data) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Resultado no encontrado</p>
          <Link to="/">
            <Button variant="secondary">Volver al inicio</Button>
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <ResultsView
        attempt={data.attempt}
        quiz={data.quiz}
        questions={data.questions}
      />
    </Container>
  )
}
