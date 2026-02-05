-- SOLUTION ALTERNATIVE : DÉSACTIVER TEMPORAIREMENT RLS SUR PROFILES
-- Si le problème persiste, c'est que RLS bloque complètement le trigger
-- Cette solution désactive RLS pour permettre l'inscription

-- Option 1 : Désactiver complètement RLS (TEMPORAIRE - pour tester)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ⚠️ ATTENTION : Ceci désactive toute la sécurité sur la table profiles
-- À utiliser UNIQUEMENT pour tester si c'est bien le problème RLS
-- Une fois confirmé, réactivez RLS et utilisez l'Option 2 ci-dessous

-- Option 2 : Réactiver RLS avec une politique permissive pour service_role
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- 
-- -- Supprimer toutes les politiques existantes
-- DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
-- DROP POLICY IF EXISTS "Admins can see all profiles" ON profiles;
-- DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- 
-- -- Politique simple : chacun voit et modifie son profil
-- CREATE POLICY "Enable all for own profile" ON profiles
-- FOR ALL
-- TO authenticated
-- USING ( auth.uid() = id )
-- WITH CHECK ( auth.uid() = id );
-- 
-- -- Les admins peuvent tout faire
-- CREATE POLICY "Admins full access" ON profiles
-- FOR ALL
-- TO authenticated
-- USING ( is_admin() )
-- WITH CHECK ( is_admin() );
