-- Add remaining missing columns to academy_quiz_questions
ALTER TABLE academy_quiz_questions
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;

ALTER TABLE academy_quiz_questions
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE academy_quiz_questions
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
