import { supabase } from './supabase'
import type { QuizLeaderboard, UserRanking } from '../types/quiz'

type AttemptRow = {
  user_id: string
  quiz_id: string
  score: number | null
  total_questions: number | null
  academy_quizzes?: { title: string } | null
}

function scoreToPercentage(score: number | null, totalQuestions: number | null) {
  if (score === null) return 0
  if (totalQuestions && totalQuestions > 0) {
    if (score > totalQuestions) return Math.round(score)
    return Math.round((score / totalQuestions) * 100)
  }
  return Math.round(score)
}

async function fetchUserEmails(userIds: string[]) {
  if (userIds.length === 0) return {} as Record<string, string>

  const tables = [
    { table: 'profiles', idColumn: 'id', emailColumn: 'email' },
    { table: 'academy_users', idColumn: 'id', emailColumn: 'email' },
    { table: 'users', idColumn: 'id', emailColumn: 'email' }
  ]

  for (const { table, idColumn, emailColumn } of tables) {
    const { data, error } = await supabase
      .from(table)
      .select(`${idColumn}, ${emailColumn}`)
      .in(idColumn, userIds)

    if (!error && data && data.length > 0) {
      return data.reduce((acc: Record<string, string>, row: any) => {
        acc[row[idColumn]] = row[emailColumn]
        return acc
      }, {})
    }
  }

  return {} as Record<string, string>
}

export async function fetchRankings(): Promise<{
  userRankings: UserRanking[]
  quizLeaderboards: QuizLeaderboard[]
}> {
  try {
    const { data, error } = await supabase
      .from('academy_quiz_attempts')
      .select(`
        user_id,
        quiz_id,
        score,
        total_questions,
        academy_quizzes(title)
      `)
      .not('score', 'is', null)

    if (error) throw error

    const attempts = (data || []) as AttemptRow[]
    const quizTitleMap = new Map<string, string>()
    const userIds = new Set<string>()

    attempts.forEach(attempt => {
      userIds.add(attempt.user_id)
      if (attempt.academy_quizzes?.title) {
        quizTitleMap.set(attempt.quiz_id, attempt.academy_quizzes.title)
      }
    })

    const emails = await fetchUserEmails(Array.from(userIds))

    const userMap = new Map<string, { totalAttempts: number; totalScore: number; bestByQuiz: Map<string, { score: number; attempts: number }> }>()
    const quizMap = new Map<string, { title: string; entries: Map<string, { bestScore: number; attempts: number }> }>()

    attempts.forEach(attempt => {
      const percent = scoreToPercentage(attempt.score, attempt.total_questions)
      const userEntry = userMap.get(attempt.user_id) ?? {
        totalAttempts: 0,
        totalScore: 0,
        bestByQuiz: new Map()
      }
      userEntry.totalAttempts += 1
      userEntry.totalScore += percent

      const bestQuizEntry = userEntry.bestByQuiz.get(attempt.quiz_id) ?? { score: 0, attempts: 0 }
      bestQuizEntry.attempts += 1
      bestQuizEntry.score = Math.max(bestQuizEntry.score, percent)
      userEntry.bestByQuiz.set(attempt.quiz_id, bestQuizEntry)
      userMap.set(attempt.user_id, userEntry)

      const quizEntry = quizMap.get(attempt.quiz_id) ?? {
        title: attempt.academy_quizzes?.title ?? 'Quiz',
        entries: new Map()
      }
      const userQuizEntry = quizEntry.entries.get(attempt.user_id) ?? { bestScore: 0, attempts: 0 }
      userQuizEntry.attempts += 1
      userQuizEntry.bestScore = Math.max(userQuizEntry.bestScore, percent)
      quizEntry.entries.set(attempt.user_id, userQuizEntry)
      quizMap.set(attempt.quiz_id, quizEntry)
    })

    const userRankings: UserRanking[] = Array.from(userMap.entries()).map(([userId, stats]) => {
      const bestScores = Array.from(stats.bestByQuiz.entries()).map(([quizId, best]) => ({
        quiz_id: quizId,
        quiz_title: quizTitleMap.get(quizId) ?? 'Quiz',
        score: best.score
      }))

      bestScores.sort((a, b) => b.score - a.score)

      return {
        user_id: userId,
        email: emails[userId] ?? userId,
        total_attempts: stats.totalAttempts,
        average_score: stats.totalAttempts > 0 ? Math.round(stats.totalScore / stats.totalAttempts) : 0,
        best_scores: bestScores
      }
    })

    userRankings.sort((a, b) => b.average_score - a.average_score || b.total_attempts - a.total_attempts)

    const quizLeaderboards: QuizLeaderboard[] = Array.from(quizMap.entries()).map(([quizId, quiz]) => ({
      quiz_id: quizId,
      quiz_title: quiz.title ?? 'Quiz',
      entries: Array.from(quiz.entries.entries())
        .map(([userId, entry]) => ({
          user_id: userId,
          email: emails[userId] ?? userId,
          best_score: entry.bestScore,
          attempts: entry.attempts
        }))
        .sort((a, b) => b.best_score - a.best_score || b.attempts - a.attempts)
    }))

    return { userRankings, quizLeaderboards }
  } catch (error) {
    console.error('🔴 Error fetching rankings:', error)
    return { userRankings: [], quizLeaderboards: [] }
  }
}
