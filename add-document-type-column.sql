-- Script pour ajouter la colonne document_type à la table ventes
-- Cette colonne est utilisée dans le code TypeScript mais manque dans la base de données

-- Ajouter la colonne document_type avec une valeur par défaut
ALTER TABLE ventes 
ADD COLUMN IF NOT EXISTS document_type VARCHAR(50) DEFAULT 'facture' 
CHECK (document_type IN ('facture', 'bon_achat'));

-- Mettre à jour les enregistrements existants pour avoir une valeur par défaut
UPDATE ventes 
SET document_type = 'facture' 
WHERE document_type IS NULL;

-- Rendre la colonne NOT NULL après avoir mis à jour les valeurs existantes
ALTER TABLE ventes 
ALTER COLUMN document_type SET NOT NULL;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN ventes.document_type IS 'Type de document: facture ou bon_achat';

-- Vérifier que la colonne a été ajoutée correctement
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ventes' AND column_name = 'document_type';

-- Afficher un échantillon des ventes avec la nouvelle colonne
SELECT numero_vente, client_nom, document_type, total_ttc, created_at
FROM ventes 
ORDER BY created_at DESC 
LIMIT 5;