-- ===========================================
-- Script de création des tables Clients et Fournisseurs
-- ===========================================

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    date_inscription TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_achats DECIMAL(10,2) DEFAULT 0.00,
    derniere_commande TIMESTAMP WITH TIME ZONE,
    statut VARCHAR(20) DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'VIP')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    contact_principal VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    specialite VARCHAR(100),
    date_partenariat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_commandes DECIMAL(12,2) DEFAULT 0.00,
    derniere_commande TIMESTAMP WITH TIME ZONE,
    statut VARCHAR(20) DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'Privilégié')),
    conditions_paiement VARCHAR(100),
    delai_livraison_moyen INTEGER, -- en jours
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des achats/commandes clients
CREATE TABLE IF NOT EXISTS achats_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    date_commande TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    montant_total DECIMAL(10,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'En attente' CHECK (statut IN ('En attente', 'En cours', 'Livré', 'Annulé')),
    date_livraison TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes fournisseurs
CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE CASCADE,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    date_commande TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    montant_total DECIMAL(12,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Confirmé', 'En transit', 'Livrée', 'Annulée')),
    date_livraison_prevue TIMESTAMP WITH TIME ZONE,
    date_livraison_reelle TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);
CREATE INDEX IF NOT EXISTS idx_clients_date_inscription ON clients(date_inscription);

CREATE INDEX IF NOT EXISTS idx_fournisseurs_email ON fournisseurs(email);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_statut ON fournisseurs(statut);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_specialite ON fournisseurs(specialite);

CREATE INDEX IF NOT EXISTS idx_achats_client_id ON achats_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_achats_date ON achats_clients(date_commande);
CREATE INDEX IF NOT EXISTS idx_achats_statut ON achats_clients(statut);

CREATE INDEX IF NOT EXISTS idx_commandes_fournisseur_id ON commandes_fournisseurs(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes_fournisseurs(date_commande);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes_fournisseurs(statut);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_fournisseurs_updated_at 
    BEFORE UPDATE ON fournisseurs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_achats_clients_updated_at 
    BEFORE UPDATE ON achats_clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_commandes_fournisseurs_updated_at 
    BEFORE UPDATE ON commandes_fournisseurs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour les totaux automatiquement
CREATE OR REPLACE FUNCTION update_client_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le total des achats et la dernière commande du client
    UPDATE clients 
    SET 
        total_achats = (
            SELECT COALESCE(SUM(montant_total), 0) 
            FROM achats_clients 
            WHERE client_id = NEW.client_id AND statut = 'Livré'
        ),
        derniere_commande = (
            SELECT MAX(date_commande) 
            FROM achats_clients 
            WHERE client_id = NEW.client_id
        )
    WHERE id = NEW.client_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_fournisseur_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le total des commandes et la dernière commande du fournisseur
    UPDATE fournisseurs 
    SET 
        total_commandes = (
            SELECT COALESCE(SUM(montant_total), 0) 
            FROM commandes_fournisseurs 
            WHERE fournisseur_id = NEW.fournisseur_id AND statut = 'Livrée'
        ),
        derniere_commande = (
            SELECT MAX(date_commande) 
            FROM commandes_fournisseurs 
            WHERE fournisseur_id = NEW.fournisseur_id
        )
    WHERE id = NEW.fournisseur_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_update_client_totals
    AFTER INSERT OR UPDATE OR DELETE ON achats_clients
    FOR EACH ROW EXECUTE FUNCTION update_client_totals();

CREATE OR REPLACE TRIGGER trigger_update_fournisseur_totals
    AFTER INSERT OR UPDATE OR DELETE ON commandes_fournisseurs
    FOR EACH ROW EXECUTE FUNCTION update_fournisseur_totals();

-- Politiques RLS (Row Level Security) pour Supabase
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achats_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes_fournisseurs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON fournisseurs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON achats_clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON commandes_fournisseurs
    FOR ALL USING (auth.role() = 'authenticated');

-- Données de démonstration (optionnel)
INSERT INTO clients (nom, prenom, email, telephone, adresse, statut, total_achats) VALUES
('Martin', 'Jean', 'jean.martin@email.com', '0612345678', '123 Rue de la Tech, Paris', 'VIP', 15420.00),
('Dubois', 'Marie', 'marie.dubois@email.com', '0698765432', '456 Avenue Gaming, Lyon', 'Actif', 8750.00),
('Leroy', 'Pierre', 'pierre.leroy@email.com', '0655443322', '789 Boulevard PC, Marseille', 'VIP', 25680.00)
ON CONFLICT (email) DO NOTHING;

INSERT INTO fournisseurs (nom, contact_principal, email, telephone, adresse, specialite, statut, total_commandes) VALUES
('TechDistrib Pro', 'Laurent Moreau', 'contact@techdistrib.com', '0123456789', '15 Zone Industrielle, Rungis', 'Composants PC', 'Privilégié', 45680.00),
('Gaming Hardware Wholesale', 'Sarah Chen', 'orders@ghw.com', '0198765432', '89 Avenue Tech, Lyon', 'Matériel Gaming', 'Actif', 28490.00),
('Monitor Solutions Europe', 'Thomas Weber', 'thomas@monitorsolutions.eu', '0144556677', '234 Rue Innovation, Marseille', 'Écrans et Moniteurs', 'Actif', 19750.00)
ON CONFLICT (email) DO NOTHING; 