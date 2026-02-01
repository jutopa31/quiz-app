import { supabase } from './supabase'
import type { Quiz, Question } from '../types/quiz'

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
    explanation: raw.explanation ?? null,
    points: typeof raw.points === 'number' ? raw.points : 1,
    display_order: raw.display_order ?? 0,
    created_at: raw.created_at
  }
}

export async function fetchPublishedQuizzes(userId?: string): Promise<Quiz[]> {
  try {
    // Get published quizzes with question count
    const { data: quizzes, error } = await supabase
      .from('academy_quizzes')
      .select(`
        *,
        academy_quiz_questions(count)
      `)
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Get user's attempts if logged in
    let attemptsMap: Record<string, { best_score: number; count: number }> = {}

    if (userId) {
      const { data: attempts } = await supabase
        .from('academy_quiz_attempts')
        .select('quiz_id, score')
        .eq('user_id', userId)
        .not('score', 'is', null)

      if (attempts) {
        attemptsMap = attempts.reduce((acc, attempt) => {
          if (!acc[attempt.quiz_id]) {
            acc[attempt.quiz_id] = { best_score: attempt.score, count: 0 }
          }
          acc[attempt.quiz_id].count++
          if (attempt.score > acc[attempt.quiz_id].best_score) {
            acc[attempt.quiz_id].best_score = attempt.score
          }
          return acc
        }, {} as Record<string, { best_score: number; count: number }>)
      }
    }

    return (quizzes || []).map(quiz => ({
      ...quiz,
      shuffle_questions: quiz.shuffle_questions ?? false,
      show_correct_answers: quiz.show_correct_answers ?? true,
      question_count: quiz.academy_quiz_questions?.[0]?.count || 0,
      user_best_score: attemptsMap[quiz.id]?.best_score ?? null,
      user_attempts_count: attemptsMap[quiz.id]?.count || 0
    }))
  } catch (error) {
    console.error('🔴 Error fetching quizzes:', error)
    return []
  }
}

export async function fetchQuizWithQuestions(quizId: string): Promise<{ quiz: Quiz; questions: Question[] } | null> {
  try {
    // Fetch quiz
    const { data: quiz, error: quizError } = await supabase
      .from('academy_quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('status', 'published')
      .single()

    if (quizError || !quiz) {
      console.error('🔴 Quiz not found:', quizError)
      return null
    }

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase
      .from('academy_quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('display_order', { ascending: true })

    if (questionsError) {
      console.error('🔴 Error fetching questions:', questionsError)
      return null
    }

    // Shuffle questions if enabled
    let orderedQuestions = (questions || []).map(normalizeQuestion)
    if (quiz.shuffle_questions ?? false) {
      orderedQuestions = [...orderedQuestions].sort(() => Math.random() - 0.5)
    }

    return {
      quiz: {
        ...quiz,
        shuffle_questions: quiz.shuffle_questions ?? false,
        show_correct_answers: quiz.show_correct_answers ?? true,
        question_count: orderedQuestions.length
      },
      questions: orderedQuestions
    }
  } catch (error) {
    console.error('🔴 Error fetching quiz with questions:', error)
    return null
  }
}
