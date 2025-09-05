-- Script pour corriger la relation entre les tables ventes et clients

-- 1. Vérifier si la contrainte de clé étrangère existe
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
  AND tc.table_name='ventes'
  AND kcu.column_name='client_id';

-- 2. Si la contrainte n'existe pas, la créer
-- D'abord, s'assurer que tous les client_id dans ventes existent dans clients
UPDATE ventes 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
  AND client_id NOT IN (SELECT id FROM clients WHERE id IS NOT NULL);

-- 3. Ajouter la contrainte de clé étrangère
ALTER TABLE ventes 
ADD CONSTRAINT fk_ventes_client_id 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 4. Créer un index pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS idx_ventes_client_id ON ventes(client_id);

-- 5. Vérifier que la contrainte a été créée
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
  AND tc.table_name='ventes'
  AND kcu.column_name='client_id';

SELECT 'Relation ventes-clients corrigée avec succès!' as message;