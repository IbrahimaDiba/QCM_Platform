-- DIAGNOSTIC : Vérifier si le professeur existe dans profiles

-- 1. Vérifier les professeurs dans la base de données
SELECT id, full_name, email, role, school_id 
FROM profiles 
WHERE role = 'teacher';

-- 2. Vérifier les utilisateurs dans auth.users (pour voir s'ils existent mais sans profil)
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'teacher';

-- 3. Si un professeur existe dans auth.users mais PAS dans profiles, 
--    c'est que le trigger de création de profil a échoué.
--    Solution : Créer manuellement le profil

-- Exemple (remplacez les valeurs) :
-- INSERT INTO profiles (id, full_name, email, role, school_id)
-- VALUES (
--   'ID_DU_PROF_DEPUIS_AUTH_USERS',
--   'Nom du Prof',
--   'email@prof.com',
--   'teacher',
--   'ID_DE_LECOLE'::uuid
-- );
