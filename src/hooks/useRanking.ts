import { useEffect, useState } from 'react'
import type { QuizLeaderboard, UserRanking } from '../types/quiz'
import { fetchRankings } from '../services/rankingService'

export function useRanking() {
  const [userRankings, setUserRankings] = useState<UserRanking[]>([])
  const [quizLeaderboards, setQuizLeaderboards] = useState<QuizLeaderboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRankings()
  }, [])

  async function loadRankings() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRankings()
      setUserRankings(data.userRankings)
      setQuizLeaderboards(data.quizLeaderboards)
    } catch (err) {
      console.error(err)
      setError('Error al cargar rankings')
    } finally {
      setLoading(false)
    }
  }

  return { userRankings, quizLeaderboards, loading, error, refresh: loadRankings }
}
