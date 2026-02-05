-- SOLUTION COMPLÈTE POUR TOUS LES BUGS RLS ET TRIGGER
-- À EXÉCUTER DANS L'ÉDITEUR SQL DE SUPABASE

-- ============================================
-- PARTIE 1: FONCTIONS UTILITAIRES SÉCURISÉES
-- ============================================

-- Fonction pour vérifier si l'utilisateur est admin (avec fallback metadata)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Essayer d'abord depuis la table profiles
  SELECT role INTO user_role FROM public.profiles 
  WHERE id::text = auth.uid()::text;
  
  -- Si trouvé dans profiles, vérifier
  IF user_role IS NOT NULL THEN
    RETURN user_role = 'admin';
  END IF;
  
  -- Sinon, vérifier dans les métadonnées auth
  SELECT raw_user_meta_data->>'role' INTO user_role 
  FROM auth.users 
  WHERE id::text = auth.uid()::text;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le school_id de l'utilisateur (avec fallback metadata)
CREATE OR REPLACE FUNCTION public.get_my_school_id_text()
RETURNS TEXT AS $$
DECLARE
  school_val TEXT;
BEGIN
  -- Essayer d'abord depuis la table profiles
  SELECT school_id::text INTO school_val FROM public.profiles 
  WHERE id::text = auth.uid()::text;
  
  -- Si trouvé dans profiles, retourner
  IF school_val IS NOT NULL THEN
    RETURN school_val;
  END IF;
  
  -- Sinon, vérifier dans les métadonnées auth
  SELECT raw_user_meta_data->>'school_id' INTO school_val 
  FROM auth.users 
  WHERE id::text = auth.uid()::text;
  
  RETURN school_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PARTIE 2: TRIGGER ROBUSTE POUR CRÉATION DE PROFIL
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  school_uuid UUID;
BEGIN
  -- Convertir school_id en UUID de manière sécurisée
  BEGIN
    school_uuid := (new.raw_user_meta_data->>'school_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    school_uuid := NULL;
  END;

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
    school_uuid,
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

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PARTIE 3: POLITIQUES RLS SUR PROFILES
-- ============================================

-- Nettoyer les anciennes politiques
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Standard users can see teachers in same school" ON public.profiles;
DROP POLICY IF EXISTS "Les eleves peuvent voir les profs de leur ecole" ON public.profiles;
DROP POLICY IF EXISTS "Les profs peuvent voir les eleves de leur ecole" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les admins peuvent voir tous les profils" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Politique: Voir son propre profil
CREATE POLICY "Users can see own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid()::text = id::text );

-- Politique: Admins voient tout
CREATE POLICY "Admins can see all profiles" 
ON public.profiles FOR SELECT 
USING ( is_admin() );

-- Politique: Voir les professeurs de son école
CREATE POLICY "Students can see teachers in same school"
ON public.profiles FOR SELECT
TO authenticated
USING (
  role = 'teacher' 
  AND school_id::text = get_my_school_id_text()
);

-- Politique: Admins peuvent supprimer
CREATE POLICY "Admins can delete profiles" 
ON public.profiles FOR DELETE 
USING ( is_admin() );

-- ============================================
-- PARTIE 4: POLITIQUES RLS SUR SCHOOLS
-- ============================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated to read schools" ON public.schools;
CREATE POLICY "Allow all authenticated to read schools"
ON public.schools FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- PARTIE 5: POLITIQUES RLS SUR STUDENT_RESULTS
-- ============================================

DROP POLICY IF EXISTS "Admins can view all results" ON public.student_results;
DROP POLICY IF EXISTS "Users can see own results" ON public.student_results;

CREATE POLICY "Admins can view all results" 
ON public.student_results FOR SELECT 
USING ( is_admin() );

CREATE POLICY "Users can see own results" 
ON public.student_results FOR SELECT 
USING ( auth.uid()::text = student_id::text );
