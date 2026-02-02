import type { Question } from '../../types/quiz'
import { Button } from '../ui/Button'
import { QuestionEditor } from './QuestionEditor'

interface QuestionListProps {
  questions: Question[]
  onAdd: () => Promise<void>
  onSave: (questionId: string, updates: {
    question_text: string
    question_type: 'multiple_choice' | 'true_false'
    options: string[]
    correct_option_index: number
    explanation: string | null
    points: number
  }) => Promise<void>
  onDelete: (questionId: string) => Promise<void>
  onMove: (questionId: string, direction: 'up' | 'down') => Promise<boolean>
  onUploadImage: (questionId: string, file: File) => Promise<void>
  onRemoveImage: (questionId: string, imageUrl: string | null | undefined) => Promise<void>
  saving?: boolean
}

export function QuestionList({
  questions,
  onAdd,
  onSave,
  onDelete,
  onMove,
  onUploadImage,
  onRemoveImage,
  saving
}: QuestionListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Preguntas</h2>
        <Button type="button" variant="secondary" onClick={onAdd} disabled={saving}>
          Agregar pregunta
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-gray-500">Agrega tu primera pregunta.</p>
      ) : null}

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Pregunta {index + 1}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => onMove(question.id, 'up')}
                >
                  Subir
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === questions.length - 1}
                  onClick={() => onMove(question.id, 'down')}
                >
                  Bajar
                </Button>
              </div>
            </div>
            <QuestionEditor
              question={question}
              onSave={onSave}
              onDelete={onDelete}
              onUploadImage={onUploadImage}
              onRemoveImage={onRemoveImage}
              saving={saving}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
