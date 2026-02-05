-- 🆘 SCRIPT DE RECONNEXION D'URGENCE (VUE TOTALE AUTHENTIFIÉE) 🆘
-- À exécuter dans l'éditeur SQL de Supabase si vous ne voyez plus rien.
-- Ce script rétablit la visibilité pour tous les utilisateurs connectés.

-- ============================================
-- 1. PROFILS (INDISPENSABLE POUR L'AUTHENTIFICATION)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Emergency view profiles" ON public.profiles;
CREATE POLICY "Emergency view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- ============================================
-- 2. EXAMENS (QUIZZES, QUESTIONS, OPTIONS)
-- ============================================
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Emergency view quizzes" ON public.quizzes;
CREATE POLICY "Emergency view quizzes" ON public.quizzes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Emergency manage own quizzes" ON public.quizzes;
CREATE POLICY "Emergency manage own quizzes" ON public.quizzes FOR ALL TO authenticated USING (teacher_id = auth.uid());

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Emergency view questions" ON public.questions;
CREATE POLICY "Emergency view questions" ON public.questions FOR SELECT TO authenticated USING (true);

ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Emergency view options" ON public.quiz_options;
CREATE POLICY "Emergency view options" ON public.quiz_options FOR SELECT TO authenticated USING (true);

-- ============================================
-- 3. RÉSULTATS
-- ============================================
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Emergency view results" ON public.student_results;
CREATE POLICY "Emergency view results" ON public.student_results FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Emergency insert results" ON public.student_results;
CREATE POLICY "Emergency insert results" ON public.student_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

-- ============================================
-- 4. ÉCOLES
-- ============================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Emergency view schools" ON public.schools;
CREATE POLICY "Emergency view schools" ON public.schools FOR SELECT TO authenticated USING (true);

-- ============================================
-- 5. NETTOYAGE DES POLITIQUES CONFLICTUELLES
-- ============================================
-- Supprime les politiques qui pourraient bloquer l'accès malgré les règles ci-dessus
DROP POLICY IF EXISTS "Teachers can manage own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Students can view active quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can view all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Teachers can see students in same school" ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Students can see teachers in same school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view results for their quizzes" ON public.student_results;
DROP POLICY IF EXISTS "Admins can view all results" ON public.student_results;
DROP POLICY IF EXISTS "Users can see own results" ON public.student_results;
