import { useParams, useNavigate } from 'react-router-dom'
import { Container } from '../../components/layout/Container'
import { PageLoader } from '../../components/ui/Spinner'
import { QuizForm } from '../../components/admin/QuizForm'
import { QuestionList } from '../../components/admin/QuestionList'
import { useQuizCreator } from '../../hooks/useQuizCreator'
import { publishQuiz } from '../../services/quizCreatorService'

export function QuizEditorPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const isNew = !quizId

  const {
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
    removeImage
  } = useQuizCreator(quizId)

  const handleSave = async () => {
    const saved = await saveQuiz()
    if (saved && isNew) {
      navigate(`/admin/quiz/${saved.id}`, { replace: true })
    }
  }

  const handlePublish = async () => {
    let id = draft.id
    if (!id) {
      const saved = await saveQuiz()
      id = saved?.id
    }
    if (!id) return
    const published = await publishQuiz(id)
    if (published) {
      setDraft(prev => ({ ...prev, status: published.status }))
    }
  }

  if (loading) {
    return (
      <Container>
        <PageLoader />
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <QuizForm
          draft={draft}
          onChange={(updates) => setDraft(prev => ({ ...prev, ...updates }))}
          onSave={handleSave}
          onPublish={handlePublish}
          saving={saving}
          isNew={isNew}
        />

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}

        {draft.id ? (
          <QuestionList
            questions={questions}
            onAdd={addQuestion}
            onSave={saveQuestion}
            onDelete={removeQuestion}
            onMove={moveQuestion}
            onUploadImage={uploadImage}
            onRemoveImage={removeImage}
            saving={saving}
          />
        ) : (
          <p className="text-sm text-gray-500">
            Guarda el quiz para empezar a crear preguntas.
          </p>
        )}
      </div>
    </Container>
  )
}
