-- FIX TRIGGER ROBUSTE & SÉCURISÉ
-- Ce script corrige les 3 causes possibles de l'erreur :
-- 1. SECURITY DEFINER : contourne les restrictions RLS
-- 2. NULLIF(..., '') : évite le crash si on envoie une chaîne vide au lieu de NULL pour un UUID
-- 3. Gestion d'erreurs : log l'erreur au lieu de crasher si quelque chose d'autre ne va pas

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- Contourne RLS
SET search_path = public -- Sécurité
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
    new.email, -- Email est toujours présent dans auth.users
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    -- CAST SÉCURISÉ : Transforme chaine vide en NULL avant le cast UUID
    NULLIF(new.raw_user_meta_data->>'school_id', '')::uuid,
    new.raw_user_meta_data->>'establishment',
    new.raw_user_meta_data->>'class_level',
    new.raw_user_meta_data->>'student_number',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'location'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur (ex: school_id invalide), on log mais on ne bloque pas l'inscription
  -- L'utilisateur sera créé mais sans profil complet (à corriger plus tard)
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql;
