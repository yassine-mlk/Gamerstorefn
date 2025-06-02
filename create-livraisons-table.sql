-- ===========================================
-- Script de création de la table livraisons
-- ===========================================

-- Table des livraisons pour gérer le statut des ventes de type "en_ligne"
CREATE TABLE IF NOT EXISTS livraisons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vente_id UUID NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
    numero_livraison VARCHAR(50) UNIQUE NOT NULL,
    
    -- Informations client
    client_nom VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_telephone VARCHAR(20),
    
    -- Adresse de livraison
    adresse_livraison TEXT NOT NULL,
    code_postal VARCHAR(10),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Maroc',
    
    -- Détails de la livraison
    statut VARCHAR(50) NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'livre', 'non_livre', 'retour', 'annule')),
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_expedition TIMESTAMP WITH TIME ZONE,
    date_livraison_prevue DATE,
    date_livraison_reelle TIMESTAMP WITH TIME ZONE,
    
    -- Transporteur
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    
    -- Détails des produits
    total_articles INTEGER NOT NULL DEFAULT 0,
    poids_total DECIMAL(8,2),
    valeur_totale DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Notes et commentaires
    notes_livraison TEXT,
    commentaire_client TEXT,
    motif_retour TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Table des articles de livraison (détail des produits dans chaque livraison)
