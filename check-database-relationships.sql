-- Script de diagnostic pour vérifier l'état de la base de données
-- Exécuter ce script pour diagnostiquer le problème de relation

-- 1. Vérifier si les tables existent
SELECT 
    'Verification de l''existence des tables' as etape,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('ventes', 'ventes_articles', 'ventes_paiements')
AND table_schema = 'public';

-- 2. Vérifier les colonnes des tables
SELECT 
    'Colonnes de la table ventes' as etape,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'Colonnes de la table ventes_articles' as etape,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier toutes les contraintes de clé étrangère existantes
SELECT 
    'Contraintes FK existantes' as etape,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. Vérifier spécifiquement les contraintes sur ventes_articles
SELECT 
    'Contraintes sur ventes_articles' as etape,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'ventes_articles' 
AND table_schema = 'public';

-- 5. Compter les données dans chaque table
SELECT 
    'Comptage des donnees' as etape,
    'ventes' as table_name,
    COUNT(*) as nombre_lignes
FROM ventes
UNION ALL
SELECT 
    'Comptage des donnees' as etape,
    'ventes_articles' as table_name,
    COUNT(*) as nombre_lignes
FROM ventes_articles
UNION ALL
SELECT 
    'Comptage des donnees' as etape,
    'ventes_paiements' as table_name,
    COUNT(*) as nombre_lignes
FROM ventes_paiements;

-- 6. Vérifier s'il y a des articles orphelins
SELECT 
    'Articles orphelins detectes' as probleme,
    COUNT(*) as nombre
FROM ventes_articles va
LEFT JOIN ventes v ON va.vente_id = v.id
WHERE v.id IS NULL;

-- 7. Vérifier les types de données des colonnes de relation
SELECT 
    'Types de donnees des cles' as verification,
    'ventes.id' as colonne,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'ventes' AND column_name = 'id' AND table_schema = 'public'
UNION ALL
SELECT 
    'Types de donnees des cles' as verification,
    'ventes_articles.vente_id' as colonne,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' AND column_name = 'vente_id' AND table_schema = 'public';

-- 8. Test de jointure manuelle
SELECT 
    'Test de jointure manuelle' as test,
    v.numero_vente,
    COUNT(va.id) as nombre_articles
FROM ventes v
LEFT JOIN ventes_articles va ON v.id = va.vente_id
GROUP BY v.id, v.numero_vente
ORDER BY v.created_at DESC
LIMIT 3; 