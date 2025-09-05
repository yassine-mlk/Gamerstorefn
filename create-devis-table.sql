-- Création de la table devis
CREATE TABLE IF NOT EXISTS public.devis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_devis VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Informations du devis
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_expiration DATE,
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'accepte', 'refuse', 'expire')),
    
    -- Montants
    sous_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    tva DECIMAL(10,2) NOT NULL DEFAULT 0,
    remise DECIMAL(10,2) DEFAULT 0,
    total_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Informations commerciales
    vendeur_id UUID REFERENCES auth.users(id),
    notes TEXT,
    conditions_particulieres TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table devis_articles pour les articles du devis
CREATE TABLE IF NOT EXISTS public.devis_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    devis_id UUID REFERENCES public.devis(id) ON DELETE CASCADE,
    
    -- Informations produit
    produit_id VARCHAR(50) NOT NULL,
    produit_type VARCHAR(20) NOT NULL CHECK (produit_type IN ('pc_portable', 'moniteur', 'peripherique', 'chaise_gaming', 'pc_gamer', 'composant_pc')),
    nom_produit VARCHAR(255) NOT NULL,
    marque VARCHAR(100),
    
    -- Quantités et prix
    quantite INTEGER NOT NULL DEFAULT 1,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    prix_unitaire_ttc DECIMAL(10,2) NOT NULL,
    total_ht DECIMAL(10,2) NOT NULL,
    total_ttc DECIMAL(10,2) NOT NULL,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_devis_client_id ON public.devis(client_id);
CREATE INDEX IF NOT EXISTS idx_devis_vendeur_id ON public.devis(vendeur_id);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON public.devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_date_creation ON public.devis(date_creation);
CREATE INDEX IF NOT EXISTS idx_devis_articles_devis_id ON public.devis_articles(devis_id);

-- Fonction pour générer automatiquement le numéro de devis
CREATE OR REPLACE FUNCTION generate_devis_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    current_month TEXT;
    sequence_num INTEGER;
    devis_number TEXT;
BEGIN
    -- Obtenir l'année et le mois actuels
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    current_month := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    
    -- Compter le nombre de devis ce mois-ci
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM public.devis
    WHERE EXTRACT(YEAR FROM date_creation) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM date_creation) = EXTRACT(MONTH FROM NOW());
    
    -- Générer le numéro de devis au format DEV-YYYY-MM-XXX
    devis_number := 'DEV-' || current_year || '-' || current_month || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN devis_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de devis
CREATE OR REPLACE FUNCTION set_devis_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_devis IS NULL OR NEW.numero_devis = '' THEN
        NEW.numero_devis := generate_devis_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_devis_number
    BEFORE INSERT ON public.devis
    FOR EACH ROW
    EXECUTE FUNCTION set_devis_number();

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_devis_updated_at
    BEFORE UPDATE ON public.devis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Commentaires pour la documentation
COMMENT ON TABLE public.devis IS 'Table pour stocker les devis générés';
COMMENT ON TABLE public.devis_articles IS 'Table pour stocker les articles de chaque devis';
COMMENT ON COLUMN public.devis.numero_devis IS 'Numéro unique du devis au format DEV-YYYY-MM-XXX';
COMMENT ON COLUMN public.devis.statut IS 'Statut du devis: en_attente, accepte, refuse, expire';
COMMENT ON COLUMN public.devis_articles.produit_type IS 'Type de produit: pc_portable, moniteur, peripherique, chaise_gaming, pc_gamer, composant_pc';