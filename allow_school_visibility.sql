-- ACTIVEZ CES POLITIQUES DANS L'ÉDITEUR SQL DE SUPABASE
-- Permettre aux élèves de voir les professeurs de LEUR établissement
-- Permettre aux professeurs de voir les élèves de LEUR établissement

DROP POLICY IF EXISTS "Les eleves peuvent voir les profs de leur ecole" ON profiles;
CREATE POLICY "Les eleves peuvent voir les profs de leur ecole"
ON profiles FOR SELECT
TO authenticated
USING (
  role = 'teacher' 
  AND school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Les profs peuvent voir les eleves de leur ecole" ON profiles;
CREATE POLICY "Les profs peuvent voir les eleves de leur ecole"
ON profiles FOR SELECT
TO authenticated
USING (
  role = 'student' 
  AND school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
);
