-- ========================================
-- Script pour ajouter les champs manquants à la table pc_portables
-- ========================================

-- Ajouter le champ modele
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS modele VARCHAR(100);

-- Ajouter le champ garantie  
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS garantie VARCHAR(50);

-- Créer un index sur le modele pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_pc_portables_modele ON pc_portables(modele);

-- Créer un index sur la garantie 
CREATE INDEX IF NOT EXISTS idx_pc_portables_garantie ON pc_portables(garantie);

-- Commentaires sur les nouveaux champs
COMMENT ON COLUMN pc_portables.modele IS 'Modèle spécifique du PC portable (ex: ROG Strix G15, MacBook Air M2)';
COMMENT ON COLUMN pc_portables.garantie IS 'Durée de garantie du produit (ex: 12 mois, 24 mois)'; 