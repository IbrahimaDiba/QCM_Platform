-- SOLUTION POUR SUPPRIMER UN COMPTE PROFESSEUR

-- Option 1 : Supprimer d'abord tous les quiz du professeur
-- Remplacez 'ID_DU_PROF' par l'ID réel du professeur à supprimer
-- DELETE FROM quizzes WHERE teacher_id = 'ID_DU_PROF';
-- DELETE FROM profiles WHERE id = 'ID_DU_PROF';

-- Option 2 (RECOMMANDÉE) : Modifier la contrainte pour CASCADE
-- Cela supprimera automatiquement les quiz quand on supprime le prof

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE quizzes 
DROP CONSTRAINT IF EXISTS quizzes_teacher_id_fkey;

-- 2. Recréer la contrainte avec CASCADE
ALTER TABLE quizzes
ADD CONSTRAINT quizzes_teacher_id_fkey 
FOREIGN KEY (teacher_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Maintenant, quand vous supprimez un prof, ses quiz seront automatiquement supprimés
-- DELETE FROM profiles WHERE id = 'ID_DU_PROF';

-- Option 3 : Réassigner les quiz à un autre prof avant de supprimer
-- UPDATE quizzes SET teacher_id = 'ID_NOUVEAU_PROF' WHERE teacher_id = 'ID_ANCIEN_PROF';
-- DELETE FROM profiles WHERE id = 'ID_ANCIEN_PROF';
