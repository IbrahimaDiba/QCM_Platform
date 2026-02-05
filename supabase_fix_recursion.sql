-- CORRECTION DU PROBLÈME DE RÉCURSION INFINIE
-- Le code que vous aviez provoque une boucle : pour lire la table profiles, il faut lire la table profiles, etc.
-- Voici la solution propre et sécurisée.

-- 1. On nettoie les anciennes politiques bloquantes
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les admins peuvent voir tous les profils" ON profiles;

-- 2. Créer une fonction de sécurité pour éviter la boucle infinie
-- Cette fonction s'exécute avec les droits suprêmes (SECURITY DEFINER) juste le temps de vérifier le rôle
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Appliquer les nouvelles politiques propres

-- A. Table PROFILES
-- Tout le monde peut voir son propre profil
CREATE POLICY "Users can see own profile" ON profiles
FOR SELECT USING ( auth.uid() = id );

-- Les admins peuvent TOUT voir grâce à la fonction sécurisée
CREATE POLICY "Admins can see all profiles" ON profiles
FOR SELECT USING ( is_admin() );

-- Les admins peuvent SUPPRIMER
CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING ( is_admin() );

-- B. Table STUDENT_RESULTS (si besoin)
DROP POLICY IF EXISTS "Admins can view all results" ON student_results;

CREATE POLICY "Admins can view all results" ON student_results
FOR SELECT USING ( is_admin() );

-- C. (Optionnel) Permettre aux élèves de voir LEURS résultats
CREATE POLICY "Users can see own results" ON student_results
FOR SELECT USING ( auth.uid() = student_id );
