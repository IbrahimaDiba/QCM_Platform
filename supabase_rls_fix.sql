-- ACTIVEZ CES POLITIQUES DANS L'ÉDITEUR SQL DE SUPABASE

-- 1. Activer la sécurité niveau ligne (RLS) sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Permettre à chaque utilisateur de voir son PROPRE profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
ON profiles FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- 3. Permettre aux ADMINS de voir TOUS les profils
-- Cette politique vérifie si l'utilisateur qui fait la requête a le rôle 'admin'
CREATE POLICY "Les admins peuvent voir tous les profils"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
