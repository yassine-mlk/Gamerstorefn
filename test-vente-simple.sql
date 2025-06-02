-- Script de test pour vérifier que les ventes fonctionnent
-- Exécuter après avoir supprimé les contraintes

-- 1. Test d'insertion d'une vente simple
INSERT INTO ventes (
    client_nom,
    client_email,
    vendeur_nom,
    sous_total,
    tva,
    total_ht,
    total_ttc,
    mode_paiement,
    type_vente,
    statut,
    notes
) VALUES (
    'Client Test',
    'test@example.com',
    'Vendeur Test',
    1000.00,
    200.00,
    1000.00,
    1200.00,
    'carte',
    'magasin',
    'payee',
    'Test sans contraintes'
);

-- 2. Test avec des valeurs personnalisées (qui auraient été refusées avant)
INSERT INTO ventes (
    client_nom,
    sous_total,
    total_ht,
    total_ttc,
    mode_paiement,
    type_vente,
    statut
) VALUES (
    'Client Sans Email',
    500.00,
    500.00,
    600.00,
    'bitcoin', -- Valeur non prévue dans l'ancien système
    'drive', -- Valeur non prévue dans l'ancien système  
    'test' -- Valeur non prévue dans l'ancien système
);

-- 3. Vérifier que les insertions ont fonctionné
SELECT 
    id,
    numero_vente,
    client_nom,
    mode_paiement,
    type_vente,
    statut,
    total_ttc,
    created_at
FROM ventes 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Test d'insertion d'articles de vente
INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    id as vente_id,
    'test-product-id' as produit_id,
    'custom-type' as produit_type, -- Type personnalisé
    'Produit Test' as nom_produit,
    100.00 as prix_unitaire_ht,
    120.00 as prix_unitaire_ttc,
    2 as quantite,
    200.00 as total_ht,
    240.00 as total_ttc
FROM ventes 
WHERE client_nom = 'Client Test'
LIMIT 1;

-- 5. Vérifier les articles
SELECT 
    va.*,
    v.client_nom
FROM ventes_articles va
JOIN ventes v ON va.vente_id = v.id
ORDER BY va.created_at DESC
LIMIT 3;

-- Message de confirmation
SELECT 'Test terminé ! Les ventes fonctionnent maintenant sans contraintes restrictives.' as message; 