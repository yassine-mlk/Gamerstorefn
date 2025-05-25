-- ===========================================
-- Script de création des tables de Stock
-- ===========================================

-- Table des PC Portables
CREATE TABLE IF NOT EXISTS pc_portables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_produit VARCHAR(200) NOT NULL,
    code_barre TEXT,
    marque VARCHAR(100) NOT NULL,
    processeur VARCHAR(150) NOT NULL,
    ram VARCHAR(50) NOT NULL,
    carte_graphique VARCHAR(150),
    stockage VARCHAR(100) NOT NULL,
    ecran VARCHAR(100),
    etat VARCHAR(20) DEFAULT 'Neuf' CHECK (etat IN ('Neuf', 'Comme neuf', 'Occasion')),
    prix_achat DECIMAL(12,2) DEFAULT 0.00,
    prix_vente DECIMAL(12,2) DEFAULT 0.00,
    stock_actuel INTEGER DEFAULT 0,
    stock_minimum INTEGER DEFAULT 1,
    image_url TEXT,
    description TEXT,
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
    emplacement VARCHAR(100),
    date_ajout TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    derniere_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'Disponible' CHECK (statut IN ('Disponible', 'Rupture', 'Réservé', 'Archivé')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des mouvements de stock pour PC Portables
CREATE TABLE IF NOT EXISTS mouvements_stock_pc_portables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pc_portable_id UUID REFERENCES pc_portables(id) ON DELETE CASCADE,
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('Entrée', 'Sortie', 'Correction', 'Retour')),
    quantite INTEGER NOT NULL,
    stock_avant INTEGER NOT NULL,
    stock_apres INTEGER NOT NULL,
    prix_unitaire DECIMAL(12,2),
    motif VARCHAR(100),
    reference_externe VARCHAR(100), -- Numéro de commande, facture, etc.
    utilisateur VARCHAR(100),
    date_mouvement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pc_portables_marque ON pc_portables(marque);
CREATE INDEX IF NOT EXISTS idx_pc_portables_etat ON pc_portables(etat);
CREATE INDEX IF NOT EXISTS idx_pc_portables_statut ON pc_portables(statut);
CREATE INDEX IF NOT EXISTS idx_pc_portables_code_barre ON pc_portables(code_barre);
CREATE INDEX IF NOT EXISTS idx_pc_portables_nom ON pc_portables USING gin(to_tsvector('french', nom_produit));
CREATE INDEX IF NOT EXISTS idx_pc_portables_fournisseur ON pc_portables(fournisseur_id);

