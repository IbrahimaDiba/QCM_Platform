-- Enable RLS for questions and quiz_options just in case it's not (or to be consistent)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

-- Policy for Questions
DROP POLICY IF EXISTS "Authenticated users can view questions" ON questions;

CREATE POLICY "Authenticated users can view questions"
ON questions FOR SELECT
TO authenticated
USING (true);

-- Policy for Quiz Options
DROP POLICY IF EXISTS "Authenticated users can view quiz_options" ON quiz_options;

CREATE POLICY "Authenticated users can view quiz_options"
ON quiz_options FOR SELECT
TO authenticated
USING (true);
