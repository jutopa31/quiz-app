import { normalizeQuestion, contentHash } from '../lib/questions'
import type { Quiz, Question } from '../types/quiz'

/**
 * Quizzes served straight from JSON files versioned in the repo (`/quizzes`).
 * No Supabase round-trip: the content ships with the bundle, so the app works
 * offline and a new quiz is just a new file in that folder.
 */
interface StaticQuizFile {
  quiz: {
    /** Supabase UUID when the quiz was exported from the DB; absent for repo-only quizzes. */
    id?: string
    title: string
    description?: string | null
    time_limit_minutes?: number | null
    passing_score?: number | null
    shuffle_questions?: boolean
    show_correct_answers?: boolean
    feedback_mode?: 'end' | 'instant' | 'check'
    status?: string
    created_at?: string
    updated_at?: string
  }
  questions: any[]
}

const modules = import.meta.glob<StaticQuizFile>('../../quizzes/*.json', {
  eager: true,
  import: 'default'
})

/** `../../quizzes/desmielinizantes-sna-2023.json` -> `desmielinizantes-sna-2023` */
function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.json$/, '')
}

function build(path: string, file: StaticQuizFile): { quiz: Quiz; questions: Question[] } {
  // Keeping the Supabase id means attempts and ranking recorded against this
  // quiz stay valid; repo-only quizzes fall back to the filename slug.
  const id = file.quiz.id ?? slugFromPath(path)
  const timestamp = file.quiz.updated_at ?? file.quiz.created_at ?? '2026-01-01T00:00:00Z'

  const questions = file.questions.map((raw, index) =>
    normalizeQuestion({
      ...raw,
      // Question ids are derived from the text so they survive reordering.
      id: raw.id ?? `${id}::${contentHash(String(raw.question_text))}`,
      quiz_id: id,
      display_order: typeof raw.display_order === 'number' ? raw.display_order : index,
      created_at: timestamp
    })
  )

  const quiz: Quiz = {
    id,
    title: file.quiz.title,
    description: file.quiz.description ?? null,
    status: 'published',
    time_limit_minutes: file.quiz.time_limit_minutes ?? null,
    passing_score: file.quiz.passing_score ?? null,
    shuffle_questions: file.quiz.shuffle_questions ?? false,
    show_correct_answers: file.quiz.show_correct_answers ?? true,
    feedback_mode: file.quiz.feedback_mode ?? 'end',
    created_by: 'static',
    created_at: timestamp,
    updated_at: timestamp,
    question_count: questions.length
  }

  return { quiz, questions }
}

const entries = Object.entries(modules)
  .filter(([, file]) => file?.quiz && Array.isArray(file.questions))
  .map(([path, file]) => build(path, file))

const byId = new Map(entries.map(entry => [entry.quiz.id, entry]))

export function isStaticQuizId(quizId: string | undefined): boolean {
  return !!quizId && byId.has(quizId)
}

export function getStaticQuizzes(): Quiz[] {
  return entries.map(entry => ({ ...entry.quiz }))
}

export function getStaticQuiz(quizId: string): { quiz: Quiz; questions: Question[] } | null {
  const entry = byId.get(quizId)
  if (!entry) return null
  return {
    quiz: { ...entry.quiz },
    questions: entry.questions.map(question => ({ ...question }))
  }
}

export function getStaticQuizTitle(quizId: string): string | null {
  return byId.get(quizId)?.quiz.title ?? null
}
