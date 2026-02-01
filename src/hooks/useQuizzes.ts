import { useState, useEffect } from 'react'
import { fetchPublishedQuizzes } from '../services/quizService'
import { useAuth } from '../components/auth/AuthProvider'
import type { Quiz } from '../types/quiz'

export function useQuizzes() {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuizzes()
  }, [user?.id])

  async function loadQuizzes() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPublishedQuizzes(user?.id)
      setQuizzes(data)
    } catch (err) {
      setError('Error al cargar quizzes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { quizzes, loading, error, refresh: loadQuizzes }
}
