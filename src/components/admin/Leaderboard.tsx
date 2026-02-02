import { useState } from 'react'
import type { QuizLeaderboard, UserRanking } from '../../types/quiz'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface LeaderboardProps {
  userRankings: UserRanking[]
  quizLeaderboards: QuizLeaderboard[]
}

export function Leaderboard({ userRankings, quizLeaderboards }: LeaderboardProps) {
  const [view, setView] = useState<'overall' | 'quiz'>('overall')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={view === 'overall' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setView('overall')}
        >
          General
        </Button>
        <Button
          type="button"
          variant={view === 'quiz' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setView('quiz')}
        >
          Por quiz
        </Button>
      </div>

      {view === 'overall' ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Ranking general</h2>
          {userRankings.length === 0 ? (
            <p className="text-sm text-gray-500">No hay datos disponibles.</p>
          ) : (
            <div className="space-y-2">
              {userRankings.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-gray-400">{index + 1}</span>
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>{user.average_score}%</span>
                    <span>{user.total_attempts} intentos</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {quizLeaderboards.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-500">No hay datos disponibles.</p>
            </Card>
          ) : (
            quizLeaderboards.map((quiz) => (
              <Card key={quiz.quiz_id} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">{quiz.quiz_title}</h3>
                {quiz.entries.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin intentos registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {quiz.entries.map((entry, index) => (
                      <div key={`${quiz.quiz_id}-${entry.user_id}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-gray-400">{index + 1}</span>
                          <span className="text-gray-900">{entry.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span>{entry.best_score}%</span>
                          <span>{entry.attempts} intentos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
