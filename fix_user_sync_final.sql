-- 🔥 SOLUTION FINALE ET DÉFINITIVE V3 : SYNCHRONISATION AUTH -> PROFILES
-- À EXÉCUTER DANS L'ÉDITEUR SQL DE SUPABASE

-- 1. MISE À JOUR DE LA FONCTION DE TRIGGER (ULTRA-ROBUSTE)
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
    location,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')::user_role, -- CAST ENUM
    CASE 
      WHEN new.raw_user_meta_data->>'school_id' IS NULL OR new.raw_user_meta_data->>'school_id' = '' 
      THEN NULL 
      ELSE (new.raw_user_meta_data->>'school_id')::bigint -- CAST BIGINT (CORRIGÉ)
    END,
    new.raw_user_meta_data->>'establishment',
    NULLIF(new.raw_user_meta_data->>'class_level', '')::class_level, -- CAST ENUM
    new.raw_user_meta_data->>'student_number',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'location',
    NOW(),
    NOW()
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'CRITICAL ERROR in handle_new_user trigger for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 2. RÉINSTALLATION DU TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 3. RÉCUPÉRATION DES UTILISATEURS EXISTANTS (SYNCHRONISATION)
INSERT INTO public.profiles (
    id, full_name, email, role, school_id, establishment, class_level, student_number, parent_phone, location, created_at, updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Utilisateur'),
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'student')::user_role, -- CAST ENUM
    CASE 
      WHEN au.raw_user_meta_data->>'school_id' IS NULL OR au.raw_user_meta_data->>'school_id' = '' 
      THEN NULL 
      ELSE (au.raw_user_meta_data->>'school_id')::bigint -- CAST BIGINT (CORRIGÉ)
    END,
    au.raw_user_meta_data->>'establishment',
    NULLIF(au.raw_user_meta_data->>'class_level', '')::class_level, -- CAST ENUM
    au.raw_user_meta_data->>'student_number',
    au.raw_user_meta_data->>'parent_phone',
    au.raw_user_meta_data->>'location',
    au.created_at,
    au.created_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
