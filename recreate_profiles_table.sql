-- SOLUTION COMPLÈTE : Recréer la table profiles avec TOUTES les colonnes

-- 1. SAUVEGARDER les données existantes (si vous en avez)
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- 2. Supprimer l'ancienne table (ATTENTION : ceci efface les données!)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Créer la nouvelle table avec TOUTES les colonnes nécessaires
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  school_id UUID REFERENCES schools(id),
  establishment TEXT,
  class_level TEXT,
  student_number TEXT,
  parent_phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Désactiver RLS temporairement
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Recréer le trigger de création automatique
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role, 
    school_id, 
    establishment, 
    class_level, 
    student_number,
    parent_phone,
    location
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    (new.raw_user_meta_data->>'school_id')::uuid,
    new.raw_user_meta_data->>'establishment',
    new.raw_user_meta_data->>'class_level',
    new.raw_user_meta_data->>'student_number',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'location'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 6. Supprimer et recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_class_level ON profiles(class_level);
