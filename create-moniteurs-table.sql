-- ========================================
-- Script de création de la table moniteurs
-- ========================================

-- Table des Moniteurs
CREATE TABLE IF NOT EXISTS moniteurs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_produit VARCHAR(200) NOT NULL,
    code_barre TEXT,
    marque VARCHAR(100) NOT NULL,
    taille VARCHAR(50) NOT NULL, -- Ex: 24", 27", 32"
    resolution VARCHAR(100) NOT NULL, -- Ex: 1920x1080, 2560x1440, 3840x2160
    frequence_affichage VARCHAR(50) NOT NULL, -- Ex: 60Hz, 144Hz, 165Hz
    etat VARCHAR(20) DEFAULT 'Neuf' CHECK (etat IN ('Neuf', 'Comme neuf', 'Occasion')),
    garantie VARCHAR(20) CHECK (garantie IN ('3 mois', '6 mois', '9 mois', '12 mois')),
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
    statut VARCHAR(20) DEFAULT 'Disponible' CHECK (statut IN ('Disponible', 'Stock faible', 'Rupture', 'Réservé', 'Archivé')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des mouvements de stock pour Moniteurs
CREATE TABLE IF NOT EXISTS mouvements_stock_moniteurs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    moniteur_id UUID REFERENCES moniteurs(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_moniteurs_marque ON moniteurs(marque);
CREATE INDEX IF NOT EXISTS idx_moniteurs_taille ON moniteurs(taille);
CREATE INDEX IF NOT EXISTS idx_moniteurs_resolution ON moniteurs(resolution);
CREATE INDEX IF NOT EXISTS idx_moniteurs_etat ON moniteurs(etat);
CREATE INDEX IF NOT EXISTS idx_moniteurs_statut ON moniteurs(statut);
CREATE INDEX IF NOT EXISTS idx_moniteurs_code_barre ON moniteurs(code_barre);
CREATE INDEX IF NOT EXISTS idx_moniteurs_nom ON moniteurs USING gin(to_tsvector('french', nom_produit));
CREATE INDEX IF NOT EXISTS idx_moniteurs_fournisseur ON moniteurs(fournisseur_id);

CREATE INDEX IF NOT EXISTS idx_mouvements_moniteur_id ON mouvements_stock_moniteurs(moniteur_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_moniteurs_type ON mouvements_stock_moniteurs(type_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_moniteurs_date ON mouvements_stock_moniteurs(date_mouvement);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE TRIGGER update_moniteurs_updated_at 
    BEFORE UPDATE ON moniteurs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour gérer les mouvements de stock automatiquement
CREATE OR REPLACE FUNCTION gerer_mouvement_stock_moniteur()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le statut selon le stock
    IF NEW.stock_actuel <= 0 THEN
        NEW.statut = 'Rupture';
    ELSIF NEW.stock_actuel < NEW.stock_minimum THEN
        -- Stock faible seulement si INFÉRIEUR au minimum (pas égal)
        NEW.statut = 'Stock faible';
    ELSE
        -- Stock suffisant (>= minimum) - disponible
        IF OLD.statut = 'Rupture' OR OLD.statut = 'Stock faible' THEN
            NEW.statut = 'Disponible';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_gerer_stock_moniteur
    BEFORE UPDATE ON moniteurs
    FOR EACH ROW 
    WHEN (OLD.stock_actuel IS DISTINCT FROM NEW.stock_actuel)
    EXECUTE FUNCTION gerer_mouvement_stock_moniteur();

-- Fonction pour enregistrer les mouvements de stock
CREATE OR REPLACE FUNCTION enregistrer_mouvement_stock_moniteur()
RETURNS TRIGGER AS $$
BEGIN
    -- Enregistrer le mouvement si le stock a changé
    IF TG_OP = 'UPDATE' AND OLD.stock_actuel IS DISTINCT FROM NEW.stock_actuel THEN
        INSERT INTO mouvements_stock_moniteurs (
            moniteur_id,
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
        INSERT INTO mouvements_stock_moniteurs (
            moniteur_id,
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

CREATE OR REPLACE TRIGGER trigger_enregistrer_mouvement_moniteur
    AFTER INSERT OR UPDATE ON moniteurs
    FOR EACH ROW EXECUTE FUNCTION enregistrer_mouvement_stock_moniteur();

-- Politiques RLS (Row Level Security) pour Supabase
ALTER TABLE moniteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_stock_moniteurs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON moniteurs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON mouvements_stock_moniteurs
    FOR ALL USING (auth.role() = 'authenticated');

-- Vue pour les statistiques de stock
CREATE OR REPLACE VIEW vue_stats_moniteurs AS
SELECT 
    COUNT(*) as total_produits,
    COUNT(*) FILTER (WHERE statut = 'Disponible') as produits_disponibles,
    COUNT(*) FILTER (WHERE statut = 'Rupture') as produits_rupture,
    COUNT(*) FILTER (WHERE stock_actuel < stock_minimum AND stock_actuel > 0) as produits_stock_faible,
    SUM(stock_actuel) as stock_total,
    SUM(stock_actuel * prix_vente) as valeur_stock_total,
    AVG(prix_vente) as prix_moyen
FROM moniteurs 
WHERE statut != 'Archivé';

-- Données de démonstration (optionnel)
INSERT INTO moniteurs (
    nom_produit, code_barre, marque, taille, resolution, frequence_affichage, 
    etat, garantie, prix_achat, prix_vente, stock_actuel
) VALUES
('Dell UltraSharp U2720Q', 'DELLU2720Q001', 'Dell', '27"', '3840x2160', '60Hz', 'Neuf', '12 mois', 5000.00, 6500.00, 3),
('ASUS ROG Swift PG279Q', 'ASUSPG279Q001', 'ASUS', '27"', '2560x1440', '165Hz', 'Neuf', '12 mois', 7000.00, 8500.00, 2),
('LG 24MK430H-B', 'LG24MK430001', 'LG', '24"', '1920x1080', '75Hz', 'Comme neuf', '6 mois', 1800.00, 2300.00, 5),
('Samsung Odyssey G7', 'SAMSUNGG7001', 'Samsung', '32"', '2560x1440', '240Hz', 'Neuf', '12 mois', 8500.00, 10500.00, 1),
('AOC 24G2U', 'AOC24G2U001', 'AOC', '24"', '1920x1080', '144Hz', 'Occasion', '3 mois', 1200.00, 1600.00, 0)
ON CONFLICT DO NOTHING;

-- Commentaires sur les champs
COMMENT ON COLUMN moniteurs.nom_produit IS 'Nom complet du moniteur';
COMMENT ON COLUMN moniteurs.code_barre IS 'Code-barres du produit pour identification rapide';
COMMENT ON COLUMN moniteurs.marque IS 'Marque du moniteur (Dell, ASUS, LG, Samsung, etc.)';
COMMENT ON COLUMN moniteurs.taille IS 'Taille de l''écran en pouces (ex: 24", 27", 32")';
COMMENT ON COLUMN moniteurs.resolution IS 'Résolution d''affichage (ex: 1920x1080, 2560x1440, 3840x2160)';
COMMENT ON COLUMN moniteurs.frequence_affichage IS 'Fréquence de rafraîchissement (ex: 60Hz, 144Hz, 240Hz)';
COMMENT ON COLUMN moniteurs.etat IS 'État physique du moniteur';
COMMENT ON COLUMN moniteurs.garantie IS 'Durée de garantie offerte';
COMMENT ON COLUMN moniteurs.statut IS 'Statut du stock (géré automatiquement)';

-- Vérifier que tous les champs sont présents
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'moniteurs' 
ORDER BY ordinal_position; 