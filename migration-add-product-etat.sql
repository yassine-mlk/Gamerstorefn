-- ===========================================
-- Migration: Ajout du champ product_etat à la table product_assignments
-- ===========================================

-- Ajouter le champ product_etat à la table product_assignments
ALTER TABLE product_assignments 
ADD COLUMN IF NOT EXISTS product_etat VARCHAR(20);

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN product_assignments.product_etat IS 'État du produit (Neuf, Comme neuf, Occasion)';

-- Mettre à jour les assignations existantes avec l'état par défaut "Neuf"
-- Note: Cette mise à jour est optionnelle et peut être personnalisée selon vos besoins
UPDATE product_assignments 
SET product_etat = 'Neuf' 
WHERE product_etat IS NULL;

-- Vérifier que la migration s'est bien passée
SELECT 
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN product_etat IS NOT NULL THEN 1 END) as with_etat,
    COUNT(CASE WHEN product_etat IS NULL THEN 1 END) as without_etat
FROM product_assignments;

-- Afficher les différents états présents
SELECT 
    product_etat,
    COUNT(*) as count
FROM product_assignments 
WHERE product_etat IS NOT NULL
GROUP BY product_etat
ORDER BY count DESC; 