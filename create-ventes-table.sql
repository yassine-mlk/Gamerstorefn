-- Création de la table des ventes
CREATE TABLE IF NOT EXISTS ventes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_vente VARCHAR(50) UNIQUE NOT NULL,
    date_vente TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_id UUID REFERENCES clients(id),
    client_nom VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    vendeur_id UUID REFERENCES profiles(id),
    vendeur_nom VARCHAR(255),
    
    -- Détails de la vente
    sous_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    tva DECIMAL(10,2) NOT NULL DEFAULT 0,
    remise DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Mode de paiement
    mode_paiement VARCHAR(50) NOT NULL CHECK (mode_paiement IN ('especes', 'carte', 'virement', 'cheque', 'mixte')),
    
    -- Type de vente
    type_vente VARCHAR(50) NOT NULL CHECK (type_vente IN ('magasin', 'en_ligne', 'telephone', 'commande')),
    
    -- Statut de la vente
    statut VARCHAR(50) NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'payee', 'partiellement_payee', 'annulee', 'remboursee')),
    
    -- Informations de livraison
    adresse_livraison TEXT,
    frais_livraison DECIMAL(10,2) DEFAULT 0,
    date_livraison_prevue DATE,
    date_livraison_reelle DATE,
    
    -- Notes et commentaires
    notes TEXT,
    commentaire_interne TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Création de la table des articles de vente
CREATE TABLE IF NOT EXISTS ventes_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vente_id UUID NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
    
    -- Référence produit
    produit_id UUID NOT NULL,
    produit_type VARCHAR(50) NOT NULL CHECK (produit_type IN ('pc_portable', 'moniteur', 'peripherique', 'chaise_gaming')),
    
    -- Détails de l'article au moment de la vente
    nom_produit VARCHAR(255) NOT NULL,
    code_barre VARCHAR(100),
    marque VARCHAR(100),
    modele VARCHAR(255),
    
    -- Prix et quantité
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    prix_unitaire_ttc DECIMAL(10,2) NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1,
    remise_unitaire DECIMAL(10,2) DEFAULT 0,
    
    -- Totaux
    total_ht DECIMAL(10,2) NOT NULL,
    total_ttc DECIMAL(10,2) NOT NULL,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT positive_quantity CHECK (quantite > 0),
    CONSTRAINT positive_prices CHECK (prix_unitaire_ht >= 0 AND prix_unitaire_ttc >= 0)
);

-- Création de la table des paiements
CREATE TABLE IF NOT EXISTS ventes_paiements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vente_id UUID NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
    
    -- Détails du paiement
    montant DECIMAL(10,2) NOT NULL,
    mode_paiement VARCHAR(50) NOT NULL CHECK (mode_paiement IN ('especes', 'carte', 'virement', 'cheque')),
    
    -- Informations spécifiques selon le mode
    numero_transaction VARCHAR(255),
    numero_cheque VARCHAR(100),
    banque VARCHAR(255),
    date_echeance DATE,
    
    -- Statut du paiement
    statut VARCHAR(50) NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'refuse', 'annule')),
    
    -- Métadonnées
    date_paiement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Contraintes
    CONSTRAINT positive_amount CHECK (montant > 0)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes(date_vente);
CREATE INDEX IF NOT EXISTS idx_ventes_client ON ventes(client_id);
CREATE INDEX IF NOT EXISTS idx_ventes_vendeur ON ventes(vendeur_id);
CREATE INDEX IF NOT EXISTS idx_ventes_statut ON ventes(statut);
CREATE INDEX IF NOT EXISTS idx_ventes_type ON ventes(type_vente);
CREATE INDEX IF NOT EXISTS idx_ventes_mode_paiement ON ventes(mode_paiement);
CREATE INDEX IF NOT EXISTS idx_ventes_numero ON ventes(numero_vente);

CREATE INDEX IF NOT EXISTS idx_ventes_articles_vente ON ventes_articles(vente_id);
CREATE INDEX IF NOT EXISTS idx_ventes_articles_produit ON ventes_articles(produit_id, produit_type);

CREATE INDEX IF NOT EXISTS idx_ventes_paiements_vente ON ventes_paiements(vente_id);
CREATE INDEX IF NOT EXISTS idx_ventes_paiements_date ON ventes_paiements(date_paiement);

