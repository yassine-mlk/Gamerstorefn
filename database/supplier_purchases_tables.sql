-- Table pour les achats fournisseurs
CREATE TABLE IF NOT EXISTS achats_fournisseurs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fournisseur_id UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE CASCADE,
  numero_facture VARCHAR(100),
  date_achat DATE NOT NULL,
  montant_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  montant_paye DECIMAL(10,2) NOT NULL DEFAULT 0,
  montant_restant DECIMAL(10,2) NOT NULL DEFAULT 0,
  statut_paiement VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (statut_paiement IN ('en_attente', 'partiel', 'paye')),
  mode_paiement VARCHAR(20) CHECK (mode_paiement IN ('especes', 'virement', 'cheque')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les articles des achats fournisseurs
CREATE TABLE IF NOT EXISTS articles_achats_fournisseurs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achat_fournisseur_id UUID NOT NULL REFERENCES achats_fournisseurs(id) ON DELETE CASCADE,
  nom_article VARCHAR(255) NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  prix_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les paiements aux fournisseurs
CREATE TABLE IF NOT EXISTS paiements_fournisseurs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fournisseur_id UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE CASCADE,
  achat_fournisseur_id UUID REFERENCES achats_fournisseurs(id) ON DELETE SET NULL,
  montant DECIMAL(10,2) NOT NULL,
  mode_paiement VARCHAR(20) NOT NULL CHECK (mode_paiement IN ('especes', 'virement', 'cheque')),
  compte_bancaire_id UUID REFERENCES comptes_bancaires(id) ON DELETE SET NULL,
  date_paiement DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_achats_fournisseurs_fournisseur_id ON achats_fournisseurs(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_achats_fournisseurs_date_achat ON achats_fournisseurs(date_achat);
CREATE INDEX IF NOT EXISTS idx_achats_fournisseurs_statut_paiement ON achats_fournisseurs(statut_paiement);
CREATE INDEX IF NOT EXISTS idx_articles_achats_fournisseurs_achat_id ON articles_achats_fournisseurs(achat_fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_paiements_fournisseurs_fournisseur_id ON paiements_fournisseurs(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_paiements_fournisseurs_achat_id ON paiements_fournisseurs(achat_fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_paiements_fournisseurs_date_paiement ON paiements_fournisseurs(date_paiement);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_achats_fournisseurs_updated_at BEFORE UPDATE ON achats_fournisseurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calculer automatiquement le prix total des articles
CREATE OR REPLACE FUNCTION calculate_article_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.prix_total = NEW.quantite * NEW.prix_unitaire;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_article_total_trigger BEFORE INSERT OR UPDATE ON articles_achats_fournisseurs FOR EACH ROW EXECUTE FUNCTION calculate_article_total();

-- Trigger pour mettre à jour le montant total de l'achat quand les articles changent
CREATE OR REPLACE FUNCTION update_achat_total()
RETURNS TRIGGER AS $$
DECLARE
    achat_id UUID;
    nouveau_total DECIMAL(10,2);
BEGIN
    -- Déterminer l'ID de l'achat selon l'opération
    IF TG_OP = 'DELETE' THEN
        achat_id = OLD.achat_fournisseur_id;
    ELSE
        achat_id = NEW.achat_fournisseur_id;
    END IF;
    
    -- Calculer le nouveau total
    SELECT COALESCE(SUM(prix_total), 0) INTO nouveau_total
    FROM articles_achats_fournisseurs
    WHERE achat_fournisseur_id = achat_id;
    
    -- Mettre à jour l'achat
    UPDATE achats_fournisseurs
    SET 
        montant_total = nouveau_total,
        montant_restant = nouveau_total - montant_paye,
        statut_paiement = CASE
            WHEN montant_paye >= nouveau_total THEN 'paye'
            WHEN montant_paye > 0 THEN 'partiel'
            ELSE 'en_attente'
        END
    WHERE id = achat_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_achat_total_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON articles_achats_fournisseurs 
    FOR EACH ROW EXECUTE FUNCTION update_achat_total();

-- Fonction pour calculer les soldes des fournisseurs
CREATE OR REPLACE FUNCTION calculate_supplier_balances()
RETURNS TABLE (
    fournisseur_id UUID,
    total_achats DECIMAL(10,2),
    total_paye DECIMAL(10,2),
    solde_restant DECIMAL(10,2),
    derniere_transaction TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id as fournisseur_id,
        COALESCE(SUM(af.montant_total), 0) as total_achats,
        COALESCE(SUM(af.montant_paye), 0) as total_paye,
        COALESCE(SUM(af.montant_restant), 0) as solde_restant,
        GREATEST(
            COALESCE(MAX(af.created_at), '1970-01-01'::timestamp with time zone),
            COALESCE(MAX(pf.created_at), '1970-01-01'::timestamp with time zone)
        ) as derniere_transaction
    FROM fournisseurs f
    LEFT JOIN achats_fournisseurs af ON f.id = af.fournisseur_id
    LEFT JOIN paiements_fournisseurs pf ON f.id = pf.fournisseur_id
    GROUP BY f.id;
END;
$$ language 'plpgsql';

-- Vue pour un aperçu rapide des soldes fournisseurs
CREATE OR REPLACE VIEW vue_soldes_fournisseurs AS
SELECT 
    f.id,
    f.nom,
    f.email,
    f.telephone,
    COALESCE(SUM(af.montant_total), 0) as total_achats,
    COALESCE(SUM(af.montant_paye), 0) as total_paye,
    COALESCE(SUM(af.montant_restant), 0) as solde_restant,
    COUNT(af.id) as nombre_achats,
    MAX(af.date_achat) as dernier_achat
FROM fournisseurs f
LEFT JOIN achats_fournisseurs af ON f.id = af.fournisseur_id
GROUP BY f.id, f.nom, f.email, f.telephone
ORDER BY solde_restant DESC;