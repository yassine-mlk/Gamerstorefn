-- ========================================
-- Configuration PC Portables V2
-- Architecture types + articles individuels
-- ========================================

-- Table 1: Types de produits (Configurations)
CREATE TABLE IF NOT EXISTS pc_portables_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_produit VARCHAR(200) NOT NULL,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100),
    processeur VARCHAR(150) NOT NULL,
    ram VARCHAR(50) NOT NULL,
    carte_graphique VARCHAR(150),
    stockage VARCHAR(100) NOT NULL,
    ecran VARCHAR(100),
    image_url TEXT,
    description TEXT,
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
    garantie VARCHAR(50),
    stock_minimum INTEGER DEFAULT 1,
    -- Champs calculés automatiquement
    stock_total INTEGER DEFAULT 0,
    stock_disponible INTEGER DEFAULT 0,
    prix_moyen DECIMAL(12,2) DEFAULT 0,
    prix_minimum DECIMAL(12,2) DEFAULT 0,
    prix_maximum DECIMAL(12,2) DEFAULT 0,
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Articles individuels (Unités physiques)
CREATE TABLE IF NOT EXISTS pc_portables_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pc_portable_type_id UUID NOT NULL REFERENCES pc_portables_types(id) ON DELETE CASCADE,
    code_barre VARCHAR(100) UNIQUE NOT NULL,
    numero_serie VARCHAR(100),
    etat VARCHAR(20) NOT NULL CHECK (etat IN ('Neuf', 'Comme neuf', 'Occasion')),
    prix_achat DECIMAL(12,2) NOT NULL,
    prix_vente DECIMAL(12,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'Disponible' CHECK (statut IN ('Disponible', 'Vendu', 'Réservé', 'Défectueux', 'Retourné')),
    date_achat TIMESTAMP WITH TIME ZONE,
    date_vente TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    emplacement VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pc_portables_types_marque ON pc_portables_types(marque);
CREATE INDEX IF NOT EXISTS idx_pc_portables_types_nom_produit ON pc_portables_types(nom_produit);
CREATE INDEX IF NOT EXISTS idx_pc_portables_types_fournisseur ON pc_portables_types(fournisseur_id);

CREATE INDEX IF NOT EXISTS idx_pc_portables_articles_type ON pc_portables_articles(pc_portable_type_id);
CREATE INDEX IF NOT EXISTS idx_pc_portables_articles_code_barre ON pc_portables_articles(code_barre);
CREATE INDEX IF NOT EXISTS idx_pc_portables_articles_statut ON pc_portables_articles(statut);
CREATE INDEX IF NOT EXISTS idx_pc_portables_articles_etat ON pc_portables_articles(etat);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques des types
CREATE OR REPLACE FUNCTION update_pc_portables_types_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour les statistiques du type concerné
    UPDATE pc_portables_types SET
        stock_total = (
            SELECT COUNT(*) 
            FROM pc_portables_articles 
            WHERE pc_portable_type_id = COALESCE(NEW.pc_portable_type_id, OLD.pc_portable_type_id)
        ),
        stock_disponible = (
            SELECT COUNT(*) 
            FROM pc_portables_articles 
            WHERE pc_portable_type_id = COALESCE(NEW.pc_portable_type_id, OLD.pc_portable_type_id)
            AND statut = 'Disponible'
        ),
        prix_moyen = (
            SELECT COALESCE(AVG(prix_vente), 0)
            FROM pc_portables_articles 
            WHERE pc_portable_type_id = COALESCE(NEW.pc_portable_type_id, OLD.pc_portable_type_id)
        ),
        prix_minimum = (
            SELECT COALESCE(MIN(prix_vente), 0)
            FROM pc_portables_articles 
            WHERE pc_portable_type_id = COALESCE(NEW.pc_portable_type_id, OLD.pc_portable_type_id)
        ),
        prix_maximum = (
            SELECT COALESCE(MAX(prix_vente), 0)
            FROM pc_portables_articles 
            WHERE pc_portable_type_id = COALESCE(NEW.pc_portable_type_id, OLD.pc_portable_type_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.pc_portable_type_id, OLD.pc_portable_type_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER trigger_pc_portables_types_updated_at
    BEFORE UPDATE ON pc_portables_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_pc_portables_articles_updated_at
    BEFORE UPDATE ON pc_portables_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour maintenir les statistiques à jour
CREATE TRIGGER trigger_update_pc_portables_types_stats_insert
    AFTER INSERT ON pc_portables_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_pc_portables_types_stats();

CREATE TRIGGER trigger_update_pc_portables_types_stats_update
    AFTER UPDATE ON pc_portables_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_pc_portables_types_stats();

CREATE TRIGGER trigger_update_pc_portables_types_stats_delete
    AFTER DELETE ON pc_portables_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_pc_portables_types_stats();

-- Fonction pour générer un code-barres unique
CREATE OR REPLACE FUNCTION generer_code_barre_unique(prefix TEXT DEFAULT 'PC')
RETURNS TEXT AS $$
DECLARE
    nouveau_code TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        nouveau_code := prefix || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || LPAD((RANDOM() * 999)::INT::TEXT, 3, '0');
        
        SELECT EXISTS(
            SELECT 1 FROM pc_portables_articles WHERE code_barre = nouveau_code
        ) INTO existe;
        
        IF NOT existe THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN nouveau_code;
END;
$$ LANGUAGE plpgsql;

-- Commentaires sur les tables
COMMENT ON TABLE pc_portables_types IS 'Types de produits PC portables (modèles/configurations)';
COMMENT ON TABLE pc_portables_articles IS 'Articles individuels PC portables (unités physiques)';

-- Insérer quelques configurations de test
INSERT INTO pc_portables_types (nom_produit, marque, modele, processeur, ram, carte_graphique, stockage, ecran, garantie, stock_minimum) 
VALUES 
('ASUS ROG Strix G15', 'ASUS', 'ROG Strix G15', 'AMD Ryzen 7 7735HS', '16 GB DDR5', 'NVIDIA RTX 4060 8GB', '512 GB SSD NVMe', '15.6" 144Hz', '12 mois', 2),
('MacBook Air M2', 'Apple', 'MacBook Air M2', 'Apple M2', '8 GB', 'GPU M2 8 cœurs', '256 GB SSD', '13.6" Liquid Retina', '12 mois', 1),
('HP Pavilion Gaming', 'HP', 'Pavilion Gaming 15', 'Intel Core i5-12500H', '8 GB DDR4', 'NVIDIA RTX 3050 4GB', '512 GB SSD', '15.6" IPS', '6 mois', 1)
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Architecture PC Portables V2 configurée avec succès !';
    RAISE NOTICE 'Tables créées : pc_portables_types, pc_portables_articles';
    RAISE NOTICE 'Fonctions et triggers installés';
    RAISE NOTICE 'Configurations de test ajoutées';
END $$; 