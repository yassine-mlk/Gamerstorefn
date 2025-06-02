-- ===========================================
-- Script pour ajouter les champs type_client et ICE
-- ===========================================

-- Ajouter la colonne type_client avec une valeur par défaut
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS type_client VARCHAR(20) DEFAULT 'particulier' 
CHECK (type_client IN ('particulier', 'societe'));

-- Ajouter la colonne ICE pour les sociétés
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS ice VARCHAR(50);

-- Mettre à jour les clients existants pour avoir le type 'particulier' par défaut
UPDATE clients 
SET type_client = 'particulier' 
WHERE type_client IS NULL;

-- Créer un index sur le type de client pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type_client);

-- Créer un index sur l'ICE pour les recherches
CREATE INDEX IF NOT EXISTS idx_clients_ice ON clients(ice);

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN clients.type_client IS 'Type de client: particulier ou société';
COMMENT ON COLUMN clients.ice IS 'Numéro ICE (Identifiant Commun de l''Entreprise) pour les sociétés';

-- Afficher la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position; 