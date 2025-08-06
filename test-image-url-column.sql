-- Script pour tester la colonne image_url
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la colonne image_url existe
SELECT 
    'Vérification de la colonne image_url' as test,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' 
AND column_name = 'image_url';

-- 2. Si la colonne n'existe pas, l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventes_articles' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE ventes_articles ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne image_url existe déjà';
    END IF;
END $$;

-- 3. Vérifier à nouveau
SELECT 
    'Colonne image_url après vérification' as test,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' 
AND column_name = 'image_url';

-- 4. Test d'insertion avec image_url
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
    (SELECT id FROM ventes ORDER BY created_at DESC LIMIT 1),
    'test-product-123',
    'pc_portable',
    'Test PC Portable avec image',
    100.00,
    120.00,
    1,
    100.00,
    120.00,
    'https://example.com/pc-portable.jpg'
);

-- 5. Vérifier l'insertion
SELECT 
    'Test insertion avec image_url' as test,
    id,
    nom_produit,
    image_url,
    created_at
FROM ventes_articles 
WHERE nom_produit = 'Test PC Portable avec image'
ORDER BY created_at DESC
LIMIT 1;

-- 6. Nettoyer le test
DELETE FROM ventes_articles 
WHERE nom_produit = 'Test PC Portable avec image';

-- 7. Message final
SELECT 'Test de la colonne image_url terminé avec succès !' as message; 