-- 🔍 DIAGNOSTIC ET SYNCHRONISATION DES UTILISATEURS (CORRIGÉ V4 - FINAL)
-- À exécuter dans l'éditeur SQL de Supabase

-- CORRECTION ERREUR TYPES : 'class_level'::class_level ENUM
INSERT INTO public.profiles (id, full_name, email, role, school_id, establishment, class_level, student_number, parent_phone, location)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Utilisateur'),
    au.email,
    -- TYPE 1: Role Enum
    COALESCE(au.raw_user_meta_data->>'role', 'student')::user_role,
    -- TYPE 2: Bigint pour School ID
    NULLIF(au.raw_user_meta_data->>'school_id', '')::bigint,
    au.raw_user_meta_data->>'establishment',
    -- TYPE 3: Class Level Enum
    NULLIF(au.raw_user_meta_data->>'class_level', '')::class_level,
    au.raw_user_meta_data->>'student_number',
    au.raw_user_meta_data->>'parent_phone',
    au.raw_user_meta_data->>'location'
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
