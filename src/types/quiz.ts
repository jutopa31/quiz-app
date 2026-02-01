// Quiz types - matches hubjr-v2 database schema

export interface Quiz {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'archived'
  topic_id?: string | null
  time_limit_minutes?: number | null
  passing_score?: number | null
  shuffle_questions?: boolean
  show_correct_answers?: boolean
  created_by: string
  created_at: string
  updated_at: string
  published_at?: string | null
  // Computed
  question_count?: number
  user_best_score?: number | null
  user_attempts_count?: number
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  question_type?: 'multiple_choice' | 'true_false'
  options: QuestionOption[]
  correct_answer: string
  correct_option_index?: number
  explanation: string | null
  points: number
  display_order: number
  created_at: string
}

export interface QuestionOption {
  id: string
  text: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  started_at?: string
  completed_at?: string | null
  score: number | null
  total_points?: number | null
  total_questions?: number | null
  answers: AttemptAnswer[]
  time_spent_seconds?: number | null
  created_at?: string
}

export interface AttemptAnswer {
  question_id: string
  selected_option?: string
  selected_index?: number
  is_correct: boolean
  points_earned?: number
}

// For taking a quiz
export interface QuizSession {
  quiz: Quiz
  questions: Question[]
  currentIndex: number
  answers: Record<string, string> // question_id -> selected_option_id
  startedAt: Date
}

// For displaying results
export interface QuizResult {
  attempt: QuizAttempt
  quiz: Quiz
  questions: Question[]
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
}
