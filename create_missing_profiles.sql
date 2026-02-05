-- SOLUTION COMPLÈTE : Créer les profils manquants pour tous les utilisateurs auth

-- 1. Identifier les utilisateurs dans auth.users qui n'ont PAS de profil
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as name,
    au.raw_user_meta_data->>'role' as role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Créer automatiquement les profils manquants
-- ATTENTION : Exécutez ceci SEULEMENT si la requête ci-dessus montre des utilisateurs manquants
INSERT INTO profiles (id, full_name, email, role, school_id, class_level, student_number, parent_phone, location)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', ''),
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'student')::user_role,
    NULLIF(au.raw_user_meta_data->>'school_id', '')::bigint,
    (au.raw_user_meta_data->>'class_level')::class_level,
    au.raw_user_meta_data->>'student_number',
    au.raw_user_meta_data->>'parent_phone',
    au.raw_user_meta_data->>'location'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 3. Vérifier que tous les profils sont créés
SELECT COUNT(*) as users_in_auth FROM auth.users;
SELECT COUNT(*) as users_in_profiles FROM profiles;
-- Les deux nombres doivent être identiques
