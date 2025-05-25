-- ========================================
-- Script pour corriger la contrainte statut de pc_portables
-- ========================================

-- Supprimer l'ancienne contrainte
ALTER TABLE pc_portables DROP CONSTRAINT IF EXISTS pc_portables_statut_check;

-- Ajouter la nouvelle contrainte avec 'Stock faible'
ALTER TABLE pc_portables ADD CONSTRAINT pc_portables_statut_check 
    CHECK (statut IN ('Disponible', 'Stock faible', 'Rupture', 'Réservé', 'Archivé'));

-- Mettre à jour la fonction de gestion du stock pour inclure 'Stock faible'
-- Modification: stock = minimum sera considéré comme 'Disponible'
CREATE OR REPLACE FUNCTION gerer_mouvement_stock_pc_portable()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le statut selon le stock
    IF NEW.stock_actuel <= 0 THEN
        NEW.statut = 'Rupture';
    ELSIF NEW.stock_actuel < NEW.stock_minimum THEN
        -- Stock faible seulement si INFÉRIEUR au minimum (pas égal)
        NEW.statut = 'Stock faible';
    ELSE
        -- Stock suffisant (>= minimum) - disponible
        IF OLD.statut = 'Rupture' OR OLD.statut = 'Stock faible' THEN
            NEW.statut = 'Disponible';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer les règles de statut aux données existantes
UPDATE pc_portables 
SET statut = CASE 
    WHEN stock_actuel <= 0 THEN 'Rupture'
    WHEN stock_actuel < stock_minimum THEN 'Stock faible'
    ELSE 'Disponible'
END
WHERE statut NOT IN ('Réservé', 'Archivé');

-- Vérifier les résultats
SELECT 
    statut,
    COUNT(*) as nombre_produits,
    STRING_AGG(nom_produit || ' (stock: ' || stock_actuel || ', min: ' || stock_minimum || ')', ', ') as exemples
FROM pc_portables 
GROUP BY statut 
ORDER BY statut; 