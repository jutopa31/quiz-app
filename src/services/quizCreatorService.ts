import { supabase } from './supabase'
import type { Quiz } from '../types/quiz'

const missingColumnsByTable = new Map<string, Set<string>>()

function stripMissingColumns<T extends Record<string, unknown>>(table: string, payload: T) {
  const missing = missingColumnsByTable.get(table)
  if (!missing || missing.size === 0) return payload
  const cleaned: Record<string, unknown> = { ...payload }
  missing.forEach(column => {
    if (column in cleaned) delete cleaned[column]
  })
  return cleaned as T
}

function handleMissingColumnError<T extends Record<string, unknown>>(table: string, payload: T, error: any) {
  if (error?.code !== 'PGRST204' || typeof error?.message !== 'string') return null
  const match = error.message.match(/'([^']+)' column/)
  if (!match) return null
  const column = match[1]
  const missing = missingColumnsByTable.get(table) ?? new Set<string>()
  missing.add(column)
  missingColumnsByTable.set(table, missing)
  const cleaned: Record<string, unknown> = { ...payload }
  if (column in cleaned) delete cleaned[column]
  return cleaned as T
}

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
    const table = 'academy_quizzes'
    let insertPayload = stripMissingColumns(table, {
      title: payload.title,
      description: payload.description ?? null,
      time_limit_minutes: payload.time_limit_minutes ?? null,
      shuffle_questions: payload.shuffle_questions ?? false,
      show_correct_answers: payload.show_correct_answers ?? true,
      status: 'draft',
      created_by: payload.created_by
    })

    let { data, error } = await supabase.from(table).insert(insertPayload).select().single()
    if (error?.code === 'PGRST204') {
      const retried = handleMissingColumnError(table, insertPayload, error)
      if (retried) {
        insertPayload = retried
        ;({ data, error } = await supabase.from(table).insert(insertPayload).select().single())
      }
    }

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
    const table = 'academy_quizzes'
    let updatePayload = stripMissingColumns(table, updates)
    let { data, error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', quizId)
      .select()
      .single()
    if (error?.code === 'PGRST204') {
      const retried = handleMissingColumnError(table, updatePayload as Record<string, unknown>, error)
      if (retried) {
        updatePayload = retried as typeof updates
        ;({ data, error } = await supabase
          .from(table)
          .update(updatePayload)
          .eq('id', quizId)
          .select()
          .single())
      }
    }

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
  console.log('🗑️ [deleteQuiz] Starting delete for quizId:', quizId)

  try {
    // Check current auth state
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    console.log('🔐 [deleteQuiz] Auth state:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      authError: authError?.message
    })

    if (!session) {
      console.error('🔴 [deleteQuiz] No active session - user not authenticated')
      return false
    }

    // Try to delete
    console.log('🗑️ [deleteQuiz] Executing delete query...')
    const { data, error, status, statusText } = await supabase
      .from('academy_quizzes')
      .delete()
      .eq('id', quizId)
      .select()

    console.log('🗑️ [deleteQuiz] Delete response:', {
      data,
      error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null,
      status,
      statusText
    })

    if (error) {
      console.error('🔴 [deleteQuiz] Delete failed:', error)
      throw error
    }

    console.log('✅ [deleteQuiz] Delete successful')
    return true
  } catch (error: any) {
    console.error('🔴 [deleteQuiz] Exception caught:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack
    })
    return false
  }
}
