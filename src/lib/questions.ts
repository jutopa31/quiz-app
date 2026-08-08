import type { Question, QuestionOption } from '../types/quiz'
import { contentHash, buildOptionIds } from './optionIds.js'

export { contentHash }

export function buildOptions(texts: unknown, storedIds?: unknown): QuestionOption[] {
  if (!Array.isArray(texts)) return []

  // Prefer the ids stored alongside the row; fall back to deriving them, which
  // yields the same values (both sides use src/lib/optionIds.js).
  const ids =
    Array.isArray(storedIds) && storedIds.length === texts.length
      ? storedIds.map(String)
      : buildOptionIds(texts)

  return texts.map((raw, index) => ({ id: ids[index], text: String(raw) }))
}

/** Shared shape normalizer for rows coming from Supabase or the static JSON. */
export function normalizeQuestion(raw: any): Question {
  const options = buildOptions(raw.options, raw.option_ids)
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
    correct_answer:
      (typeof raw.correct_option_id === 'string' &&
      options.some(option => option.id === raw.correct_option_id)
        ? raw.correct_option_id
        : options[correctIndex]?.id) ?? '',
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
