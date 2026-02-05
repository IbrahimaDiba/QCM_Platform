-- DIAGNOSTIC : Vérifier la structure de la table profiles
-- Exécutez ce script pour voir EXACTEMENT quelles colonnes existent

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Résultat attendu : vous devriez voir toutes ces colonnes
-- Si une colonne manque, c'est ça le problème !
