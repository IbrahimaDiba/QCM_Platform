-- AJOUT DE LA COLONNE school_id ET MISE À JOUR DU TRIGGER

-- 1. Ajouter la colonne school_id à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id);

-- 2. Mettre à jour la fonction du trigger pour copier school_id depuis les métadonnées
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, school_id, establishment, class_level, student_number)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'role',
    (new.raw_user_meta_data->>'school_id')::uuid, -- Cast en UUID
    new.raw_user_meta_data->>'establishment',
    new.raw_user_meta_data->>'class_level',
    new.raw_user_meta_data->>'student_number'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
