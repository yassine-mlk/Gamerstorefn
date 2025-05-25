-- ========================================
-- Script pour mettre à jour le schéma de la table pc_portables
-- ========================================

-- Ajouter le champ modele
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS modele VARCHAR(100);

-- Ajouter le champ garantie (requis pour le formulaire)
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS garantie VARCHAR(50);

-- Ajouter le champ code_barre (ajouté récemment au formulaire)
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS code_barre VARCHAR(100);

-- Ajouter le champ carte_graphique si pas présent
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS carte_graphique VARCHAR(100);

-- Ajouter le champ ecran si pas présent  
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS ecran VARCHAR(100);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pc_portables_modele ON pc_portables(modele);
CREATE INDEX IF NOT EXISTS idx_pc_portables_garantie ON pc_portables(garantie);
CREATE INDEX IF NOT EXISTS idx_pc_portables_code_barre ON pc_portables(code_barre);

-- Ajouter une contrainte unique sur le code_barre (optionnel)
-- ALTER TABLE pc_portables ADD CONSTRAINT unique_code_barre UNIQUE (code_barre);

-- Commentaires sur les champs
COMMENT ON COLUMN pc_portables.modele IS 'Modèle spécifique du PC portable (ex: ROG Strix G15, MacBook Air M2)';
COMMENT ON COLUMN pc_portables.garantie IS 'Durée de garantie du produit (ex: 12 mois, 24 mois)';
COMMENT ON COLUMN pc_portables.code_barre IS 'Code-barres du produit pour identification rapide';
COMMENT ON COLUMN pc_portables.carte_graphique IS 'Informations sur la carte graphique';
COMMENT ON COLUMN pc_portables.ecran IS 'Spécifications de l\'écran (taille, résolution, etc.)';

-- Vérifier que tous les champs sont présents
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pc_portables' 
ORDER BY ordinal_position; 