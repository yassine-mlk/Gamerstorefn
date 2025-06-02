-- Script direct pour corriger la relation ventes/ventes_articles
-- Version simplifiée sans apostrophes problématiques

-- 1. Supprimer toutes les contraintes FK existantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints 
              WHERE table_name = 'ventes_articles' AND constraint_type = 'FOREIGN KEY') 
    LOOP
        EXECUTE 'ALTER TABLE ventes_articles DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- 2. Supprimer les articles orphelins
DELETE FROM ventes_articles 
WHERE vente_id IS NULL 
   OR vente_id NOT IN (SELECT id FROM ventes WHERE id IS NOT NULL);

-- 3. S'assurer que vente_id n'est pas NULL
ALTER TABLE ventes_articles ALTER COLUMN vente_id SET NOT NULL;

-- 4. Créer la contrainte de clé étrangère
ALTER TABLE ventes_articles 
ADD CONSTRAINT ventes_articles_vente_id_fkey 
FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE;

-- 5. Faire pareil pour ventes_paiements
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints 
              WHERE table_name = 'ventes_paiements' AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%vente_id%') 
    LOOP
        EXECUTE 'ALTER TABLE ventes_paiements DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

DELETE FROM ventes_paiements 
WHERE vente_id IS NULL 
   OR vente_id NOT IN (SELECT id FROM ventes WHERE id IS NOT NULL);

ALTER TABLE ventes_paiements ALTER COLUMN vente_id SET NOT NULL;

ALTER TABLE ventes_paiements 
ADD CONSTRAINT ventes_paiements_vente_id_fkey 
FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE;

-- 6. Recharger le schéma PostgREST
NOTIFY pgrst, 'reload schema';

-- 7. Test final
SELECT 
    'Relation restauree avec succes' as status,
    COUNT(DISTINCT v.id) as ventes_total,
    COUNT(va.id) as articles_total
FROM ventes v
LEFT JOIN ventes_articles va ON v.id = va.vente_id; 