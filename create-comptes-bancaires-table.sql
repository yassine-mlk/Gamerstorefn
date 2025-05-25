-- ===========================================
-- Script de création de la table Comptes Bancaires
-- ===========================================

-- Table des comptes bancaires de l'entreprise
CREATE TABLE IF NOT EXISTS comptes_bancaires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_compte VARCHAR(200) NOT NULL,
    nom_banque VARCHAR(200) NOT NULL,
    numero_compte VARCHAR(100),
    iban VARCHAR(34),
    bic VARCHAR(11),
    solde_initial DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    solde_actuel DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    devise VARCHAR(3) DEFAULT 'MAD',
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'Fermé')),
    type_compte VARCHAR(50) DEFAULT 'Courant' CHECK (type_compte IN ('Courant', 'Épargne', 'Crédit', 'Professionnel')),
    description TEXT,
    contact_banque VARCHAR(100),
    telephone_banque VARCHAR(20),
    email_banque VARCHAR(255),
    adresse_banque TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des mouvements bancaires
CREATE TABLE IF NOT EXISTS mouvements_bancaires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    compte_bancaire_id UUID REFERENCES comptes_bancaires(id) ON DELETE CASCADE,
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('Débit', 'Crédit')),
    montant DECIMAL(12,2) NOT NULL,
    libelle VARCHAR(300) NOT NULL,
    reference VARCHAR(100),
    date_mouvement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_valeur TIMESTAMP WITH TIME ZONE,
    categorie VARCHAR(100),
    mode_paiement VARCHAR(50) CHECK (mode_paiement IN ('Virement', 'Chèque', 'Carte', 'Prélèvement', 'Autre')),
    beneficiaire VARCHAR(200),
    emetteur VARCHAR(200),
    statut VARCHAR(20) DEFAULT 'Validé' CHECK (statut IN ('En attente', 'Validé', 'Rejeté', 'Annulé')),
    rapproche BOOLEAN DEFAULT FALSE,
    notes TEXT,
    piece_jointe VARCHAR(500), -- URL du fichier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_comptes_bancaires_statut ON comptes_bancaires(statut);
CREATE INDEX IF NOT EXISTS idx_comptes_bancaires_banque ON comptes_bancaires(nom_banque);
CREATE INDEX IF NOT EXISTS idx_comptes_bancaires_type ON comptes_bancaires(type_compte);

CREATE INDEX IF NOT EXISTS idx_mouvements_compte_id ON mouvements_bancaires(compte_bancaire_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements_bancaires(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_type ON mouvements_bancaires(type_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_statut ON mouvements_bancaires(statut);
CREATE INDEX IF NOT EXISTS idx_mouvements_categorie ON mouvements_bancaires(categorie);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE TRIGGER update_comptes_bancaires_updated_at 
    BEFORE UPDATE ON comptes_bancaires 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_mouvements_bancaires_updated_at 
    BEFORE UPDATE ON mouvements_bancaires 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour le solde automatiquement
CREATE OR REPLACE FUNCTION update_solde_compte()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le solde actuel du compte bancaire
    UPDATE comptes_bancaires 
    SET solde_actuel = solde_initial + (
        SELECT COALESCE(
            SUM(CASE 
                WHEN type_mouvement = 'Crédit' THEN montant 
                WHEN type_mouvement = 'Débit' THEN -montant 
                ELSE 0 
            END), 0
        )
        FROM mouvements_bancaires 
        WHERE compte_bancaire_id = NEW.compte_bancaire_id 
        AND statut = 'Validé'
    )
    WHERE id = NEW.compte_bancaire_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour le solde lors des mouvements
CREATE OR REPLACE TRIGGER trigger_update_solde_compte
    AFTER INSERT OR UPDATE OR DELETE ON mouvements_bancaires
    FOR EACH ROW EXECUTE FUNCTION update_solde_compte();

-- Politiques RLS (Row Level Security) pour Supabase
ALTER TABLE comptes_bancaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_bancaires ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON comptes_bancaires
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON mouvements_bancaires
    FOR ALL USING (auth.role() = 'authenticated');

-- Données de démonstration (optionnel)
INSERT INTO comptes_bancaires (nom_compte, nom_banque, numero_compte, solde_initial, solde_actuel, type_compte, description, contact_banque, telephone_banque) VALUES
('Compte Principal Gamerstore', 'Attijariwafa Bank', '007780001234567890', 50000.00, 50000.00, 'Professionnel', 'Compte principal pour les opérations courantes', 'Mohammed Alami', '0522-123456'),
('Compte Épargne', 'BMCE Bank', '011550009876543210', 25000.00, 25000.00, 'Épargne', 'Compte d''épargne pour les réserves', 'Fatima Bennani', '0523-654321'),
('Compte Fournisseurs', 'Banque Populaire', '021100005555666677', 15000.00, 15000.00, 'Professionnel', 'Compte dédié aux paiements fournisseurs', 'Youssef Tazi', '0524-789012')
ON CONFLICT (id) DO NOTHING;

-- Quelques mouvements de démonstration
INSERT INTO mouvements_bancaires (compte_bancaire_id, type_mouvement, montant, libelle, categorie, mode_paiement, beneficiaire) VALUES
((SELECT id FROM comptes_bancaires WHERE nom_compte = 'Compte Principal Gamerstore' LIMIT 1), 'Crédit', 2500.00, 'Vente matériel gaming - Client VIP', 'Vente', 'Virement', 'Martin Jean'),
((SELECT id FROM comptes_bancaires WHERE nom_compte = 'Compte Principal Gamerstore' LIMIT 1), 'Débit', 800.00, 'Achat stock processeurs', 'Achat Stock', 'Virement', 'TechDistrib Pro'),
((SELECT id FROM comptes_bancaires WHERE nom_compte = 'Compte Fournisseurs' LIMIT 1), 'Débit', 1200.00, 'Paiement facture - Gaming Hardware', 'Achat Stock', 'Virement', 'Gaming Hardware Wholesale')
ON CONFLICT (id) DO NOTHING; 