-- RESTAURATION COMPLÈTE DES ACCÈS AUX EXAMENS
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. TABLE: QUIZZES
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Les professeurs peuvent tout faire sur leurs propres quiz
DROP POLICY IF EXISTS "Teachers can manage own quizzes" ON public.quizzes;
CREATE POLICY "Teachers can manage own quizzes" 
ON public.quizzes FOR ALL 
TO authenticated 
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Les étudiants peuvent voir les quiz publiés pour leur école/classe
DROP POLICY IF EXISTS "Students can view active quizzes" ON public.quizzes;
CREATE POLICY "Students can view active quizzes" 
ON public.quizzes FOR SELECT 
TO authenticated 
USING (
  status = 'Active' 
  AND (
    school_id::text = get_my_school_id_text() 
    OR target_class IS NULL
  )
);

-- Les admins voient tout
DROP POLICY IF EXISTS "Admins can view all quizzes" ON public.quizzes;
CREATE POLICY "Admins can view all quizzes" 
ON public.quizzes FOR SELECT 
TO authenticated 
USING (is_admin());


-- 2. TABLE: QUESTIONS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Les professeurs peuvent gérer les questions de leurs quiz
DROP POLICY IF EXISTS "Teachers can manage questions for own quizzes" ON public.questions;
CREATE POLICY "Teachers can manage questions for own quizzes" 
ON public.questions FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = questions.quiz_id 
    AND quizzes.teacher_id = auth.uid()
  )
);

-- Les étudiants peuvent voir les questions des quiz actifs
DROP POLICY IF EXISTS "Students can view questions for active quizzes" ON public.questions;
CREATE POLICY "Students can view questions for active quizzes" 
ON public.questions FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = questions.quiz_id 
    AND quizzes.status = 'Active'
  )
);

-- Les admins voient tout
DROP POLICY IF EXISTS "Admins can view all questions" ON public.questions;
CREATE POLICY "Admins can view all questions" 
ON public.questions FOR SELECT 
TO authenticated 
USING (is_admin());


-- 3. TABLE: QUIZ_OPTIONS
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;

-- Les professeurs peuvent gérer les options de leurs questions
DROP POLICY IF EXISTS "Teachers can manage options for own quizzes" ON public.quiz_options;
CREATE POLICY "Teachers can manage options for own quizzes" 
ON public.quiz_options FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.questions q
    JOIN public.quizzes qz ON q.quiz_id = qz.id
    WHERE q.id = quiz_options.question_id 
    AND qz.teacher_id = auth.uid()
  )
);

-- Les étudiants peuvent voir les options (pendant l'examen)
DROP POLICY IF EXISTS "Students can view options for active quizzes" ON public.quiz_options;
CREATE POLICY "Students can view options for active quizzes" 
ON public.quiz_options FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.questions q
    JOIN public.quizzes qz ON q.quiz_id = qz.id
    WHERE q.id = quiz_options.question_id 
    AND qz.status = 'Active'
  )
);

-- Les admins voient tout
DROP POLICY IF EXISTS "Admins can view all options" ON public.quiz_options;
CREATE POLICY "Admins can view all options" 
ON public.quiz_options FOR SELECT 
TO authenticated 
USING (is_admin());
