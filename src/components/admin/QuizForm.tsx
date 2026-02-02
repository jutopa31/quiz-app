import type { Quiz } from '../../types/quiz'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface QuizFormProps {
  draft: {
    title: string
    description: string | null
    time_limit_minutes: number | null
    passing_score: number | null
    shuffle_questions: boolean
    show_correct_answers: boolean
    status?: Quiz['status']
  }
  onChange: (updates: Partial<QuizFormProps['draft']>) => void
  onSave: () => Promise<void>
  onPublish: () => Promise<void>
  saving?: boolean
  isNew?: boolean
}

export function QuizForm({ draft, onChange, onSave, onPublish, saving, isNew }: QuizFormProps) {
  const handleNumber = (value: string) => (value === '' ? null : Number(value))

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          {isNew ? 'Nuevo quiz' : 'Editar quiz'}
        </h1>
        <span className="text-xs uppercase tracking-wide text-gray-400">
          {draft.status ?? 'draft'}
        </span>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Titulo</label>
        <input
          type="text"
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Descripcion</label>
        <textarea
          value={draft.description ?? ''}
          onChange={(event) => onChange({ description: event.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">Tiempo limite (min)</label>
          <input
            type="number"
            min={1}
            value={draft.time_limit_minutes ?? ''}
            onChange={(event) => onChange({ time_limit_minutes: handleNumber(event.target.value) })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Puntaje minimo (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.passing_score ?? ''}
            onChange={(event) => onChange({ passing_score: handleNumber(event.target.value) })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={draft.shuffle_questions}
            onChange={(event) => onChange({ shuffle_questions: event.target.checked })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
          />
          Mezclar preguntas
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={draft.show_correct_answers}
            onChange={(event) => onChange({ show_correct_answers: event.target.checked })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
          />
          Mostrar respuestas correctas al final
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar quiz'}
        </Button>
        {!isNew && draft.status !== 'published' ? (
          <Button type="button" variant="primary" onClick={onPublish} disabled={saving}>
            Publicar
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
