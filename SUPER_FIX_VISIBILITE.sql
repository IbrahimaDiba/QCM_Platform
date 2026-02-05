-- 🚨 SUPER FIX COMPLET V2 : VISIBILITÉ EXAMENS + ÉTUDIANTS + RÉSULTATS 🚨
-- Cette version corrige l'erreur "column school_id does not exist" sur la table quizzes.
-- À exécuter dans l'éditeur SQL de Supabase.

-- ============================================
-- 1. EXAMENS (VISIBILITÉ RÉTABLIE)
-- ============================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Les professeurs voient leurs propres quiz
DROP POLICY IF EXISTS "Teachers can manage own quizzes" ON public.quizzes;
CREATE POLICY "Teachers can manage own quizzes" 
ON public.quizzes FOR ALL 
TO authenticated 
USING (teacher_id = auth.uid()) 
WITH CHECK (teacher_id = auth.uid());

-- Les étudiants voient les quiz actifs des professeurs de LEUR école
DROP POLICY IF EXISTS "Students can view active quizzes" ON public.quizzes;
CREATE POLICY "Students can view active quizzes" 
ON public.quizzes FOR SELECT 
TO authenticated 
USING (
  status = 'Active' 
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = quizzes.teacher_id
      AND p.school_id::text = get_my_school_id_text()
    )
    OR target_class IS NULL
  )
);

-- Les admins voient tout
DROP POLICY IF EXISTS "Admins can view all quizzes" ON public.quizzes;
CREATE POLICY "Admins can view all quizzes" 
ON public.quizzes FOR SELECT 
TO authenticated 
USING (is_admin());

-- ============================================
-- 2. QUESTIONS & OPTIONS
-- ============================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can manage questions for own quizzes" ON public.questions;
CREATE POLICY "Teachers can manage questions for own quizzes" ON public.questions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.teacher_id = auth.uid()));

DROP POLICY IF EXISTS "Students can view questions for active quizzes" ON public.questions;
CREATE POLICY "Students can view questions for active quizzes" ON public.questions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.status = 'Active'));

DROP POLICY IF EXISTS "Admins can view all questions" ON public.questions;
CREATE POLICY "Admins can view all questions" ON public.questions FOR SELECT TO authenticated USING (is_admin());

ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can manage options for own quizzes" ON public.quiz_options;
CREATE POLICY "Teachers can manage options for own quizzes" ON public.quiz_options FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.questions q JOIN public.quizzes qz ON q.quiz_id = qz.id WHERE q.id = quiz_options.question_id AND qz.teacher_id = auth.uid()));

DROP POLICY IF EXISTS "Students can view options for active quizzes" ON public.quiz_options;
CREATE POLICY "Students can view options for active quizzes" ON public.quiz_options FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.questions q JOIN public.quizzes qz ON q.quiz_id = qz.id WHERE q.id = quiz_options.question_id AND qz.status = 'Active'));

DROP POLICY IF EXISTS "Admins can view all options" ON public.quiz_options;
CREATE POLICY "Admins can view all options" ON public.quiz_options FOR SELECT TO authenticated USING (is_admin());

-- ============================================
-- 3. PROFILS ÉTUDIANTS (NOMS & CLASSES)
-- ============================================

DROP POLICY IF EXISTS "Teachers can see students in same school" ON public.profiles;
CREATE POLICY "Teachers can see students in same school" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  role = 'student' 
  AND (
    school_id::text = get_my_school_id_text() 
    OR 
    EXISTS (
      SELECT 1 FROM public.student_results sr 
      JOIN public.quizzes q ON sr.quiz_id = q.id 
      WHERE sr.student_id = profiles.id 
      AND q.teacher_id = auth.uid()
    )
  )
);

-- ============================================
-- 4. RÉSULTATS ÉTUDIANTS
-- ============================================

DROP POLICY IF EXISTS "Teachers can view results for their quizzes" ON public.student_results;
CREATE POLICY "Teachers can view results for their quizzes" ON public.student_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = student_results.quiz_id AND quizzes.teacher_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view all results" ON public.student_results;
CREATE POLICY "Admins can view all results" ON public.student_results FOR SELECT TO authenticated USING (is_admin());
