-- Add user_email column to academy_quiz_attempts for ranking display
ALTER TABLE academy_quiz_attempts
ADD COLUMN IF NOT EXISTS user_email TEXT;
