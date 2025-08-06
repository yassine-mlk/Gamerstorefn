-- Script pour vérifier que la colonne image_url est prête
-- Exécuter ce script après avoir ajouté la colonne image_url

-- 1. Vérifier que la colonne existe
SELECT 
    'Colonne image_url existe' as status,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' 
AND column_name = 'image_url';

-- 2. Vérifier les permissions
SELECT 
    'Permissions sur ventes_articles' as status,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'ventes_articles'
AND grantee IN ('authenticated', 'anon');

-- 3. Test d'insertion avec image_url
INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc,
    image_url
) VALUES (
    (SELECT id FROM ventes LIMIT 1),
    'test-product-123',
    'pc_portable',
    'Test avec image',
    100.00,
    120.00,
    1,
    100.00,
    120.00,
    'https://example.com/test-image.jpg'
);

-- 4. Vérifier l'insertion
SELECT 
    'Test insertion reussi' as status,
    id,
    nom_produit,
    image_url
FROM ventes_articles 
WHERE nom_produit = 'Test avec image'
ORDER BY created_at DESC
LIMIT 1;

-- 5. Nettoyer le test
DELETE FROM ventes_articles 
WHERE nom_produit = 'Test avec image';

-- 6. Message final
SELECT 'Colonne image_url est prete a etre utilisee !' as message; 