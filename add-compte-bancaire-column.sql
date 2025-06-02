-- Script pour ajouter la colonne compte_bancaire_id à la table ventes_paiements
-- Cette colonne est nécessaire pour les paiements par virement

-- 1. Ajouter la colonne compte_bancaire_id
ALTER TABLE ventes_paiements 
ADD COLUMN IF NOT EXISTS compte_bancaire_id UUID;

-- 2. Ajouter la contrainte de clé étrangère vers la table comptes_bancaires
ALTER TABLE ventes_paiements 
ADD CONSTRAINT ventes_paiements_compte_bancaire_fkey 
FOREIGN KEY (compte_bancaire_id) REFERENCES comptes_bancaires(id) ON DELETE SET NULL;

-- 3. Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ventes_paiements_compte_bancaire 
ON ventes_paiements(compte_bancaire_id);

-- 4. Mettre à jour le schéma PostgREST
NOTIFY pgrst, 'reload schema';

-- 5. Vérifier que la colonne a été ajoutée
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_paiements' 
AND column_name = 'compte_bancaire_id';

-- Message de confirmation
SELECT 'Colonne compte_bancaire_id ajoutée avec succès à la table ventes_paiements' as message; 