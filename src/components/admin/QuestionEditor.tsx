import { useEffect, useState } from 'react'
import type { Question } from '../../types/quiz'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ImageUploader } from './ImageUploader'

interface QuestionEditorProps {
  question: Question
  onSave: (questionId: string, updates: {
    question_text: string
    question_type: 'multiple_choice' | 'true_false'
    options: string[]
    correct_option_index: number
    explanation: string | null
    points: number
  }) => Promise<void>
  onDelete: (questionId: string) => Promise<void>
  onUploadImage: (questionId: string, file: File) => Promise<void>
  onRemoveImage: (questionId: string, imageUrl: string | null | undefined) => Promise<void>
  saving?: boolean
}

export function QuestionEditor({
  question,
  onSave,
  onDelete,
  onUploadImage,
  onRemoveImage,
  saving
}: QuestionEditorProps) {
  const [text, setText] = useState(question.question_text)
  const [type, setType] = useState<Question['question_type']>(question.question_type ?? 'multiple_choice')
  const [options, setOptions] = useState(question.options.map(option => option.text))
  const [correctIndex, setCorrectIndex] = useState<number>(question.correct_option_index ?? 0)
  const [points, setPoints] = useState<number>(question.points ?? 1)
  const [explanation, setExplanation] = useState<string>(question.explanation ?? '')
  const [localSaving, setLocalSaving] = useState(false)

  useEffect(() => {
    setText(question.question_text)
    setType(question.question_type ?? 'multiple_choice')
    setOptions(question.options.map(option => option.text))
    setCorrectIndex(question.correct_option_index ?? 0)
    setPoints(question.points ?? 1)
    setExplanation(question.explanation ?? '')
  }, [question])

  const isBusy = saving || localSaving

  const setTrueFalse = () => {
    setOptions(['Verdadero', 'Falso'])
    setCorrectIndex(0)
  }

  const handleTypeChange = (value: Question['question_type']) => {
    setType(value)
    if (value === 'true_false') {
      setTrueFalse()
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => prev.map((option, idx) => (idx === index ? value : option)))
  }

  const handleAddOption = () => {
    setOptions(prev => [...prev, `Opcion ${prev.length + 1}`])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return
    setOptions(prev => prev.filter((_, idx) => idx !== index))
    if (correctIndex === index) {
      setCorrectIndex(0)
    } else if (index < correctIndex) {
      setCorrectIndex(prev => Math.max(0, prev - 1))
    }
  }

  const handleSave = async () => {
    setLocalSaving(true)
    await onSave(question.id, {
      question_text: text,
      question_type: type ?? 'multiple_choice',
      options: options.map(option => option.trim()).filter(option => option.length > 0),
      correct_option_index: correctIndex,
      explanation: explanation.trim() ? explanation.trim() : null,
      points: points || 1
    })
    setLocalSaving(false)
  }

  const handleDelete = async () => {
    setLocalSaving(true)
    await onDelete(question.id)
    setLocalSaving(false)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Pregunta</label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>
        <div className="w-32">
          <label className="text-sm font-medium text-gray-700">Puntos</label>
          <input
            type="number"
            min={1}
            value={points}
            onChange={(event) => setPoints(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={type}
            onChange={(event) => handleTypeChange(event.target.value as Question['question_type'])}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="multiple_choice">Opcion multiple</option>
            <option value="true_false">Verdadero / Falso</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Respuesta correcta</label>
          <select
            value={correctIndex}
            onChange={(event) => setCorrectIndex(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            {options.map((option, index) => (
              <option key={index} value={index}>
                {option || `Opcion ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Opciones</label>
          {type === 'multiple_choice' ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleAddOption}>
              Agregar opcion
            </Button>
          ) : null}
        </div>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={`${question.id}-option-${index}`} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(event) => handleOptionChange(index, event.target.value)}
                disabled={type === 'true_false'}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 disabled:bg-gray-100"
              />
              {type === 'multiple_choice' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 2}
                >
                  Quitar
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Explicacion</label>
        <textarea
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Imagen (opcional)</label>
        <div className="mt-2">
          <ImageUploader
            value={question.image_url ?? null}
            loading={isBusy}
            onUpload={(file) => onUploadImage(question.id, file)}
            onRemove={() => onRemoveImage(question.id, question.image_url)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="secondary" disabled={isBusy} onClick={handleSave}>
          {isBusy ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button type="button" variant="ghost" disabled={isBusy} onClick={handleDelete}>
          Eliminar
        </Button>
      </div>
    </Card>
  )
}
