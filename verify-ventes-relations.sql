-- Script pour vérifier toutes les relations de la table ventes

-- 1. Vérifier la structure de la table ventes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ventes' 
ORDER BY ordinal_position;

-- 2. Vérifier toutes les contraintes de clé étrangère sur la table ventes
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='ventes';

-- 3. Vérifier les contraintes de clé étrangère des tables liées vers ventes
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name='ventes_articles' OR tc.table_name='ventes_paiements')
  AND ccu.table_name = 'ventes';

-- 4. Vérifier s'il y a des données orphelines
SELECT 'ventes_articles orphelins' as type, COUNT(*) as count
FROM ventes_articles va
WHERE va.vente_id NOT IN (SELECT id FROM ventes WHERE id IS NOT NULL)
UNION ALL
SELECT 'ventes_paiements orphelins' as type, COUNT(*) as count
FROM ventes_paiements vp
WHERE vp.vente_id NOT IN (SELECT id FROM ventes WHERE id IS NOT NULL)
UNION ALL
SELECT 'ventes avec client_id invalide' as type, COUNT(*) as count
FROM ventes v
WHERE v.client_id IS NOT NULL 
  AND v.client_id NOT IN (SELECT id FROM clients WHERE id IS NOT NULL);

-- 5. Compter le nombre total d'enregistrements dans chaque table
SELECT 'ventes' as table_name, COUNT(*) as count FROM ventes
UNION ALL
SELECT 'ventes_articles' as table_name, COUNT(*) as count FROM ventes_articles
UNION ALL
SELECT 'ventes_paiements' as table_name, COUNT(*) as count FROM ventes_paiements
UNION ALL
SELECT 'clients' as table_name, COUNT(*) as count FROM clients;