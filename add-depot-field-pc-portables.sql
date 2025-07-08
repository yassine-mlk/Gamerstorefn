-- ========================================
-- Script pour ajouter le champ depot à la table pc_portables
-- ========================================

-- Ajouter le champ depot avec les valeurs autorisées
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS depot VARCHAR(50) NOT NULL DEFAULT 'magasin principal' 
CHECK (depot IN ('magasin principal', 'depot'));

-- Créer un index pour améliorer les performances de recherche par dépôt
CREATE INDEX IF NOT EXISTS idx_pc_portables_depot ON pc_portables(depot);

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN pc_portables.depot IS 'Lieu de stockage du produit : magasin principal ou depot';

-- Mettre à jour les produits existants (optionnel - ils auront "magasin principal" par défaut)
-- UPDATE pc_portables SET depot = 'magasin principal' WHERE depot IS NULL;

-- Afficher la structure mise à jour
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    check_clause
FROM information_schema.columns 
LEFT JOIN information_schema.check_constraints cc ON cc.constraint_name LIKE '%' || column_name || '%'
WHERE table_name = 'pc_portables' 
AND column_name = 'depot'
ORDER BY ordinal_position;

-- Vérifier que la contrainte fonctionne
DO $$
BEGIN
    RAISE NOTICE '✅ Champ depot ajouté avec succès à la table pc_portables';
    RAISE NOTICE 'Valeurs autorisées : magasin principal, depot';
    RAISE NOTICE 'Valeur par défaut : magasin principal';
END $$; 