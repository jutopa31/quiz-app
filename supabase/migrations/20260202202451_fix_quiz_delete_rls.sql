-- Enable RLS on academy_quizzes if not already enabled
ALTER TABLE academy_quizzes ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policy if any
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON academy_quizzes;
DROP POLICY IF EXISTS "Authenticated users can delete quizzes" ON academy_quizzes;

-- Allow authenticated users to delete quizzes they created
CREATE POLICY "Users can delete their own quizzes"
ON academy_quizzes
FOR DELETE
TO authenticated
USING (auth.uid()::text = created_by);

-- Also allow any authenticated user to delete (for admin functionality)
-- Comment this out if you want stricter permissions
CREATE POLICY "Authenticated users can delete quizzes"
ON academy_quizzes
FOR DELETE
TO authenticated
USING (true);

-- Ensure SELECT policy exists (needed for delete with .select())
DROP POLICY IF EXISTS "Anyone can view quizzes" ON academy_quizzes;
CREATE POLICY "Anyone can view quizzes"
ON academy_quizzes
FOR SELECT
USING (true);

-- Ensure UPDATE policy exists
DROP POLICY IF EXISTS "Users can update their own quizzes" ON academy_quizzes;
CREATE POLICY "Users can update their own quizzes"
ON academy_quizzes
FOR UPDATE
TO authenticated
USING (true);

-- Ensure INSERT policy exists
DROP POLICY IF EXISTS "Authenticated users can create quizzes" ON academy_quizzes;
CREATE POLICY "Authenticated users can create quizzes"
ON academy_quizzes
FOR INSERT
TO authenticated
WITH CHECK (true);
