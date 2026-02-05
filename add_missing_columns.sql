-- 🚨 RECONSTRUCTION DES COLONNES MANQUANTES 🚨
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajout sécurisé des colonnes si elles n'existent pas
DO $$ 
BEGIN 
    -- 1. Establishment (Etablissement scolaire)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='establishment') THEN
        ALTER TABLE public.profiles ADD COLUMN establishment TEXT;
    END IF;

    -- 2. Class Level (Niveau de classe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='class_level') THEN
        ALTER TABLE public.profiles ADD COLUMN class_level TEXT;
    END IF;

    -- 3. Student Number (Numéro d'élève)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='student_number') THEN
        ALTER TABLE public.profiles ADD COLUMN student_number TEXT;
    END IF;

    -- 4. Parent Phone (Téléphone parent)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='parent_phone') THEN
        ALTER TABLE public.profiles ADD COLUMN parent_phone TEXT;
    END IF;

    -- 5. Location (Localisation/Ville)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;

    -- 6. Updated At
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

COMMENT ON TABLE public.profiles IS 'Table des profils utilisateurs étendue avec informations scolaires.';
