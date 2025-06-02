-- Script SQL pour créer les tables des PC Gamer
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table des configurations PC Gamer
CREATE TABLE IF NOT EXISTS public.pc_gamer_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_config VARCHAR(255) NOT NULL,
    description TEXT,
    prix_vente DECIMAL(10,2) NOT NULL DEFAULT 0,
    prix_coutant DECIMAL(10,2) NOT NULL DEFAULT 0,
    code_barre VARCHAR(100) UNIQUE,
    image_url TEXT,
    notes TEXT,
    garantie VARCHAR(20) NOT NULL DEFAULT '0' CHECK (garantie IN ('0', '3', '6', '9', '12')),
    statut VARCHAR(20) NOT NULL DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'Archivé')),
    stock_possible INTEGER NOT NULL DEFAULT 0,
    date_ajout TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    derniere_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des composants utilisés dans chaque configuration
CREATE TABLE IF NOT EXISTS public.pc_gamer_composants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_id UUID NOT NULL REFERENCES public.pc_gamer_configs(id) ON DELETE CASCADE,
    composant_id UUID NOT NULL REFERENCES public.composants_pc(id) ON DELETE CASCADE,
    quantite INTEGER NOT NULL DEFAULT 1,
    type_composant VARCHAR(50) NOT NULL CHECK (type_composant IN ('cpu', 'gpu', 'ram', 'disc', 'case', 'mother_board', 'power', 'cooling')),
    ordre_affichage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte pour éviter les doublons
    UNIQUE(config_id, composant_id)
);

-- Créer une table pour les PC Gamer assemblés/vendus (instances)
CREATE TABLE IF NOT EXISTS public.pc_gamer_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_id UUID NOT NULL REFERENCES public.pc_gamer_configs(id),
    numero_serie VARCHAR(100) UNIQUE,
    statut VARCHAR(20) NOT NULL DEFAULT 'Assemblé' CHECK (statut IN ('Assemblé', 'Testé', 'Vendu', 'SAV', 'Retourné')),
    date_assemblage TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_vente TIMESTAMP WITH TIME ZONE,
    prix_vente_final DECIMAL(10,2),
    client_id UUID,
    technicien VARCHAR(255),
    notes_assemblage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pc_gamer_configs_statut ON public.pc_gamer_configs(statut);
CREATE INDEX IF NOT EXISTS idx_pc_gamer_configs_code_barre ON public.pc_gamer_configs(code_barre);
CREATE INDEX IF NOT EXISTS idx_pc_gamer_composants_config ON public.pc_gamer_composants(config_id);
CREATE INDEX IF NOT EXISTS idx_pc_gamer_composants_composant ON public.pc_gamer_composants(composant_id);
CREATE INDEX IF NOT EXISTS idx_pc_gamer_composants_type ON public.pc_gamer_composants(type_composant);
CREATE INDEX IF NOT EXISTS idx_pc_gamer_instances_config ON public.pc_gamer_instances(config_id);
CREATE INDEX IF NOT EXISTS idx_pc_gamer_instances_statut ON public.pc_gamer_instances(statut);

