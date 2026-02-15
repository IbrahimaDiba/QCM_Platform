-- Add scheduling columns to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Comment describing the changes
COMMENT ON COLUMN public.quizzes.start_time IS 'Date and time when the quiz becomes available';
COMMENT ON COLUMN public.quizzes.end_time IS 'Date and time when the quiz closes';
