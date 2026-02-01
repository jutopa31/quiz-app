import { useEffect, useState } from 'react'
import type { Quiz } from '../types/quiz'
import { fetchAdminQuizzes } from '../services/quizCreatorService'

export function useAdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuizzes()
  }, [])

  async function loadQuizzes() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminQuizzes()
      setQuizzes(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar quizzes')
    } finally {
      setLoading(false)
    }
  }

  return { quizzes, loading, error, refresh: loadQuizzes }
}
