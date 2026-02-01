import { useState, useEffect } from 'react'
import { fetchUserAttempts } from '../services/attemptService'
import { useAuth } from '../components/auth/AuthProvider'
import type { QuizAttempt } from '../types/quiz'

export function useAttempts() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setAttempts([])
      setLoading(false)
      return
    }

    loadAttempts()
  }, [user?.id])

  async function loadAttempts() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUserAttempts(user!.id)
      setAttempts(data)
    } catch (err) {
      setError('Error al cargar historial')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { attempts, loading, error, refresh: loadAttempts }
}
