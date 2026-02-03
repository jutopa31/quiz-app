-- Add shuffle_questions column to academy_quizzes
ALTER TABLE academy_quizzes
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT false;
