-- ==============================================================================
-- FIX: PERMETTRE AUX ADMINS DE SUPPRIMER DES QUIZ
-- ==============================================================================
-- Ce script :
-- 1. Ajoute "ON DELETE CASCADE" aux contraintes de clé étrangère critiques
--    (questions, options, résultats) pour qu'ils soient supprimés avec le quiz.
-- 2. Ajoute une politique RLS explicite permettant aux admins de supprimer les quiz.
-- ==============================================================================

-- PARTIE 1: GESTION DES CLÉS ÉTRANGÈRES (CASCADE)
-- Note: On essaie de deviner les noms standards des contraintes.

DO $$
BEGIN
    -- 1. Questions liées au Quiz
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'questions_quiz_id_fkey') THEN
        ALTER TABLE public.questions DROP CONSTRAINT questions_quiz_id_fkey;
    END IF;
    
    ALTER TABLE public.questions
    ADD CONSTRAINT questions_quiz_id_fkey
    FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

    -- 2. Options liées aux Questions
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'options_question_id_fkey') THEN
        ALTER TABLE public.options DROP CONSTRAINT options_question_id_fkey;
    END IF;
    
    ALTER TABLE public.options
    ADD CONSTRAINT options_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

    -- 3. Résultats étudiants liés au Quiz
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'student_results_quiz_id_fkey') THEN
        ALTER TABLE public.student_results DROP CONSTRAINT student_results_quiz_id_fkey;
    END IF;
    
    ALTER TABLE public.student_results
    ADD CONSTRAINT student_results_quiz_id_fkey
    FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de la modification des contraintes: %', SQLERRM;
END $$;

-- PARTIE 2: POLITIQUES RLS POUR ADMINS

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques conflictuelles potentielles
DROP POLICY IF EXISTS "Admins can delete all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can delete any quiz" ON public.quizzes;

-- Créer la politique de suppression pour Admin
CREATE POLICY "Admins can delete all quizzes"
ON public.quizzes FOR DELETE
USING ( public.is_admin() );

-- S'assurer que les admins peuvent aussi voir et modifier (UPDATE) pour gérer
DROP POLICY IF EXISTS "Admins can update all quizzes" ON public.quizzes;
CREATE POLICY "Admins can update all quizzes"
ON public.quizzes FOR UPDATE
USING ( public.is_admin() );

-- Vérification (optionnelle)
-- SELECT count(*) FROM public.quizzes;