CREATE INDEX IF NOT EXISTS idx_mouvements_pc_portable_id ON mouvements_stock_pc_portables(pc_portable_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_type ON mouvements_stock_pc_portables(type_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements_stock_pc_portables(date_mouvement);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE TRIGGER update_pc_portables_updated_at 
    BEFORE UPDATE ON pc_portables 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour gérer les mouvements de stock automatiquement
CREATE OR REPLACE FUNCTION gerer_mouvement_stock_pc_portable()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le statut selon le stock
    IF NEW.stock_actuel <= 0 THEN
        NEW.statut = 'Rupture';
    ELSIF NEW.stock_actuel <= NEW.stock_minimum THEN
        -- Garder le statut actuel sauf si c'était "Rupture"
        IF OLD.statut = 'Rupture' THEN
            NEW.statut = 'Disponible';
        END IF;
    ELSE
        -- Si le stock est suffisant et était en rupture, remettre disponible
        IF OLD.statut = 'Rupture' THEN
            NEW.statut = 'Disponible';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_gerer_stock_pc_portable
    BEFORE UPDATE ON pc_portables
    FOR EACH ROW 
    WHEN (OLD.stock_actuel IS DISTINCT FROM NEW.stock_actuel)
    EXECUTE FUNCTION gerer_mouvement_stock_pc_portable();

-- Fonction pour enregistrer les mouvements de stock
CREATE OR REPLACE FUNCTION enregistrer_mouvement_stock_pc_portable()
RETURNS TRIGGER AS $$
BEGIN
    -- Enregistrer le mouvement si le stock a changé
    IF TG_OP = 'UPDATE' AND OLD.stock_actuel IS DISTINCT FROM NEW.stock_actuel THEN
        INSERT INTO mouvements_stock_pc_portables (
            pc_portable_id,
            type_mouvement,
            quantite,
            stock_avant,
            stock_apres,
            motif,
            utilisateur
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.stock_actuel > OLD.stock_actuel THEN 'Entrée'
                ELSE 'Sortie'
            END,
            ABS(NEW.stock_actuel - OLD.stock_actuel),
            OLD.stock_actuel,
            NEW.stock_actuel,
            'Modification manuelle',
            current_user
        );
    ELSIF TG_OP = 'INSERT' AND NEW.stock_actuel > 0 THEN
        INSERT INTO mouvements_stock_pc_portables (
            pc_portable_id,
            type_mouvement,
            quantite,
            stock_avant,
            stock_apres,
            motif,
            utilisateur
        ) VALUES (
            NEW.id,
            'Entrée',
            NEW.stock_actuel,
            0,
            NEW.stock_actuel,
            'Stock initial',
            current_user
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_enregistrer_mouvement_pc_portable
    AFTER INSERT OR UPDATE ON pc_portables
    FOR EACH ROW EXECUTE FUNCTION enregistrer_mouvement_stock_pc_portable();

-- Politiques RLS (Row Level Security) pour Supabase
ALTER TABLE pc_portables ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_stock_pc_portables ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON pc_portables
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON mouvements_stock_pc_portables
    FOR ALL USING (auth.role() = 'authenticated');

-- Vue pour les statistiques de stock
CREATE OR REPLACE VIEW vue_stats_pc_portables AS
SELECT 
    COUNT(*) as total_produits,
    COUNT(*) FILTER (WHERE statut = 'Disponible') as produits_disponibles,
    COUNT(*) FILTER (WHERE statut = 'Rupture') as produits_rupture,
    COUNT(*) FILTER (WHERE stock_actuel <= stock_minimum AND stock_actuel > 0) as produits_stock_faible,
    SUM(stock_actuel) as stock_total,
    SUM(stock_actuel * prix_vente) as valeur_stock_total,
    AVG(prix_vente) as prix_moyen
FROM pc_portables 
WHERE statut != 'Archivé';

-- Données de démonstration (optionnel)
INSERT INTO pc_portables (
    nom_produit, code_barre, marque, processeur, ram, carte_graphique, 
    stockage, ecran, etat, prix_achat, prix_vente, stock_actuel
) VALUES
('MacBook Pro 13" M2', 'MBP13M2001', 'Apple', 'Apple M2', '8GB', 'Apple M2 8-core GPU', '256GB SSD', '13.3" Retina', 'Neuf', 15000.00, 18000.00, 5),
('Dell XPS 13', 'DELLXPS13001', 'Dell', 'Intel Core i7-1260P', '16GB DDR5', 'Intel Iris Xe', '512GB SSD', '13.4" FHD+', 'Neuf', 12000.00, 14500.00, 3),
('HP Pavilion Gaming', 'HPPG15001', 'HP', 'AMD Ryzen 5 5600H', '8GB DDR4', 'NVIDIA GTX 1650', '512GB SSD', '15.6" FHD', 'Comme neuf', 8000.00, 9500.00, 2),
('Lenovo ThinkPad E15', 'LNTE15001', 'Lenovo', 'Intel Core i5-1135G7', '8GB DDR4', 'Intel Iris Xe', '256GB SSD', '15.6" FHD', 'Occasion', 6000.00, 7200.00, 1),
('ASUS ROG Strix G15', 'ASUSROG15001', 'ASUS', 'AMD Ryzen 7 5800H', '16GB DDR4', 'NVIDIA RTX 3060', '1TB SSD', '15.6" FHD 144Hz', 'Neuf', 16000.00, 19000.00, 0)
ON CONFLICT DO NOTHING; 