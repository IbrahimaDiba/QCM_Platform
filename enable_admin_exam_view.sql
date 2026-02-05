-- Enable Admin Access to Exams
-- This script updates RLS policies to ensure admins can view all exams, questions, and options.

-- 1. QUIZZES
-- Check if policy exists and drop it to be safe (or just create a new one if you prefer not to drop)
DROP POLICY IF EXISTS "Admins can view all quizzes" ON quizzes;

CREATE POLICY "Admins can view all quizzes"
ON quizzes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. QUESTIONS
DROP POLICY IF EXISTS "Admins can view all questions" ON questions;

CREATE POLICY "Admins can view all questions"
ON questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. OPTIONS (quiz_options)
DROP POLICY IF EXISTS "Admins can view all options" ON quiz_options;

CREATE POLICY "Admins can view all options"
ON quiz_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Ensure RLS is enabled
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
