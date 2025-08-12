-- Script pour corriger les images dans les factures
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si la colonne image_url existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventes_articles' 
        AND column_name = 'image_url'
        AND table_schema = 'public'
    ) THEN
        -- Ajouter la colonne image_url si elle n'existe pas
        ALTER TABLE ventes_articles ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée à ventes_articles';
    ELSE
        RAISE NOTICE 'Colonne image_url existe déjà dans ventes_articles';
    END IF;
END $$;

-- 2. Mettre à jour les articles de vente existants avec les images des produits
-- Pour les PC portables
UPDATE ventes_articles 
SET image_url = pc.image_url
FROM pc_portables pc
WHERE ventes_articles.produit_id = pc.id 
  AND ventes_articles.produit_type = 'pc_portable'
  AND ventes_articles.image_url IS NULL
  AND pc.image_url IS NOT NULL;

-- Pour les moniteurs
UPDATE ventes_articles 
SET image_url = m.image_url
FROM moniteurs m
WHERE ventes_articles.produit_id = m.id 
  AND ventes_articles.produit_type = 'moniteur'
  AND ventes_articles.image_url IS NULL
  AND m.image_url IS NOT NULL;

-- Pour les périphériques
UPDATE ventes_articles 
SET image_url = p.image_url
FROM peripheriques p
WHERE ventes_articles.produit_id = p.id 
  AND ventes_articles.produit_type = 'peripherique'
  AND ventes_articles.image_url IS NULL
  AND p.image_url IS NOT NULL;

-- Pour les chaises gaming
UPDATE ventes_articles 
SET image_url = cg.image_url
FROM chaises_gaming cg
WHERE ventes_articles.produit_id = cg.id 
  AND ventes_articles.produit_type = 'chaise_gaming'
  AND ventes_articles.image_url IS NULL
  AND cg.image_url IS NOT NULL;

-- Pour les PC gamer
UPDATE ventes_articles 
SET image_url = pcg.image_url
FROM pc_gamer pcg
WHERE ventes_articles.produit_id = pcg.id 
  AND ventes_articles.produit_type = 'pc_gamer'
  AND ventes_articles.image_url IS NULL
  AND pcg.image_url IS NOT NULL;

-- Pour les composants PC
UPDATE ventes_articles 
SET image_url = cpc.image_url
FROM composants_pc cpc
WHERE ventes_articles.produit_id = cpc.id 
  AND ventes_articles.produit_type = 'composant_pc'
  AND ventes_articles.image_url IS NULL
  AND cpc.image_url IS NOT NULL;

-- 3. Vérifier les résultats
SELECT 
    'Résumé des mises à jour' as info,
    COUNT(*) as total_articles,
    COUNT(image_url) as articles_avec_images,
    COUNT(*) - COUNT(image_url) as articles_sans_images
FROM ventes_articles;

-- 4. Afficher quelques exemples d'articles avec images
SELECT 
    'Exemples d''articles avec images' as info,
    va.nom_produit,
    va.produit_type,
    va.image_url,
    v.numero_vente,
    v.date_vente
FROM ventes_articles va
JOIN ventes v ON va.vente_id = v.id
WHERE va.image_url IS NOT NULL
ORDER BY v.date_vente DESC
LIMIT 10;

-- 5. Créer un trigger pour automatiquement ajouter l'image_url lors de l'insertion
-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS auto_add_image_url ON ventes_articles;

-- Créer le trigger
CREATE OR REPLACE FUNCTION auto_add_image_url()
RETURNS TRIGGER AS $$
BEGIN
    -- Si image_url n'est pas fourni, essayer de le récupérer depuis le produit source
    IF NEW.image_url IS NULL THEN
        CASE NEW.produit_type
            WHEN 'pc_portable' THEN
                SELECT image_url INTO NEW.image_url 
                FROM pc_portables 
                WHERE id = NEW.produit_id;
            WHEN 'moniteur' THEN
                SELECT image_url INTO NEW.image_url 
                FROM moniteurs 
                WHERE id = NEW.produit_id;
            WHEN 'peripherique' THEN
                SELECT image_url INTO NEW.image_url 
                FROM peripheriques 
                WHERE id = NEW.produit_id;
            WHEN 'chaise_gaming' THEN
                SELECT image_url INTO NEW.image_url 
                FROM chaises_gaming 
                WHERE id = NEW.produit_id;
            WHEN 'pc_gamer' THEN
                SELECT image_url INTO NEW.image_url 
                FROM pc_gamer 
                WHERE id = NEW.produit_id;
            WHEN 'composant_pc' THEN
                SELECT image_url INTO NEW.image_url 
                FROM composants_pc 
                WHERE id = NEW.produit_id;
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER auto_add_image_url
    BEFORE INSERT ON ventes_articles
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_image_url();

-- 6. Message de confirmation
SELECT 'Script de correction des images dans les factures terminé avec succès!' as message;