-- Fonction pour calculer le stock possible d'une configuration
CREATE OR REPLACE FUNCTION calculate_stock_possible(config_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    min_stock INTEGER := 999999;
    comp_record RECORD;
BEGIN
    -- Pour chaque composant de la configuration
    FOR comp_record IN 
        SELECT 
            pgc.quantite,
            cp.stock_actuel
        FROM public.pc_gamer_composants pgc
        JOIN public.composants_pc cp ON pgc.composant_id = cp.id
        WHERE pgc.config_id = config_id_param
    LOOP
        -- Calculer combien de fois on peut utiliser ce composant
        min_stock := LEAST(min_stock, FLOOR(comp_record.stock_actuel / comp_record.quantite));
    END LOOP;
    
    -- Si aucun composant trouvé, retourner 0
    IF min_stock = 999999 THEN
        RETURN 0;
    END IF;
    
    RETURN min_stock;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement le stock possible et prix coutant
CREATE OR REPLACE FUNCTION update_pc_gamer_config_stats()
RETURNS TRIGGER AS $$
DECLARE
    config_record RECORD;
BEGIN
    -- Récupérer l'ID de la configuration
    IF TG_OP = 'DELETE' THEN
        -- Pour les suppressions, utiliser OLD
        UPDATE public.pc_gamer_configs 
        SET 
            stock_possible = calculate_stock_possible(OLD.config_id),
            prix_coutant = (
                SELECT COALESCE(SUM(cp.prix_achat * pgc.quantite), 0)
                FROM public.pc_gamer_composants pgc
                JOIN public.composants_pc cp ON pgc.composant_id = cp.id
                WHERE pgc.config_id = OLD.config_id
            ),
            derniere_modification = NOW(),
            updated_at = NOW()
        WHERE id = OLD.config_id;
        
        RETURN OLD;
    ELSE
        -- Pour les insertions et mises à jour
        UPDATE public.pc_gamer_configs 
        SET 
            stock_possible = calculate_stock_possible(NEW.config_id),
            prix_coutant = (
                SELECT COALESCE(SUM(cp.prix_achat * pgc.quantite), 0)
                FROM public.pc_gamer_composants pgc
                JOIN public.composants_pc cp ON pgc.composant_id = cp.id
                WHERE pgc.config_id = NEW.config_id
            ),
            derniere_modification = NOW(),
            updated_at = NOW()
        WHERE id = NEW.config_id;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la mise à jour automatique
DROP TRIGGER IF EXISTS trigger_update_pc_gamer_stats ON public.pc_gamer_composants;
CREATE TRIGGER trigger_update_pc_gamer_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.pc_gamer_composants
    FOR EACH ROW EXECUTE FUNCTION update_pc_gamer_config_stats();

-- Trigger pour mettre à jour le stock possible quand le stock des composants change
CREATE OR REPLACE FUNCTION update_all_pc_gamer_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour toutes les configurations qui utilisent ce composant
    UPDATE public.pc_gamer_configs
    SET 
        stock_possible = calculate_stock_possible(public.pc_gamer_configs.id),
        derniere_modification = NOW(),
        updated_at = NOW()
    WHERE id IN (
        SELECT DISTINCT config_id 
        FROM public.pc_gamer_composants 
        WHERE composant_id = NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pc_gamer_stock_on_composant_change ON public.composants_pc;
CREATE TRIGGER trigger_update_pc_gamer_stock_on_composant_change
    AFTER UPDATE OF stock_actuel ON public.composants_pc
    FOR EACH ROW EXECUTE FUNCTION update_all_pc_gamer_stock();

-- Créer une vue pour les statistiques des PC Gamer
CREATE OR REPLACE VIEW public.vue_stats_pc_gamer AS
SELECT 
    COUNT(*) as total_configs,
    COUNT(CASE WHEN statut = 'Actif' THEN 1 END) as configs_actives,
    COUNT(CASE WHEN stock_possible > 0 THEN 1 END) as configs_disponibles,
    COUNT(CASE WHEN stock_possible = 0 THEN 1 END) as configs_rupture,
    SUM(stock_possible) as total_stock_possible,
    ROUND(AVG(prix_vente), 2) as prix_moyen,
    ROUND(AVG(prix_coutant), 2) as cout_moyen,
    ROUND(AVG(CASE WHEN prix_coutant > 0 THEN ((prix_vente - prix_coutant) / prix_coutant * 100) END), 2) as marge_moyenne
FROM public.pc_gamer_configs
WHERE statut = 'Actif';

-- Accorder les permissions
GRANT ALL ON public.pc_gamer_configs TO anon, authenticated;
GRANT ALL ON public.pc_gamer_composants TO anon, authenticated;
GRANT ALL ON public.pc_gamer_instances TO anon, authenticated;
GRANT SELECT ON public.vue_stats_pc_gamer TO anon, authenticated;

-- Désactiver RLS pour simplifier
ALTER TABLE public.pc_gamer_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_gamer_composants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_gamer_instances DISABLE ROW LEVEL SECURITY;

-- Insérer quelques données d'exemple
INSERT INTO public.pc_gamer_configs (nom_config, description, prix_vente, code_barre, garantie, notes) VALUES
('Gaming Pro RTX 4080', 'Configuration gaming haut de gamme avec RTX 4080', 2500.00, 'PCG001', '12', 'PC gaming premium pour les jeux en 4K'),
('Office Pro', 'Configuration bureautique performante', 1200.00, 'PCG002', '6', 'PC parfait pour le travail et la productivité'),
('Gaming Entry Level', 'Configuration gaming entrée de gamme', 1500.00, 'PCG003', '12', 'PC gaming accessible pour débuter');

-- Message de confirmation
SELECT 'Tables PC Gamer créées avec succès !' as message; 