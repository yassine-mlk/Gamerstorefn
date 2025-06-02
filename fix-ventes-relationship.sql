-- Script pour corriger la relation entre ventes et ventes_articles
-- Exécuter ce script dans l'éditeur SQL de Supabase pour résoudre l'erreur PGRST200

-- 1. Vérifier l'état actuel des tables
SELECT 
    'Verification de l''etat des tables ventes et ventes_articles' as message;

-- Vérifier les contraintes existantes sur ventes_articles
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
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'ventes_articles';

-- 2. Supprimer la contrainte de clé étrangère existante si elle existe (pour la recréer proprement)
ALTER TABLE ventes_articles DROP CONSTRAINT IF EXISTS ventes_articles_vente_id_fkey;
ALTER TABLE ventes_articles DROP CONSTRAINT IF EXISTS ventes_articles_vente_id_fkey1;
ALTER TABLE ventes_articles DROP CONSTRAINT IF EXISTS ventes_articles_vente_id_fkey2;

-- 3. S'assurer que toutes les ventes_articles ont une vente_id valide
-- Supprimer les articles orphelins (sans vente correspondante)
DELETE FROM ventes_articles 
WHERE vente_id NOT IN (SELECT id FROM ventes WHERE id IS NOT NULL);

-- 4. Recréer la contrainte de clé étrangère correctement
ALTER TABLE ventes_articles 
ADD CONSTRAINT ventes_articles_vente_id_fkey 
FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE;

-- 5. Vérifier que la contrainte a été créée
SELECT 
    'Contrainte de cle etrangere recreee avec succes' as message,
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'ventes_articles'
AND kcu.column_name = 'vente_id';

-- 6. Recréer la contrainte pour ventes_paiements aussi au cas où
ALTER TABLE ventes_paiements DROP CONSTRAINT IF EXISTS ventes_paiements_vente_id_fkey;
ALTER TABLE ventes_paiements 
ADD CONSTRAINT ventes_paiements_vente_id_fkey 
FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE;

-- 7. Mettre à jour la cache de schéma de PostgREST/Supabase
-- Cette commande force Supabase à recharger le schéma et les relations
NOTIFY pgrst, 'reload schema';

-- 8. Test de la relation avec une requête simple
SELECT 
    v.id,
    v.numero_vente,
    v.client_nom,
    v.total_ttc,
    COUNT(va.id) as nombre_articles
FROM ventes v
LEFT JOIN ventes_articles va ON v.id = va.vente_id
GROUP BY v.id, v.numero_vente, v.client_nom, v.total_ttc
ORDER BY v.created_at DESC
LIMIT 5;

-- 9. Message de confirmation
SELECT 
    'CORRECTION TERMINEE' as status,
    'La relation entre ventes et ventes_articles a ete restauree' as message,
    'Vous pouvez maintenant recharger la page des ventes' as instruction; 