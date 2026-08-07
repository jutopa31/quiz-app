#!/usr/bin/env node
/**
 * Exports every published quiz from Supabase into `quizzes/<slug>.json`, the
 * static content the app reads at runtime.
 *
 * The Supabase UUIDs are preserved in the JSON so a quiz keeps one identity on
 * both sides: attempts and ranking recorded against it stay valid.
 *
 * Usage: node scripts/export-quizzes.js [--dry-run]
 * Needs VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (.env.local or environment).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

function loadEnv() {
  const env = {}
  try {
    for (const line of readFileSync(resolve(root, '.env.local'), 'utf-8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      // Vercel writes values quoted, sometimes with escaped newlines appended.
      if (match) env[match[1]] = match[2].replace(/^"|"$/g, '').replace(/\\r\\n$/, '')
    }
  } catch {
    // fall through to process.env
  }
  return {
    url: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY
  }
}

const { url, key } = loadEnv()
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

async function query(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  })
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`)
  return res.json()
}

/** "Enfermedades Cerebrovasculares 2024" -> "enfermedades-cerebrovasculares-2024" */
function slugify(title) {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

const quizzes = await query('academy_quizzes?status=eq.published&order=created_at.asc')
console.log(`${quizzes.length} quizzes publicados\n`)

mkdirSync(resolve(root, 'quizzes'), { recursive: true })

const usedSlugs = new Map()
let totalQuestions = 0

for (const quiz of quizzes) {
  const questions = await query(
    `academy_quiz_questions?quiz_id=eq.${quiz.id}&order=display_order.asc`
  )

  // Two quizzes share the title "Examen de Semiologia 2024"; keep both files.
  let slug = slugify(quiz.title)
  const seen = usedSlugs.get(slug) ?? 0
  usedSlugs.set(slug, seen + 1)
  if (seen > 0) slug = `${slug}-${seen + 1}`

  const payload = {
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description ?? null,
      time_limit_minutes: quiz.time_limit_minutes ?? null,
      passing_score: quiz.passing_score ?? null,
      shuffle_questions: quiz.shuffle_questions ?? false,
      show_correct_answers: quiz.show_correct_answers ?? true,
      status: 'published',
      created_at: quiz.created_at,
      updated_at: quiz.updated_at
    },
    questions: questions.map((q, index) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type || 'multiple_choice',
      options: Array.isArray(q.options) ? q.options : [],
      correct_option_index:
        typeof q.correct_option_index === 'number' ? q.correct_option_index : 0,
      explanation: q.explanation ?? null,
      image_url: q.image_url ?? null,
      points: typeof q.points === 'number' ? q.points : 1,
      display_order: typeof q.display_order === 'number' ? q.display_order : index
    }))
  }

  totalQuestions += payload.questions.length
  const target = resolve(root, 'quizzes', `${slug}.json`)
  console.log(`  ${slug}.json  (${payload.questions.length} preguntas)`)
  if (!dryRun) writeFileSync(target, JSON.stringify(payload, null, 2) + '\n')
}

console.log(`\n${dryRun ? 'DRY RUN — ' : ''}${quizzes.length} archivos, ${totalQuestions} preguntas`)
