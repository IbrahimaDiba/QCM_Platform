-- CORRECTION DE L'ERREUR "Database error saving new user"
-- Le problème : le trigger ne peut pas insérer dans profiles à cause des RLS

-- 1. Supprimer les anciennes politiques d'insertion si elles existent
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- 2. Permettre l'insertion UNIQUEMENT pour son propre profil
-- Ceci permet au trigger de fonctionner car auth.uid() = new.id lors de la création
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT 
TO authenticated
WITH CHECK ( auth.uid() = id );

-- 3. Permettre la mise à jour de son propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE
TO authenticated
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- 4. S'assurer que le trigger utilise SECURITY DEFINER (déjà fait normalement)
-- Si le problème persiste, recréez le trigger avec cette version :
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- IMPORTANT: Exécute avec les droits du créateur de la fonction
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
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'role',
    (new.raw_user_meta_data->>'school_id')::uuid,
    new.raw_user_meta_data->>'establishment',
    new.raw_user_meta_data->>'class_level',
    new.raw_user_meta_data->>'student_number',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'location'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 5. Recréer le trigger (au cas où)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
