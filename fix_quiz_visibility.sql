-- DIAGNOSTIC QUIZ VISIBILITY

-- 1. Vérifier si des Quiz existent pour une école/classe donnée
-- Remplacez par les valeurs réelles si vous testez manuellement
SELECT id, title, target_class, establishment_id, status 
FROM quizzes;

-- 2. Vérifier les politiques RLS sur la table quizzes
SELECT * FROM pg_policies WHERE tablename = 'quizzes';

-- 3. SOLUTION PROBABLE : Ajouter une politique pour que les élèves voient les quiz
-- Si aucune politique SELECT n'existe pour 'authenticated' ou 'student', c'est ça le problème.

DROP POLICY IF EXISTS "Students can view active quizzes from their school" ON quizzes;

CREATE POLICY "Students can view active quizzes from their school"
ON quizzes FOR SELECT
TO authenticated
USING (
  -- L'utilisateur est un élève de la même école et de la même classe
  (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'student'
        AND profiles.school_id = quizzes.establishment_id
        AND profiles.class_level = quizzes.target_class
    )
    AND status = 'Active'
  )
  OR
  -- OU c'est le prof qui l'a créé
  (teacher_id = auth.uid())
  OR
  -- OU c'est un admin
  (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
);
