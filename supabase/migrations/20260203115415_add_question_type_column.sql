-- Add question_type column to academy_quiz_questions
ALTER TABLE academy_quiz_questions
ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) DEFAULT 'multiple_choice';
