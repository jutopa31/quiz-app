-- Add all potentially missing columns to academy_quizzes
ALTER TABLE academy_quizzes
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;

ALTER TABLE academy_quizzes
ADD COLUMN IF NOT EXISTS passing_score INTEGER;

-- Add explanation column to questions if missing
ALTER TABLE academy_quiz_questions
ADD COLUMN IF NOT EXISTS explanation TEXT;
