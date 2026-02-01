import { supabase } from './supabase'
import type { QuizAttempt, AttemptAnswer, Question } from '../types/quiz'

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

export async function createAttempt(quizId: string, userId: string): Promise<QuizAttempt | null> {
  try {
    const { data, error } = await supabase
      .from('academy_quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: userId,
        score: 0,
        total_questions: 0,
        answers: JSON.stringify([])
      })
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
  try {
    void startedAt
    // Calculate score
    let score = 0
    const totalQuestions = questions.length
    const attemptAnswers: AttemptAnswer[] = []

    for (const question of questions) {
      const selectedOption = answers[question.id]
      const isCorrect = selectedOption === question.correct_answer
      score += isCorrect ? 1 : 0

      attemptAnswers.push({
        question_id: question.id,
        selected_option: selectedOption || '',
        selected_index: selectedOption ? Number(selectedOption) : undefined,
        is_correct: isCorrect
      })
    }

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
    return (data || []).map(normalizeAttempt)
  } catch (error) {
    console.error('🔴 Error fetching attempts:', error)
    return []
  }
}

export async function fetchAttemptDetail(attemptId: string, userId: string): Promise<{
  attempt: QuizAttempt
  quiz: { id: string; title: string; show_correct_answers: boolean }
  questions: Question[]
} | null> {
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
