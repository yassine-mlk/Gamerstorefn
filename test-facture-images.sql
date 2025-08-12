-- Script de test pour vérifier les images dans les factures
-- À exécuter dans Supabase après avoir ajouté la colonne image_url

-- 1. Vérifier que la colonne image_url existe
SELECT 
    'Vérification colonne image_url' as test,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' 
AND column_name = 'image_url';

-- 2. Vérifier les ventes existantes avec images
SELECT 
    'Ventes avec images' as test,
    v.numero_vente,
    va.nom_produit,
    va.image_url,
    va.created_at
FROM ventes v
JOIN ventes_articles va ON v.id = va.vente_id
WHERE va.image_url IS NOT NULL
ORDER BY va.created_at DESC
LIMIT 10;

-- 3. Mettre à jour une vente de test avec une image
UPDATE ventes_articles 
SET image_url = 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'
WHERE nom_produit LIKE '%PC%' 
AND image_url IS NULL
LIMIT 1;

-- 4. Vérifier la mise à jour
SELECT 
    'Test mise à jour image' as test,
    v.numero_vente,
    va.nom_produit,
    va.image_url,
    va.updated_at
FROM ventes v
JOIN ventes_articles va ON v.id = va.vente_id
WHERE va.image_url LIKE '%unsplash%'
ORDER BY va.updated_at DESC
LIMIT 5;

-- 5. Statistiques des images
SELECT 
    'Statistiques images' as test,
    COUNT(*) as total_articles,
    COUNT(image_url) as articles_avec_image,
    ROUND(COUNT(image_url) * 100.0 / COUNT(*), 2) as pourcentage_avec_image
FROM ventes_articles;

-- 6. Message final
SELECT 'Test des images dans les factures terminé !' as message;