-- Fonction pour générer automatiquement le numéro de vente
CREATE OR REPLACE FUNCTION generate_numero_vente()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_vente IS NULL OR NEW.numero_vente = '' THEN
        NEW.numero_vente := 'V' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ventes_numero_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création de la séquence pour les numéros de vente
CREATE SEQUENCE IF NOT EXISTS ventes_numero_seq START 1;

-- Trigger pour générer automatiquement le numéro de vente
CREATE TRIGGER trigger_generate_numero_vente
    BEFORE INSERT ON ventes
    FOR EACH ROW
    EXECUTE FUNCTION generate_numero_vente();

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER trigger_update_ventes_updated_at
    BEFORE UPDATE ON ventes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer automatiquement les totaux de vente
CREATE OR REPLACE FUNCTION calculate_vente_totals()
RETURNS TRIGGER AS $$
DECLARE
    vente_record RECORD;
    total_articles DECIMAL(10,2) := 0;
    total_ht DECIMAL(10,2) := 0;
    total_ttc DECIMAL(10,2) := 0;
BEGIN
    -- Calculer les totaux des articles
    SELECT 
        COALESCE(SUM(total_ht), 0) as sum_ht,
        COALESCE(SUM(total_ttc), 0) as sum_ttc
    INTO total_ht, total_ttc
    FROM ventes_articles 
    WHERE vente_id = COALESCE(NEW.vente_id, OLD.vente_id);
    
    -- Mettre à jour la vente
    UPDATE ventes 
    SET 
        sous_total = total_ht,
        total_ht = total_ht,
        total_ttc = total_ttc,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.vente_id, OLD.vente_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour recalculer les totaux automatiquement
CREATE TRIGGER trigger_calculate_totals_insert
    AFTER INSERT ON ventes_articles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vente_totals();

CREATE TRIGGER trigger_calculate_totals_update
    AFTER UPDATE ON ventes_articles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vente_totals();

CREATE TRIGGER trigger_calculate_totals_delete
    AFTER DELETE ON ventes_articles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vente_totals();

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes_paiements ENABLE ROW LEVEL SECURITY;

-- Politiques pour les ventes
CREATE POLICY "Utilisateurs authentifiés peuvent voir toutes les ventes" ON ventes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent créer des ventes" ON ventes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les ventes" ON ventes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques pour les articles de vente
CREATE POLICY "Utilisateurs authentifiés peuvent voir tous les articles" ON ventes_articles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent créer des articles" ON ventes_articles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les articles" ON ventes_articles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les articles" ON ventes_articles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les paiements
CREATE POLICY "Utilisateurs authentifiés peuvent voir tous les paiements" ON ventes_paiements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent créer des paiements" ON ventes_paiements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les paiements" ON ventes_paiements
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insertion de données de test
INSERT INTO ventes (
    numero_vente, client_nom, client_email, vendeur_nom,
    mode_paiement, type_vente, statut, notes
) VALUES 
(
    'V20241201-0001', 'Martin Jean', 'jean.martin@email.com', 'Admin User',
    'carte', 'magasin', 'payee', 'Vente test'
),
(
    'V20241201-0002', 'Dubois Marie', 'marie.dubois@email.com', 'Admin User',
    'especes', 'en_ligne', 'en_cours', 'Commande en ligne'
),
(
    'V20241201-0003', 'Leroy Pierre', 'pierre.leroy@email.com', 'Admin User',
    'virement', 'magasin', 'payee', 'Achat important'
);

-- Commentaires sur les tables
COMMENT ON TABLE ventes IS 'Table principale des ventes du magasin';
COMMENT ON TABLE ventes_articles IS 'Détail des articles vendus dans chaque vente';
COMMENT ON TABLE ventes_paiements IS 'Historique des paiements pour chaque vente';

COMMENT ON COLUMN ventes.numero_vente IS 'Numéro unique de la vente généré automatiquement';
COMMENT ON COLUMN ventes.mode_paiement IS 'Mode de paiement principal de la vente';
COMMENT ON COLUMN ventes.type_vente IS 'Type de vente (magasin, en ligne, etc.)';
COMMENT ON COLUMN ventes.statut IS 'Statut actuel de la vente'; 