CREATE TABLE IF NOT EXISTS livraisons_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    livraison_id UUID NOT NULL REFERENCES livraisons(id) ON DELETE CASCADE,
    
    -- Référence à l'article de vente
    vente_article_id UUID REFERENCES ventes_articles(id),
    
    -- Détails du produit
    produit_id TEXT NOT NULL,
    produit_type VARCHAR(50) NOT NULL,
    nom_produit VARCHAR(255) NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    
    -- Statut spécifique de cet article
    statut_article VARCHAR(50) DEFAULT 'en_cours' CHECK (statut_article IN ('en_cours', 'livre', 'non_livre', 'endommage', 'retour')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_quantity_livraison CHECK (quantite > 0)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_livraisons_vente_id ON livraisons(vente_id);
CREATE INDEX IF NOT EXISTS idx_livraisons_statut ON livraisons(statut);
CREATE INDEX IF NOT EXISTS idx_livraisons_date_creation ON livraisons(date_creation);
CREATE INDEX IF NOT EXISTS idx_livraisons_numero ON livraisons(numero_livraison);
CREATE INDEX IF NOT EXISTS idx_livraisons_client ON livraisons(client_nom);
CREATE INDEX IF NOT EXISTS idx_livraisons_transporteur ON livraisons(transporteur);

CREATE INDEX IF NOT EXISTS idx_livraisons_articles_livraison ON livraisons_articles(livraison_id);
CREATE INDEX IF NOT EXISTS idx_livraisons_articles_produit ON livraisons_articles(produit_id, produit_type);
CREATE INDEX IF NOT EXISTS idx_livraisons_articles_statut ON livraisons_articles(statut_article);

-- Séquence pour les numéros de livraison
CREATE SEQUENCE IF NOT EXISTS livraisons_numero_seq START 1;

-- Fonction pour générer automatiquement le numéro de livraison
CREATE OR REPLACE FUNCTION generate_numero_livraison()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_livraison IS NULL OR NEW.numero_livraison = '' THEN
        NEW.numero_livraison := 'LIV' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('livraisons_numero_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de livraison
CREATE TRIGGER trigger_generate_numero_livraison
    BEFORE INSERT ON livraisons
    FOR EACH ROW
    EXECUTE FUNCTION generate_numero_livraison();

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER trigger_update_livraisons_updated_at
    BEFORE UPDATE ON livraisons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement une livraison lors d'une vente de type commande (livraison)
CREATE OR REPLACE FUNCTION create_livraison_for_online_sale()
RETURNS TRIGGER AS $$
DECLARE
    livraison_id UUID;
    article_record RECORD;
BEGIN
    -- Créer une livraison seulement pour les ventes de type "commande (livraison)"
    IF NEW.type_vente = 'commande (livraison)' AND OLD.type_vente IS DISTINCT FROM 'commande (livraison)' THEN
        
        -- Insérer la livraison
        INSERT INTO livraisons (
            vente_id,
            client_nom,
            client_email,
            adresse_livraison,
            total_articles,
            valeur_totale,
            created_by
        ) VALUES (
            NEW.id,
            NEW.client_nom,
            NEW.client_email,
            COALESCE(NEW.adresse_livraison, 'Adresse à définir'),
            0, -- sera mis à jour par le trigger sur livraisons_articles
            NEW.total_ttc,
            NEW.created_by
        )
        RETURNING id INTO livraison_id;
        
        -- Insérer les articles de livraison basés sur les articles de vente
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
            SELECT COUNT(*) FROM livraisons_articles WHERE livraison_id = livraisons.id
        )
        WHERE id = livraison_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement une livraison pour les ventes de type commande (livraison)
CREATE TRIGGER trigger_create_livraison_online_sale
    AFTER INSERT OR UPDATE ON ventes
    FOR EACH ROW
    EXECUTE FUNCTION create_livraison_for_online_sale();

-- Fonction pour mettre à jour le nombre d'articles dans une livraison
CREATE OR REPLACE FUNCTION update_livraison_articles_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le total des articles dans la livraison
    UPDATE livraisons 
    SET total_articles = (
        SELECT COALESCE(SUM(quantite), 0) 
        FROM livraisons_articles 
        WHERE livraison_id = COALESCE(NEW.livraison_id, OLD.livraison_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.livraison_id, OLD.livraison_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour maintenir le nombre d'articles à jour
CREATE TRIGGER trigger_update_articles_count_insert
    AFTER INSERT ON livraisons_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_livraison_articles_count();

CREATE TRIGGER trigger_update_articles_count_update
    AFTER UPDATE ON livraisons_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_livraison_articles_count();

CREATE TRIGGER trigger_update_articles_count_delete
    AFTER DELETE ON livraisons_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_livraison_articles_count();

-- Désactiver RLS pour éviter les problèmes (à ajuster selon vos besoins de sécurité)
ALTER TABLE livraisons DISABLE ROW LEVEL SECURITY;
ALTER TABLE livraisons_articles DISABLE ROW LEVEL SECURITY;

-- Donner les permissions nécessaires
GRANT ALL ON livraisons TO anon, authenticated, public;
GRANT ALL ON livraisons_articles TO anon, authenticated, public;
GRANT USAGE, SELECT ON SEQUENCE livraisons_numero_seq TO anon, authenticated, public;

-- Insertion de données de test pour les commandes de livraison
INSERT INTO livraisons (
    vente_id,
    client_nom,
    client_email,
    adresse_livraison,
    ville,
    total_articles,
    valeur_totale,
    transporteur,
    notes_livraison
) 
SELECT 
    v.id,
    v.client_nom,
    v.client_email,
    COALESCE(v.adresse_livraison, '123 Rue Test, Casablanca'),
    'Casablanca',
    1,
    v.total_ttc,
    'DHL Express',
    'Livraison de test'
FROM ventes v 
WHERE v.type_vente = 'commande (livraison)' 
AND NOT EXISTS (SELECT 1 FROM livraisons WHERE vente_id = v.id)
LIMIT 3;

-- Commentaires sur les tables
COMMENT ON TABLE livraisons IS 'Table des livraisons pour gérer le statut des commandes de livraison';
COMMENT ON TABLE livraisons_articles IS 'Détail des articles dans chaque livraison';

COMMENT ON COLUMN livraisons.statut IS 'Statut de la livraison : en_cours, livre, non_livre, retour, annule';
COMMENT ON COLUMN livraisons.numero_livraison IS 'Numéro unique de livraison généré automatiquement';
COMMENT ON COLUMN livraisons_articles.statut_article IS 'Statut spécifique de chaque article dans la livraison'; 