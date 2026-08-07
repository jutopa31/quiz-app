import { supabase, isSupabaseConfigured } from './supabase'
import { normalizeQuestion } from '../lib/questions'
import { getStaticQuiz } from '../data/staticQuizzes'
import {
  createLocalAttempt,
  submitLocalAttempt,
  listLocalAttempts,
  getLocalAttempt,
  isLocalAttemptId,
  isLocalUserId
} from './localAttempts'
import type { QuizAttempt, AttemptAnswer, Question } from '../types/quiz'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Quizzes exported from Supabase keep their UUID; repo-only ones use a slug. */
function isDatabaseQuizId(quizId: string): boolean {
  return UUID_RE.test(quizId)
}

function parseAnswers(raw: unknown): AttemptAnswer[] {
  if (Array.isArray(raw)) {
    return raw as AttemptAnswer[]
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function normalizeAttempt(raw: any): QuizAttempt {
  const totalQuestions = typeof raw.total_questions === 'number' ? raw.total_questions : undefined
  return {
    ...raw,
    total_questions: totalQuestions,
    total_points: typeof raw.total_points === 'number' ? raw.total_points : totalQuestions ?? null,
    completed_at: raw.completed_at ?? raw.created_at ?? null,
    answers: parseAnswers(raw.answers)
  }
}

export async function createAttempt(quizId: string, userId: string, userEmail?: string): Promise<QuizAttempt | null> {
  // Signed-in users keep recording to Supabase, but only for quizzes that exist
  // there: a repo-only quiz has a slug id with no matching row.
  if (isLocalUserId(userId) || !isSupabaseConfigured || !isDatabaseQuizId(quizId)) {
    return createLocalAttempt(quizId, userId)
  }

  try {
    const insertData: Record<string, unknown> = {
      quiz_id: quizId,
      user_id: userId,
      score: 0,
      total_questions: 0,
      answers: JSON.stringify([])
    }
    // Store user email for ranking display if provided
    if (userEmail) {
      insertData.user_email = userEmail
    }

    const { data, error } = await supabase
      .from('academy_quiz_attempts')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error', error)
      throw error
    }
    return data ? normalizeAttempt(data) : null
  } catch (error) {
    console.error('🔴 Error creating attempt:', error)
    return null
  }
}

export async function submitAttempt(
  attemptId: string,
  userId: string,
  answers: Record<string, string>,
  questions: Question[],
  startedAt: Date
): Promise<QuizAttempt | null> {
  // Grade against the option's stable id, and record the index only as a hint.
  let score = 0
  const totalQuestions = questions.length
  const attemptAnswers: AttemptAnswer[] = []

  for (const question of questions) {
    const selectedOption = answers[question.id]
    const isCorrect = !!selectedOption && selectedOption === question.correct_answer
    score += isCorrect ? 1 : 0

    const selectedIndex = question.options.findIndex(o => o.id === selectedOption)
    attemptAnswers.push({
      question_id: question.id,
      selected_option: selectedOption || '',
      selected_index: selectedIndex >= 0 ? selectedIndex : undefined,
      is_correct: isCorrect
    })
  }

  const timeSpentSeconds = Math.max(
    0,
    Math.round((Date.now() - startedAt.getTime()) / 1000)
  )

  if (isLocalAttemptId(attemptId)) {
    return submitLocalAttempt(attemptId, score, totalQuestions, attemptAnswers, timeSpentSeconds)
  }

  try {
    const { error } = await supabase
      .from('academy_quiz_attempts')
      .update({
        score,
        total_questions: totalQuestions,
        answers: JSON.stringify(attemptAnswers)
      })
      .eq('id', attemptId)
      .eq('user_id', userId)

    if (error) throw error
    return normalizeAttempt({
      id: attemptId,
      quiz_id: questions[0]?.quiz_id,
      user_id: userId,
      score,
      total_questions: totalQuestions,
      answers: attemptAnswers,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('🔴 Error submitting attempt:', error)
    return null
  }
}

export async function fetchUserAttempts(userId: string): Promise<QuizAttempt[]> {
  const local = listLocalAttempts(userId)
  if (!isSupabaseConfigured || isLocalUserId(userId)) return local

  try {
    const { data, error } = await supabase
      .from('academy_quiz_attempts')
      .select(`
        *,
        academy_quizzes(id, title)
      `)
      .eq('user_id', userId)
      .gt('total_questions', 0)
      .order('created_at', { ascending: false })

    if (error) throw error
    return [...local, ...(data || []).map(normalizeAttempt)].sort((a, b) =>
      (b.created_at ?? '').localeCompare(a.created_at ?? '')
    )
  } catch (error) {
    console.error('🔴 Error fetching attempts:', error)
    return local
  }
}

export async function fetchAttemptDetail(attemptId: string, userId: string): Promise<{
  attempt: QuizAttempt
  quiz: { id: string; title: string; show_correct_answers: boolean }
  questions: Question[]
} | null> {
  if (isLocalAttemptId(attemptId)) {
    const attempt = getLocalAttempt(attemptId, userId)
    if (!attempt) return null

    const staticQuiz = getStaticQuiz(attempt.quiz_id)
    if (!staticQuiz) return null

    return {
      attempt: normalizeAttempt(attempt),
      quiz: {
        id: staticQuiz.quiz.id,
        title: staticQuiz.quiz.title,
        show_correct_answers: staticQuiz.quiz.show_correct_answers ?? true
      },
      questions: staticQuiz.questions
    }
  }

  if (!isSupabaseConfigured || isLocalUserId(userId)) return null

  try {
    const { data: attempt, error: attemptError } = await supabase
      .from('academy_quiz_attempts')
      .select(`
        *,
        academy_quizzes(id, title)
      `)
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single()

    if (attemptError || !attempt) return null

    const { data: questions, error: questionsError } = await supabase
      .from('academy_quiz_questions')
      .select('*')
      .eq('quiz_id', attempt.quiz_id)
      .order('display_order', { ascending: true })

    if (questionsError) return null

    return {
      attempt: normalizeAttempt(attempt),
      quiz: {
        ...attempt.academy_quizzes,
        show_correct_answers: true
      },
      questions: (questions || []).map(normalizeQuestion)
    }
  } catch (error) {
    console.error('🔴 Error fetching attempt detail:', error)
    return null
  }
}
