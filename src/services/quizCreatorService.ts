import { supabase } from './supabase'
import type { Quiz } from '../types/quiz'

function normalizeQuiz(raw: any): Quiz {
  return {
    ...raw,
    shuffle_questions: raw.shuffle_questions ?? false,
    show_correct_answers: raw.show_correct_answers ?? true,
    question_count: raw.academy_quiz_questions?.[0]?.count ?? raw.question_count ?? 0
  }
}

export async function fetchAdminQuizzes(): Promise<Quiz[]> {
  try {
    const { data, error } = await supabase
      .from('academy_quizzes')
      .select(`
        *,
        academy_quiz_questions(count)
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeQuiz)
  } catch (error) {
    console.error('🔴 Error fetching admin quizzes:', error)
    return []
  }
}

export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  try {
    const { data, error } = await supabase
      .from('academy_quizzes')
      .select('*')
      .eq('id', quizId)
      .single()

    if (error || !data) return null
    return normalizeQuiz(data)
  } catch (error) {
    console.error('🔴 Error fetching quiz:', error)
    return null
  }
}

export async function createQuiz(payload: {
  title: string
  description?: string | null
  time_limit_minutes?: number | null
  shuffle_questions?: boolean
  show_correct_answers?: boolean
  created_by: string
}): Promise<Quiz | null> {
  try {
    const { passing_score: _passingScore, ...safePayload } = payload
    const { data, error } = await supabase
      .from('academy_quizzes')
      .insert({
        title: safePayload.title,
        description: safePayload.description ?? null,
        time_limit_minutes: safePayload.time_limit_minutes ?? null,
        shuffle_questions: safePayload.shuffle_questions ?? false,
        show_correct_answers: safePayload.show_correct_answers ?? true,
        status: 'draft',
        created_by: safePayload.created_by
      })
      .select()
      .single()

    if (error || !data) throw error
    return normalizeQuiz(data)
  } catch (error) {
    console.error('🔴 Error creating quiz:', error)
    return null
  }
}

export async function updateQuiz(
  quizId: string,
  updates: Partial<{
    title: string
    description: string | null
    time_limit_minutes: number | null
    shuffle_questions: boolean
    show_correct_answers: boolean
    status: Quiz['status']
    published_at: string | null
  }>
): Promise<Quiz | null> {
  try {
    const { passing_score: _passingScore, ...safeUpdates } = updates
    const { data, error } = await supabase
      .from('academy_quizzes')
      .update(safeUpdates)
      .eq('id', quizId)
      .select()
      .single()

    if (error || !data) throw error
    return normalizeQuiz(data)
  } catch (error) {
    console.error('🔴 Error updating quiz:', error)
    return null
  }
}

export async function publishQuiz(quizId: string): Promise<Quiz | null> {
  return updateQuiz(quizId, {
    status: 'published',
    published_at: new Date().toISOString()
  })
}

export async function deleteQuiz(quizId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('academy_quizzes')
      .delete()
      .eq('id', quizId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('🔴 Error deleting quiz:', error)
    return false
  }
}
