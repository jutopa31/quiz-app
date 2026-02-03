import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

// Load .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importQuiz(filePath) {
  console.log(`\n📁 Importing: ${filePath}`)

  const content = readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content)

  const { quiz, questions } = data

  // Insert quiz
  console.log(`  📝 Creating quiz: ${quiz.title}`)
  const { data: createdQuiz, error: quizError } = await supabase
    .from('academy_quizzes')
    .insert({
      title: quiz.title,
      description: quiz.description,
      time_limit_minutes: quiz.time_limit_minutes,
      shuffle_questions: quiz.shuffle_questions ?? false,
      show_correct_answers: quiz.show_correct_answers ?? true,
      status: quiz.status || 'draft',
      created_by: 'system-import'
    })
    .select()
    .single()

  if (quizError) {
    console.error(`  ❌ Error creating quiz:`, quizError)
    return false
  }

  console.log(`  ✅ Quiz created with ID: ${createdQuiz.id}`)

  // Insert questions
  console.log(`  📝 Inserting ${questions.length} questions...`)

  const questionsToInsert = questions.map((q, index) => ({
    quiz_id: createdQuiz.id,
    question_text: q.question_text,
    question_type: q.question_type || 'multiple_choice',
    options: q.options,
    correct_option_index: q.correct_option_index,
    explanation: q.explanation || null,
    points: q.points || 1,
    display_order: index,
    image_url: q.image_url || null
  }))

  const { data: createdQuestions, error: questionsError } = await supabase
    .from('academy_quiz_questions')
    .insert(questionsToInsert)
    .select()

  if (questionsError) {
    console.error(`  ❌ Error inserting questions:`, questionsError)
    return false
  }

  console.log(`  ✅ ${createdQuestions.length} questions inserted`)
  return true
}

async function main() {
  const files = process.argv.slice(2)

  if (files.length === 0) {
    console.log('Usage: node import-quizzes.js <file1.json> [file2.json] ...')
    process.exit(1)
  }

  console.log('🚀 Starting quiz import...')

  let success = 0
  let failed = 0

  for (const file of files) {
    try {
      const result = await importQuiz(file)
      if (result) success++
      else failed++
    } catch (err) {
      console.error(`  ❌ Error processing ${file}:`, err.message)
      failed++
    }
  }

  console.log(`\n📊 Import complete: ${success} succeeded, ${failed} failed`)
}

main()
