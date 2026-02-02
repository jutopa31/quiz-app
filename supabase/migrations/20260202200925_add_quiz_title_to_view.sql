-- Update view to include quiz title
DROP VIEW IF EXISTS academy_quiz_attempts_with_email;

CREATE VIEW academy_quiz_attempts_with_email AS
SELECT
  a.*,
  COALESCE(a.user_email, u.email) as resolved_email,
  q.title as quiz_title
FROM academy_quiz_attempts a
LEFT JOIN auth.users u ON a.user_id::uuid = u.id
LEFT JOIN academy_quizzes q ON a.quiz_id = q.id;

-- Grant access to the view
GRANT SELECT ON academy_quiz_attempts_with_email TO anon, authenticated;
