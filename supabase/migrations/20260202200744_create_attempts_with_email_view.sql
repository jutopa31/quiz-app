-- Create a view that joins attempts with auth.users to get emails
CREATE OR REPLACE VIEW academy_quiz_attempts_with_email AS
SELECT
  a.*,
  COALESCE(a.user_email, u.email) as resolved_email
FROM academy_quiz_attempts a
LEFT JOIN auth.users u ON a.user_id::uuid = u.id;

-- Grant access to the view
GRANT SELECT ON academy_quiz_attempts_with_email TO anon, authenticated;
