import { useEffect, useState } from 'react'
import { useAuth } from '../components/auth/AuthProvider'
import type { Question, Quiz } from '../types/quiz'
import { createQuiz, fetchQuizById, updateQuiz } from '../services/quizCreatorService'
import { createQuestion, deleteQuestion, fetchQuestionsForQuiz, reorderQuestions, updateQuestion } from '../services/questionService'
import { deleteQuizImage, uploadQuizImage } from '../services/imageService'

interface QuizDraft {
  id?: string
  title: string
  description: string | null
  time_limit_minutes: number | null
  passing_score: number | null
  shuffle_questions: boolean
  show_correct_answers: boolean
  status?: Quiz['status']
}

const defaultDraft: QuizDraft = {
  title: '',
  description: null,
  time_limit_minutes: null,
  passing_score: null,
  shuffle_questions: false,
  show_correct_answers: true,
  status: 'draft'
}

export function useQuizCreator(quizId: string | undefined) {
  const { user } = useAuth()
  const [draft, setDraft] = useState<QuizDraft>(defaultDraft)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) {
      setLoading(false)
      return
    }
    loadQuiz(quizId)
  }, [quizId])

  async function loadQuiz(id: string) {
    setLoading(true)
    setError(null)
    try {
      const quiz = await fetchQuizById(id)
      if (!quiz) {
        setError('Quiz no encontrado')
        setLoading(false)
        return
      }
      setDraft({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description ?? null,
        time_limit_minutes: quiz.time_limit_minutes ?? null,
        passing_score: quiz.passing_score ?? null,
        shuffle_questions: quiz.shuffle_questions ?? false,
        show_correct_answers: quiz.show_correct_answers ?? true,
        status: quiz.status
      })
      const quizQuestions = await fetchQuestionsForQuiz(id)
      setQuestions(quizQuestions)
    } catch (err) {
      console.error(err)
      setError('Error al cargar quiz')
    } finally {
      setLoading(false)
    }
  }

  async function saveQuiz() {
    if (!user?.id) {
      setError('No hay usuario activo')
      return null
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: draft.title,
        description: draft.description,
        time_limit_minutes: draft.time_limit_minutes,
        passing_score: draft.passing_score,
        shuffle_questions: draft.shuffle_questions,
        show_correct_answers: draft.show_correct_answers
      }
      const saved = draft.id
        ? await updateQuiz(draft.id, payload)
        : await createQuiz({ ...payload, created_by: user.id })
      if (saved) {
        setDraft(prev => ({
          ...prev,
          id: saved.id,
          status: saved.status
        }))
      }
      return saved
    } catch (err) {
      console.error(err)
      setError('Error al guardar quiz')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function addQuestion() {
    if (!draft.id) {
      setError('Guarda el quiz antes de agregar preguntas')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const newQuestion = await createQuestion({
        quiz_id: draft.id,
        question_text: 'Nueva pregunta',
        question_type: 'multiple_choice',
        options: ['Opcion 1', 'Opcion 2', 'Opcion 3', 'Opcion 4'],
        correct_option_index: 0,
        points: 1,
        display_order: questions.length
      })
      if (newQuestion) {
        setQuestions(prev => [...prev, newQuestion])
      }
      return
    } catch (err) {
      console.error(err)
      setError('Error al crear pregunta')
      return
    } finally {
      setSaving(false)
    }
  }

  async function saveQuestion(questionId: string, updates: Parameters<typeof updateQuestion>[1]) {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateQuestion(questionId, updates)
      if (updated) {
        setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)))
      }
      return
    } catch (err) {
      console.error(err)
      setError('Error al actualizar pregunta')
      return
    } finally {
      setSaving(false)
    }
  }

  async function removeQuestion(questionId: string) {
    setSaving(true)
    setError(null)
    try {
      const ok = await deleteQuestion(questionId)
      if (ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId))
      }
      return
    } catch (err) {
      console.error(err)
      setError('Error al eliminar pregunta')
      return
    } finally {
      setSaving(false)
    }
  }

  async function moveQuestion(questionId: string, direction: 'up' | 'down') {
    if (!draft.id) return false
    const index = questions.findIndex(q => q.id === questionId)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || swapIndex < 0 || swapIndex >= questions.length) return false

    const next = [...questions]
    const temp = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = temp
    setQuestions(next)

    const orderedIds = next.map(q => q.id)
    return reorderQuestions(draft.id, orderedIds)
  }

  async function uploadImage(questionId: string, file: File) {
    if (!draft.id) return
    setSaving(true)
    setError(null)
    try {
      const { publicUrl } = await uploadQuizImage(file, draft.id)
      const updated = await updateQuestion(questionId, { image_url: publicUrl })
      if (updated) {
        setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)))
      }
      return
    } catch (err) {
      console.error(err)
      setError('Error al subir imagen')
      return
    } finally {
      setSaving(false)
    }
  }

  async function removeImage(questionId: string, imageUrl: string | null | undefined) {
    if (!imageUrl) return
    setSaving(true)
    setError(null)
    try {
      await deleteQuizImage(imageUrl)
      const updated = await updateQuestion(questionId, { image_url: null })
      if (updated) {
        setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)))
      }
      return
    } catch (err) {
      console.error(err)
      setError('Error al eliminar imagen')
      return
    } finally {
      setSaving(false)
    }
  }

  return {
    draft,
    setDraft,
    questions,
    loading,
    saving,
    error,
    saveQuiz,
    addQuestion,
    saveQuestion,
    removeQuestion,
    moveQuestion,
    uploadImage,
    removeImage,
    reload: quizId ? () => loadQuiz(quizId) : undefined
  }
}
