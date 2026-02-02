-- Add show_correct_answers column to academy_quizzes
ALTER TABLE academy_quizzes
ADD COLUMN IF NOT EXISTS show_correct_answers BOOLEAN DEFAULT true;
