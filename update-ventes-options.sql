-- Script pour mettre à jour les options de vente selon les nouvelles spécifications
-- Supprimer "carte bancaire" des modes de paiement et "telephone" + "en_ligne" des types de vente

-- 1. Mettre à jour les modes de paiement "carte" vers "especes" par défaut
UPDATE ventes 
SET mode_paiement = 'especes' 
WHERE mode_paiement = 'carte';

-- 2. Mettre à jour les types de vente non autorisés vers "magasin"
UPDATE ventes 
SET type_vente = 'magasin' 
WHERE type_vente IN ('telephone', 'en_ligne');

-- 3. Mettre à jour les paiements avec mode "carte" vers "especes"
UPDATE ventes_paiements 
SET mode_paiement = 'especes' 
WHERE mode_paiement = 'carte';

-- 4. Vérifier les modes de paiement valides maintenant
SELECT 
    mode_paiement,
    COUNT(*) as nombre_ventes
FROM ventes 
GROUP BY mode_paiement
ORDER BY nombre_ventes DESC;

-- 5. Vérifier les types de vente valides maintenant
SELECT 
    type_vente,
    COUNT(*) as nombre_ventes
FROM ventes 
GROUP BY type_vente
ORDER BY nombre_ventes DESC;

-- 6. Afficher un résumé des modifications
SELECT 
    'Modifications terminées:' as message,
    'Modes de paiement autorisés: especes, virement, cheque, mixte' as modes_paiement,
    'Types de vente autorisés: magasin, commande' as types_vente; 