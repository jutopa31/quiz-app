import { supabase } from './supabase'
import type { Question } from '../types/quiz'

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

function normalizeQuestion(raw: any): Question {
  const options = Array.isArray(raw.options)
    ? raw.options.map((text: string, index: number) => ({
        id: String(index),
        text
      }))
    : []
  const correctIndex = typeof raw.correct_option_index === 'number' ? raw.correct_option_index : 0

  return {
    id: raw.id,
    quiz_id: raw.quiz_id,
    question_text: raw.question_text,
    question_type: raw.question_type || 'multiple_choice',
    options,
    correct_answer: String(correctIndex),
    correct_option_index: correctIndex,
    image_url: raw.image_url ?? null,
    explanation: raw.explanation ?? null,
    points: typeof raw.points === 'number' ? raw.points : 1,
    display_order: raw.display_order ?? 0,
    created_at: raw.created_at
  }
}

export async function fetchQuestionsForQuiz(quizId: string): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('academy_quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeQuestion)
  } catch (error) {
    console.error('🔴 Error fetching questions:', error)
    return []
  }
}

export async function createQuestion(payload: {
  quiz_id: string
  question_text: string
  question_type?: 'multiple_choice' | 'true_false'
  options: string[]
  correct_option_index: number
  explanation?: string | null
  points?: number
  display_order?: number
  image_url?: string | null
}): Promise<Question | null> {
  try {
    const table = 'academy_quiz_questions'
    let insertPayload = stripMissingColumns(table, {
      quiz_id: payload.quiz_id,
      question_text: payload.question_text,
      question_type: payload.question_type ?? 'multiple_choice',
      options: payload.options,
      correct_option_index: payload.correct_option_index,
      explanation: payload.explanation ?? null,
      points: payload.points ?? 1,
      display_order: payload.display_order ?? 0,
      image_url: payload.image_url ?? null
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
    return normalizeQuestion(data)
  } catch (error) {
    console.error('🔴 Error creating question:', error)
    return null
  }
}

export async function updateQuestion(
  questionId: string,
  updates: Partial<{
    question_text: string
    question_type: 'multiple_choice' | 'true_false'
    options: string[]
    correct_option_index: number
    explanation: string | null
    points: number
    display_order: number
    image_url: string | null
  }>
): Promise<Question | null> {
  try {
    const table = 'academy_quiz_questions'
    let updatePayload = stripMissingColumns(table, updates)
    let { data, error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', questionId)
      .select()
      .single()
    if (error?.code === 'PGRST204') {
      const retried = handleMissingColumnError(table, updatePayload as Record<string, unknown>, error)
      if (retried) {
        updatePayload = retried as typeof updates
        ;({ data, error } = await supabase
          .from(table)
          .update(updatePayload)
          .eq('id', questionId)
          .select()
          .single())
      }
    }

    if (error || !data) throw error
    return normalizeQuestion(data)
  } catch (error) {
    console.error('🔴 Error updating question:', error)
    return null
  }
}

export async function deleteQuestion(questionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('academy_quiz_questions')
      .delete()
      .eq('id', questionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('🔴 Error deleting question:', error)
    return false
  }
}

export async function reorderQuestions(quizId: string, orderedIds: string[]): Promise<boolean> {
  try {
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('academy_quiz_questions')
        .update({ display_order: index })
        .eq('id', id)
        .eq('quiz_id', quizId)
    )

    const results = await Promise.all(updates)
    const hasError = results.some(result => result.error)
    if (hasError) {
      throw results.find(result => result.error)?.error
    }
    return true
  } catch (error) {
    console.error('🔴 Error reordering questions:', error)
    return false
  }
}
