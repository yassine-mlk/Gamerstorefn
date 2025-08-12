-- Debug des images dans ventes_articles
-- À exécuter dans Supabase SQL Editor pour diagnostiquer le problème

-- 1. Vérifier la structure de la table ventes_articles
SELECT 
    'Structure table ventes_articles' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Compter les articles avec et sans images
SELECT 
    'Répartition des images' as info,
    COUNT(*) as total_articles,
    COUNT(image_url) as articles_avec_images,
    COUNT(*) - COUNT(image_url) as articles_sans_images,
    ROUND(COUNT(image_url) * 100.0 / COUNT(*), 2) as pourcentage_avec_images
FROM ventes_articles;

-- 3. Examiner les 10 derniers articles vendus
SELECT 
    'Derniers articles vendus' as info,
    va.id,
    va.nom_produit,
    va.produit_type,
    va.produit_id,
    va.image_url,
    v.numero_vente,
    v.date_vente,
    va.created_at
FROM ventes_articles va
JOIN ventes v ON va.vente_id = v.id
ORDER BY va.created_at DESC
LIMIT 10;

-- 4. Vérifier si les produits sources ont des images
SELECT 
    'PC Portables avec images' as info,
    id,
    nom_produit,
    image_url
FROM pc_portables
WHERE image_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 5. Vérifier la correspondance entre produits et articles vendus
SELECT 
    'Correspondance PC Portables -> Articles vendus' as info,
    pc.nom_produit,
    pc.image_url as image_produit,
    va.image_url as image_article,
    v.numero_vente,
    va.created_at
FROM pc_portables pc
JOIN ventes_articles va ON pc.id = va.produit_id AND va.produit_type = 'pc_portable'
JOIN ventes v ON va.vente_id = v.id
WHERE pc.image_url IS NOT NULL
ORDER BY va.created_at DESC
LIMIT 10;

-- 6. Vérifier les articles sans images mais dont le produit source a une image
SELECT 
    'Articles sans image mais produit source avec image' as info,
    pc.nom_produit,
    pc.image_url as image_disponible,
    va.image_url as image_article,
    v.numero_vente,
    va.created_at
FROM pc_portables pc
JOIN ventes_articles va ON pc.id = va.produit_id AND va.produit_type = 'pc_portable'
JOIN ventes v ON va.vente_id = v.id
WHERE pc.image_url IS NOT NULL 
AND va.image_url IS NULL
ORDER BY va.created_at DESC
LIMIT 10;

-- 7. Mettre à jour les articles sans images si le produit source en a une
UPDATE ventes_articles 
SET image_url = pc.image_url
FROM pc_portables pc
WHERE ventes_articles.produit_id = pc.id 
  AND ventes_articles.produit_type = 'pc_portable'
  AND ventes_articles.image_url IS NULL
  AND pc.image_url IS NOT NULL;

-- 8. Vérifier après mise à jour
SELECT 
    'Après mise à jour' as info,
    COUNT(*) as total_articles,
    COUNT(image_url) as articles_avec_images,
    COUNT(*) - COUNT(image_url) as articles_sans_images
FROM ventes_articles;

-- 9. Exemple d'articles récents avec images pour test
SELECT 
    'Articles pour test facture' as info,
    va.id,
    va.nom_produit,
    va.image_url,
    v.numero_vente,
    v.id as vente_id
FROM ventes_articles va
JOIN ventes v ON va.vente_id = v.id
WHERE va.image_url IS NOT NULL
ORDER BY v.date_vente DESC
LIMIT 5;
