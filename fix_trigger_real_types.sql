-- 🚨 CORRECTIF DÉFINITIF DU TRIGGER (TYPES CORRIGÉS) 🚨
-- À exécuter dans l'éditeur SQL de Supabase

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
    COALESCE(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    new.email,
    -- CORRECTION 1 : Cast en user_role (ENUM)
    COALESCE(new.raw_user_meta_data->>'role', 'student')::user_role,
    -- CORRECTION 2 : Cast en BIGINT (et non UUID)
    NULLIF(new.raw_user_meta_data->>'school_id', '')::bigint,
    new.raw_user_meta_data->>'establishment',
    -- CORRECTION 3 : Cast en class_level (ENUM)
    NULLIF(new.raw_user_meta_data->>'class_level', '')::class_level,
    new.raw_user_meta_data->>'student_number',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'location'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log l'erreur pour le débogage mais ne bloque pas l'inscription auth
  RAISE LOG 'Erreur dans handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Réattacher le trigger pour être sûr
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
