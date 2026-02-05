-- DIAGNOSTIC COMPLET VISIBILITÉ
-- Ce script va vous dire POURQUOI l'élève ne voit pas le quiz.

-- 1. Lister les écoles pour trouver les IDs
SELECT id, name FROM schools;

-- 2. Lister les profils pour vérifier les IDs d'école et classes
SELECT id, full_name, role, school_id, class_level 
FROM profiles 
WHERE role = 'student' OR role = 'teacher';

-- 3. Lister les quiz pour voir leurs cibles
SELECT id, title, target_class, establishment_id, status, teacher_id
FROM quizzes;

-- 4. SIMULATION : Pourquoi l'élève X ne voit pas le quiz Y ?
-- Remplacez les ID ci-dessous par ceux trouvés aux étapes 1, 2, 3
-- Exemple :
-- SELECT * FROM quizzes 
-- WHERE establishment_id = 'ID_ECOLE_ELEVE' 
-- AND target_class = 'CLASSE_ELEVE'
-- AND status = 'Active';
