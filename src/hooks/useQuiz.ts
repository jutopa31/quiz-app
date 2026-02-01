import { useState, useEffect } from 'react'
import { fetchQuizWithQuestions } from '../services/quizService'
import type { Quiz, Question } from '../types/quiz'

export function useQuiz(quizId: string | undefined) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) {
      setLoading(false)
      return
    }

    loadQuiz()
  }, [quizId])

  async function loadQuiz() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchQuizWithQuestions(quizId!)
      if (data) {
        setQuiz(data.quiz)
        setQuestions(data.questions)
      } else {
        setError('Quiz no encontrado')
      }
    } catch (err) {
      setError('Error al cargar el quiz')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { quiz, questions, loading, error }
}
