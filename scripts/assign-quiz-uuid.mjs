#!/usr/bin/env node
/**
 * Gives a repo-only quiz (and its questions) permanent UUIDs, so the same
 * identity holds in the JSON and in Supabase once the sync SQL runs.
 *
 * Usage: node scripts/assign-quiz-uuid.mjs quizzes/mi-quiz.json
 * Existing ids are never overwritten.
 */
import { readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/assign-quiz-uuid.mjs quizzes/<archivo>.json')
  process.exit(1)
}

const data = JSON.parse(readFileSync(file, 'utf-8'))
let assigned = 0

if (!data.quiz.id) {
  data.quiz.id = randomUUID()
  assigned++
}
for (const question of data.questions) {
  if (!question.id) {
    question.id = randomUUID()
    assigned++
  }
}

if (assigned === 0) {
  console.log(`${file}: ya tenía todos los ids`)
} else {
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  console.log(`${file}: ${assigned} ids asignados (quiz ${data.quiz.id})`)
}
