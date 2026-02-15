-- Add explanation column to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS explanation TEXT DEFAULT '';

-- Update RLS policies if necessary (usually authenticated users can view questions)
-- Existing policies should cover reading, but ensure updates are allowed for teachers
