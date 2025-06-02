-- Script pour corriger le trigger de création automatique des livraisons
-- Exécuter ce script si vous avez des problèmes avec la création automatique

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS trigger_create_livraison_online_sale ON ventes;

-- Recréer la fonction avec une meilleure gestion d'erreurs
CREATE OR REPLACE FUNCTION create_livraison_for_online_sale()
RETURNS TRIGGER AS $$
DECLARE
    livraison_id UUID;
    article_record RECORD;
    existing_livraison UUID;
BEGIN
    -- Créer une livraison seulement pour les ventes de type "commande (livraison)"
    -- Et seulement si c'est une nouvelle vente OU si le type vient de changer vers "commande (livraison)"
    IF NEW.type_vente = 'commande (livraison)' AND (
        OLD IS NULL OR 
        OLD.type_vente IS DISTINCT FROM 'commande (livraison)'
    ) THEN
        
        -- Vérifier si une livraison existe déjà pour cette vente
        SELECT id INTO existing_livraison 
        FROM livraisons 
        WHERE vente_id = NEW.id
        LIMIT 1;
        
        -- Si aucune livraison n'existe, en créer une
        IF existing_livraison IS NULL THEN
            
            -- Insérer la livraison
            INSERT INTO livraisons (
                vente_id,
                client_nom,
                client_email,
                adresse_livraison,
                total_articles,
                valeur_totale,
                created_by,
                ville,
                transporteur
            ) VALUES (
                NEW.id,
                NEW.client_nom,
                NEW.client_email,
                COALESCE(NEW.adresse_livraison, 'Adresse à définir'),
                0, -- sera mis à jour par le trigger sur livraisons_articles
                NEW.total_ttc,
                NEW.created_by,
                -- Extraire la ville de l'adresse si possible
                CASE 
                    WHEN NEW.adresse_livraison LIKE '%Casablanca%' THEN 'Casablanca'
                    WHEN NEW.adresse_livraison LIKE '%Rabat%' THEN 'Rabat'
                    WHEN NEW.adresse_livraison LIKE '%Marrakech%' THEN 'Marrakech'
                    WHEN NEW.adresse_livraison LIKE '%Fès%' THEN 'Fès'
                    WHEN NEW.adresse_livraison LIKE '%Agadir%' THEN 'Agadir'
                    WHEN NEW.adresse_livraison LIKE '%Tanger%' THEN 'Tanger'
                    WHEN NEW.adresse_livraison LIKE '%Oujda%' THEN 'Oujda'
                    WHEN NEW.adresse_livraison LIKE '%Kenitra%' THEN 'Kenitra'
                    WHEN NEW.adresse_livraison LIKE '%Tetouan%' THEN 'Tetouan'
                    WHEN NEW.adresse_livraison LIKE '%Safi%' THEN 'Safi'
                    ELSE NULL
                END,
                -- Assigner un transporteur par défaut selon la ville
                CASE 
                    WHEN NEW.adresse_livraison LIKE '%Casablanca%' THEN 'DHL Express'
                    WHEN NEW.adresse_livraison LIKE '%Rabat%' THEN 'Chronopost'
                    WHEN NEW.adresse_livraison LIKE '%Marrakech%' THEN 'Amana'
                    ELSE 'CTM'
                END
            )
            RETURNING id INTO livraison_id;
            
            -- Insérer les articles de livraison basés sur les articles de vente
            -- Mais seulement s'il y a des articles
            FOR article_record IN 
                SELECT * FROM ventes_articles WHERE vente_id = NEW.id
            LOOP
                INSERT INTO livraisons_articles (
                    livraison_id,
                    vente_article_id,
                    produit_id,
                    produit_type,
                    nom_produit,
                    quantite,
                    prix_unitaire
                ) VALUES (
                    livraison_id,
                    article_record.id,
                    article_record.produit_id,
                    article_record.produit_type,
                    article_record.nom_produit,
                    article_record.quantite,
                    article_record.prix_unitaire_ttc
                );
            END LOOP;
            
            -- Mettre à jour le nombre total d'articles
            UPDATE livraisons 
            SET total_articles = (
                SELECT COALESCE(SUM(quantite), 0) 
                FROM livraisons_articles 
                WHERE livraison_id = livraisons.id
            )
            WHERE id = livraison_id;
            
        END IF;
        
    END IF;
    
    RETURN NEW;
    
EXCEPTION 
    WHEN OTHERS THEN
        -- En cas d'erreur, logger et continuer sans faire échouer la vente
        RAISE WARNING 'Erreur lors de la création de livraison pour vente %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER trigger_create_livraison_online_sale
    AFTER INSERT OR UPDATE ON ventes
    FOR EACH ROW
    EXECUTE FUNCTION create_livraison_for_online_sale();

-- Test : Afficher les ventes de type commande (livraison) sans livraison
SELECT 
    v.id,
    v.numero_vente,
    v.client_nom,
    v.type_vente,
    v.total_ttc,
    CASE WHEN l.id IS NULL THEN 'SANS LIVRAISON' ELSE 'AVEC LIVRAISON' END as statut_livraison
FROM ventes v
LEFT JOIN livraisons l ON v.id = l.vente_id
WHERE v.type_vente = 'commande (livraison)'
ORDER BY v.created_at DESC; 