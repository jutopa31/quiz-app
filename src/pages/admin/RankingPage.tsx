import { Container } from '../../components/layout/Container'
import { PageLoader } from '../../components/ui/Spinner'
import { Leaderboard } from '../../components/admin/Leaderboard'
import { useRanking } from '../../hooks/useRanking'

export function RankingPage() {
  const { userRankings, quizLeaderboards, loading, error } = useRanking()

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
        <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}
        <Leaderboard userRankings={userRankings} quizLeaderboards={quizLeaderboards} />
      </div>
    </Container>
  )
}
