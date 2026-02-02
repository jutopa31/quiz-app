-- Fix backfill: try UUID to UUID comparison
UPDATE academy_quiz_attempts a
SET user_email = u.email
FROM auth.users u
WHERE a.user_id::uuid = u.id
AND a.user_email IS NULL;

-- Also try text to text comparison as fallback
UPDATE academy_quiz_attempts a
SET user_email = u.email
FROM auth.users u
WHERE a.user_id = u.id::text
AND a.user_email IS NULL;
