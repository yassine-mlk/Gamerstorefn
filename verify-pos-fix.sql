-- Script de vérification pour les corrections du point de vente
-- Exécuter ce script dans Supabase SQL Editor après avoir appliqué les corrections

-- 1. Vérifier que vendeur_id est maintenant nullable
SELECT 
    column_name, 
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventes' 
AND column_name = 'vendeur_id';

-- 2. Vérifier l'existence des fonctions créées
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname IN ('create_profile_if_not_exists', 'ensure_vendeur_profile');

-- 3. Vérifier l'existence du trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_ensure_vendeur_profile';

-- 4. Compter les ventes avec et sans vendeur_id
SELECT 
    'Ventes avec vendeur_id' as type,
    COUNT(*) as count
FROM ventes 
WHERE vendeur_id IS NOT NULL

UNION ALL

SELECT 
    'Ventes sans vendeur_id' as type,
    COUNT(*) as count
FROM ventes 
WHERE vendeur_id IS NULL;

-- 5. Vérifier les profils existants
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'member' THEN 1 END) as members,
    COUNT(CASE WHEN role = 'vendeur' THEN 1 END) as vendeurs
FROM profiles;

-- 6. Vérifier la structure de la table ventes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventes'
AND column_name IN ('vendeur_id', 'client_id', 'created_by', 'updated_by')
ORDER BY ordinal_position;

-- 7. Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'ventes'
AND kcu.column_name IN ('vendeur_id', 'client_id');

-- 8. Test de la fonction de création de profil (optionnel)
-- Décommentez pour tester avec un UUID fictif
-- SELECT create_profile_if_not_exists(
--     gen_random_uuid(), 
--     'test@example.com', 
--     'Utilisateur Test'
-- ) as profile_created;

-- Message de confirmation
SELECT 
    'Vérification terminée!' as status,
    NOW() as timestamp,
    'Consultez les résultats ci-dessus pour confirmer que les corrections sont appliquées' as message; 