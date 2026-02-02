-- Backfill user_email from auth.users for existing attempts
UPDATE academy_quiz_attempts
SET user_email = auth.users.email
FROM auth.users
WHERE academy_quiz_attempts.user_id = auth.users.id::text
AND academy_quiz_attempts.user_email IS NULL;
