-- AJOUT DE LA COLONNE 'ANSWERS' À LA TABLE STUDENT_RESULTS
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_results' AND column_name='answers') THEN
        ALTER TABLE public.student_results ADD COLUMN answers JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Commentaire pour documentation
COMMENT ON COLUMN public.student_results.answers IS 'Stocke les réponses de l''étudiant au format JSON {question_id: option_id}';

-- 3. Notification pour rafraîchir le cache PostgREST (PostgreSQL le fait normalement tout seul, 
-- mais parfois il faut forcer un changement ou attendre quelques secondes)
NOTIFY pgrst, 'reload schema';
