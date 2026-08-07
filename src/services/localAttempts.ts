import type { QuizAttempt, AttemptAnswer } from '../types/quiz'
import { getStaticQuizTitle } from '../data/staticQuizzes'

/**
 * Attempts for static (JSON-backed) quizzes live in the browser: their quiz ids
 * are file slugs, not rows in `academy_quizzes`, so they cannot be stored there.
 */
const STORAGE_KEY = 'quiz-app:local-attempts:v1'

export type StoredAttempt = QuizAttempt & {
  academy_quizzes?: { id: string; title: string }
}

/** Guest identities created by AuthProvider; they have no row in Supabase. */
export function isLocalUserId(userId: string | undefined): boolean {
  return !!userId && userId.startsWith('local-user-')
}

export function isLocalAttemptId(attemptId: string | undefined): boolean {
  return !!attemptId && attemptId.startsWith('local-')
}

function readAll(): StoredAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(attempts: StoredAttempt[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
  } catch (error) {
    console.warn('No se pudo guardar el intento localmente:', error)
  }
}

export function createLocalAttempt(quizId: string, userId: string): StoredAttempt {
  const now = new Date().toISOString()
  const attempt: StoredAttempt = {
    id: `local-${quizId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quiz_id: quizId,
    user_id: userId,
    score: 0,
    total_questions: 0,
    total_points: 0,
    answers: [],
    started_at: now,
    created_at: now,
    completed_at: null,
    academy_quizzes: { id: quizId, title: getStaticQuizTitle(quizId) ?? 'Quiz' }
  }

  writeAll([attempt, ...readAll()])
  return attempt
}

export function submitLocalAttempt(
  attemptId: string,
  score: number,
  totalQuestions: number,
  answers: AttemptAnswer[],
  timeSpentSeconds?: number
): StoredAttempt | null {
  const attempts = readAll()
  const index = attempts.findIndex(a => a.id === attemptId)
  if (index === -1) return null

  const updated: StoredAttempt = {
    ...attempts[index],
    score,
    total_questions: totalQuestions,
    total_points: totalQuestions,
    answers,
    completed_at: new Date().toISOString(),
    time_spent_seconds: timeSpentSeconds ?? null
  }

  attempts[index] = updated
  writeAll(attempts)
  return updated
}

export function listLocalAttempts(userId: string): StoredAttempt[] {
  return readAll()
    .filter(a => a.user_id === userId && (a.total_questions ?? 0) > 0)
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
}

export function getLocalAttempt(attemptId: string, userId: string): StoredAttempt | null {
  return readAll().find(a => a.id === attemptId && a.user_id === userId) ?? null
}

/** Best score (%) and attempt count per quiz, for the home cards. */
export function localAttemptStats(
  userId: string
): Record<string, { best_score: number; count: number }> {
  return listLocalAttempts(userId).reduce((acc, attempt) => {
    const total = attempt.total_questions || 1
    const percentage = Math.round(((attempt.score || 0) / total) * 100)
    const current = acc[attempt.quiz_id]
    acc[attempt.quiz_id] = {
      best_score: current ? Math.max(current.best_score, percentage) : percentage,
      count: (current?.count ?? 0) + 1
    }
    return acc
  }, {} as Record<string, { best_score: number; count: number }>)
}
