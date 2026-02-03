-- Import Quiz 1: Neurorehabilitación 2025
INSERT INTO academy_quizzes (title, description, time_limit_minutes, shuffle_questions, show_correct_answers, status, created_by)
VALUES ('Neurorehabilitación 2025', 'Examen del módulo de Neurorehabilitación - Certificación SNA 2025', 30, false, true, 'published', 'system-import')
RETURNING id;

-- Get the quiz ID for questions (you'll need to replace this with actual ID after running)
-- For now, using a CTE approach

WITH new_quiz AS (
  INSERT INTO academy_quizzes (title, description, time_limit_minutes, shuffle_questions, show_correct_answers, status, created_by)
  VALUES ('Neurorehabilitación 2025', 'Examen del módulo de Neurorehabilitación - Certificación SNA 2025', 30, false, true, 'published', 'system-import')
  ON CONFLICT DO NOTHING
  RETURNING id
)
SELECT id FROM new_quiz;
