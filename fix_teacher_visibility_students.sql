-- FIX: Permettre aux professeurs de voir les résultats et les profils des étudiants
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. POLITIQUES SUR LES RÉSULTATS (student_results)
-- Permettre aux profs de voir les résultats des quiz qu'ils ont créés
DROP POLICY IF EXISTS "Teachers can view results for their quizzes" ON public.student_results;
CREATE POLICY "Teachers can view results for their quizzes" 
ON public.student_results FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = student_results.quiz_id 
    AND quizzes.teacher_id = auth.uid()
  )
);

-- 2. POLITIQUES SUR LES PROFILS (profiles)
-- Permettre aux profs de voir les élèves de leur établissement
DROP POLICY IF EXISTS "Teachers can see students in same school" ON public.profiles;
CREATE POLICY "Teachers can see students in same school"
ON public.profiles FOR SELECT
TO authenticated
USING (
  role = 'student' 
  AND (
    -- Même école
    school_id::text = get_my_school_id_text()
    OR
    -- OU l'élève a passé un quiz du prof
    EXISTS (
      SELECT 1 FROM public.student_results sr
      JOIN public.quizzes q ON sr.quiz_id = q.id
      WHERE sr.student_id = profiles.id
      AND q.teacher_id = auth.uid()
    )
  )
);

-- S'assurer que les admins voient toujours tout sur student_results
DROP POLICY IF EXISTS "Admins can view all results" ON public.student_results;
CREATE POLICY "Admins can view all results" 
ON public.student_results FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
