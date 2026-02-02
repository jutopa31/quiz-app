import { supabase } from './supabase'
import type { QuizLeaderboard, UserRanking } from '../types/quiz'

type AttemptRow = {
  user_id: string
  user_email?: string | null
  resolved_email?: string | null
  quiz_id: string
  score: number | null
  total_questions: number | null
  academy_quizzes?: { title: string }[] | null
}

function scoreToPercentage(score: number | null, totalQuestions: number | null) {
  if (score === null) return 0
  if (totalQuestions && totalQuestions > 0) {
    if (score > totalQuestions) return Math.round(score)
    return Math.round((score / totalQuestions) * 100)
  }
  return Math.round(score)
}

function buildEmailMap(prefilled: Record<string, string> = {}) {
  // Use emails stored directly in attempts - no external table lookups needed
  return { ...prefilled }
}

export async function fetchRankings(): Promise<{
  userRankings: UserRanking[]
  quizLeaderboards: QuizLeaderboard[]
}> {
  try {
    const { data, error } = await supabase
      .from('academy_quiz_attempts_with_email')
      .select(`
        user_id,
        user_email,
        resolved_email,
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
    const prefilledEmails: Record<string, string> = {}

    attempts.forEach(attempt => {
      userIds.add(attempt.user_id)
      // Use resolved_email from the view (joins with auth.users)
      const email = attempt.resolved_email || attempt.user_email
      if (email && !prefilledEmails[attempt.user_id]) {
        prefilledEmails[attempt.user_id] = email
      }
      const quizTitle = attempt.academy_quizzes?.[0]?.title
      if (quizTitle) {
        quizTitleMap.set(attempt.quiz_id, quizTitle)
      }
    })

    const emails = buildEmailMap(prefilledEmails)

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
        title: attempt.academy_quizzes?.[0]?.title ?? 'Quiz',
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
