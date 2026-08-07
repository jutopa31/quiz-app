import type { Question, QuestionOption } from '../types/quiz'

/**
 * Stable, content-derived id for an option.
 *
 * Option ids used to be the array index ("0", "1", ...), which meant the stored
 * correct answer pointed at a *position*: reordering or inserting an option
 * silently moved the correct answer to a different text. Deriving the id from the
 * option text makes reordering a no-op.
 */
export function contentHash(text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
}

export function buildOptions(texts: unknown): QuestionOption[] {
  if (!Array.isArray(texts)) return []

  const seen = new Map<string, number>()
  return texts.map(raw => {
    const text = String(raw)
    const base = contentHash(text.trim())
    // Two options with identical text still need distinct ids.
    const occurrence = seen.get(base) ?? 0
    seen.set(base, occurrence + 1)
    return { id: occurrence === 0 ? base : `${base}-${occurrence}`, text }
  })
}

/** Shared shape normalizer for rows coming from Supabase or the static JSON. */
export function normalizeQuestion(raw: any): Question {
  const options = buildOptions(raw.options)
  const correctIndex =
    typeof raw.correct_option_index === 'number' &&
    raw.correct_option_index >= 0 &&
    raw.correct_option_index < options.length
      ? raw.correct_option_index
      : 0

  return {
    id: raw.id,
    quiz_id: raw.quiz_id,
    question_text: raw.question_text,
    question_type: raw.question_type || 'multiple_choice',
    options,
    // The answer travels as the option's own id, not as its position.
    correct_answer: options[correctIndex]?.id ?? '',
    correct_option_index: correctIndex,
    image_url: raw.image_url ?? null,
    explanation: raw.explanation ?? null,
    points: typeof raw.points === 'number' ? raw.points : 1,
    display_order: raw.display_order ?? 0,
    created_at: raw.created_at
  }
}

/**
 * Resolves whatever a stored attempt holds into a current option id.
 * Attempts recorded before stable ids stored the numeric index, so those are
 * still mapped by position.
 */
export function resolveSelectedOptionId(
  question: Question,
  storedOption: string | undefined,
  storedIndex?: number
): string | undefined {
  if (storedOption && question.options.some(o => o.id === storedOption)) {
    return storedOption
  }

  const legacyIndex =
    storedOption !== undefined && /^\d+$/.test(storedOption)
      ? Number(storedOption)
      : storedIndex

  if (legacyIndex !== undefined && question.options[legacyIndex]) {
    return question.options[legacyIndex].id
  }

  return undefined
}
