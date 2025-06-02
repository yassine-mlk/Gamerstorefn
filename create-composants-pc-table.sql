-- Script SQL pour créer la table des composants PC
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table composants_pc
CREATE TABLE IF NOT EXISTS public.composants_pc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_produit VARCHAR(255) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('cpu', 'gpu', 'ram', 'disc', 'case', 'mother_board', 'power', 'cooling')),
    code_barre VARCHAR(100) UNIQUE,
    stock_actuel INTEGER NOT NULL DEFAULT 0,
    stock_minimum INTEGER NOT NULL DEFAULT 1,
    prix_achat DECIMAL(10,2) NOT NULL DEFAULT 0,
    prix_vente DECIMAL(10,2) NOT NULL DEFAULT 0,
    fournisseur_id UUID REFERENCES public.fournisseurs(id),
    etat VARCHAR(20) NOT NULL DEFAULT 'Neuf' CHECK (etat IN ('Neuf', 'Comme neuf', 'Occasion')),
    garantie VARCHAR(20) NOT NULL DEFAULT '0' CHECK (garantie IN ('0', '3', '6', '12')),
    image_url TEXT,
    notes TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (statut IN ('Disponible', 'Stock faible', 'Rupture', 'Réservé', 'Archivé')),
    date_ajout TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    derniere_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_composants_pc_categorie ON public.composants_pc(categorie);
CREATE INDEX IF NOT EXISTS idx_composants_pc_statut ON public.composants_pc(statut);
CREATE INDEX IF NOT EXISTS idx_composants_pc_fournisseur ON public.composants_pc(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_composants_pc_code_barre ON public.composants_pc(code_barre);

-- Créer une fonction pour mettre à jour automatiquement le statut basé sur le stock
CREATE OR REPLACE FUNCTION update_composant_pc_statut()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_actuel = 0 THEN
        NEW.statut = 'Rupture';
    ELSIF NEW.stock_actuel <= NEW.stock_minimum THEN
        NEW.statut = 'Stock faible';
    ELSE
        NEW.statut = 'Disponible';
    END IF;
    
    NEW.derniere_modification = NOW();
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la mise à jour automatique du statut
DROP TRIGGER IF EXISTS trigger_update_composant_pc_statut ON public.composants_pc;
CREATE TRIGGER trigger_update_composant_pc_statut
    BEFORE INSERT OR UPDATE ON public.composants_pc
    FOR EACH ROW EXECUTE FUNCTION update_composant_pc_statut();

-- Créer une table pour les mouvements de stock des composants PC
CREATE TABLE IF NOT EXISTS public.mouvements_stock_composants_pc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    composant_pc_id UUID NOT NULL REFERENCES public.composants_pc(id) ON DELETE CASCADE,
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('Entrée', 'Sortie', 'Correction', 'Retour')),
    quantite INTEGER NOT NULL,
    stock_avant INTEGER NOT NULL,
    stock_apres INTEGER NOT NULL,
    prix_unitaire DECIMAL(10,2),
    motif TEXT,
    reference_externe VARCHAR(100),
    utilisateur VARCHAR(255),
    date_mouvement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les mouvements de stock
CREATE INDEX IF NOT EXISTS idx_mouvements_composants_pc_composant ON public.mouvements_stock_composants_pc(composant_pc_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_composants_pc_date ON public.mouvements_stock_composants_pc(date_mouvement);

-- Créer une vue pour les statistiques des composants PC
CREATE OR REPLACE VIEW public.vue_stats_composants_pc AS
SELECT 
    COUNT(*) as total_produits,
    COUNT(CASE WHEN statut = 'Disponible' THEN 1 END) as produits_disponibles,
    COUNT(CASE WHEN statut = 'Rupture' THEN 1 END) as produits_rupture,
    COUNT(CASE WHEN statut = 'Stock faible' THEN 1 END) as produits_stock_faible,
    SUM(stock_actuel) as stock_total,
    SUM(stock_actuel * prix_vente) as valeur_stock_total,
    ROUND(AVG(prix_vente), 2) as prix_moyen
FROM public.composants_pc;

-- Accorder les permissions
GRANT ALL ON public.composants_pc TO anon, authenticated;
GRANT ALL ON public.mouvements_stock_composants_pc TO anon, authenticated;
GRANT SELECT ON public.vue_stats_composants_pc TO anon, authenticated;

-- Désactiver RLS pour simplifier (peut être activé plus tard si nécessaire)
ALTER TABLE public.composants_pc DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mouvements_stock_composants_pc DISABLE ROW LEVEL SECURITY;

-- Insérer quelques données d'exemple pour les tests
INSERT INTO public.composants_pc (nom_produit, categorie, code_barre, stock_actuel, stock_minimum, prix_achat, prix_vente, etat, garantie, notes) VALUES
('Intel Core i7-13700K', 'cpu', 'CPU001', 5, 2, 350.00, 450.00, 'Neuf', '12', 'Processeur haut de gamme 13ème génération'),
('NVIDIA RTX 4080', 'gpu', 'GPU001', 3, 1, 1200.00, 1500.00, 'Neuf', '12', 'Carte graphique gaming haut de gamme'),
('Corsair Vengeance 32GB DDR5', 'ram', 'RAM001', 8, 3, 180.00, 250.00, 'Neuf', '6', 'Mémoire DDR5 6000MHz 32GB Kit'),
('Samsung 990 Pro 2TB', 'disc', 'SSD001', 4, 2, 200.00, 280.00, 'Neuf', '12', 'SSD NVMe PCIe 4.0 2TB'),
('NZXT H7 Elite', 'case', 'CASE001', 2, 1, 120.00, 180.00, 'Neuf', '3', 'Boîtier Gaming RGB moyen tour'),
('ASUS ROG Strix Z790-E', 'mother_board', 'MB001', 3, 1, 280.00, 380.00, 'Neuf', '12', 'Carte mère ATX Socket LGA1700'),
('Corsair RM850x', 'power', 'PSU001', 6, 2, 150.00, 220.00, 'Neuf', '12', 'Alimentation modulaire 850W 80+ Gold'),
('Noctua NH-D15', 'cooling', 'COOL001', 4, 2, 90.00, 120.00, 'Neuf', '6', 'Ventirad CPU dual tower premium');

-- Message de confirmation
SELECT 'Table composants_pc créée avec succès !' as message; 