-- Add CASCADE delete to quiz questions
ALTER TABLE academy_quiz_questions
DROP CONSTRAINT IF EXISTS academy_quiz_questions_quiz_id_fkey;

ALTER TABLE academy_quiz_questions
ADD CONSTRAINT academy_quiz_questions_quiz_id_fkey
FOREIGN KEY (quiz_id) REFERENCES academy_quizzes(id) ON DELETE CASCADE;

-- Add CASCADE delete to quiz attempts
ALTER TABLE academy_quiz_attempts
DROP CONSTRAINT IF EXISTS academy_quiz_attempts_quiz_id_fkey;

ALTER TABLE academy_quiz_attempts
ADD CONSTRAINT academy_quiz_attempts_quiz_id_fkey
FOREIGN KEY (quiz_id) REFERENCES academy_quizzes(id) ON DELETE CASCADE;
