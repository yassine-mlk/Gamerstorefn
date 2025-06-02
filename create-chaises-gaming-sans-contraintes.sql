-- Script SQL pour créer la table des chaises gaming SANS CONTRAINTES
-- Solution ultra-simple pour éviter tous les problèmes
-- Gamerstore - Gestion des chaises gaming

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS public.chaises_gaming CASCADE;

-- Créer la table chaises_gaming SANS CONTRAINTES
CREATE TABLE public.chaises_gaming (
  id TEXT PRIMARY KEY,
  nom_produit TEXT,
  code_barre TEXT,
  marque TEXT,
  prix_achat DECIMAL(10,2),
  prix_vente DECIMAL(10,2),
  stock_actuel INTEGER DEFAULT 0,
  stock_minimum INTEGER DEFAULT 1,
  image_url TEXT,
  fournisseur_id TEXT,
  statut TEXT DEFAULT 'Disponible',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index simples pour les performances
CREATE INDEX idx_chaises_gaming_nom ON public.chaises_gaming(nom_produit);
CREATE INDEX idx_chaises_gaming_marque ON public.chaises_gaming(marque);
CREATE INDEX idx_chaises_gaming_statut ON public.chaises_gaming(statut);

-- DÉSACTIVER RLS pour éviter les problèmes de permissions
ALTER TABLE public.chaises_gaming DISABLE ROW LEVEL SECURITY;

-- Accorder TOUTES les permissions à tous les utilisateurs
GRANT ALL ON public.chaises_gaming TO anon;
GRANT ALL ON public.chaises_gaming TO authenticated;
GRANT ALL ON public.chaises_gaming TO public;

-- Fonction simple pour mettre à jour le statut
CREATE OR REPLACE FUNCTION public.update_chaise_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le statut basé sur le stock
  IF NEW.stock_actuel = 0 THEN
    NEW.statut = 'Rupture';
  ELSIF NEW.stock_actuel <= NEW.stock_minimum THEN
    NEW.statut = 'Stock faible';
  ELSE
    NEW.statut = 'Disponible';
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_chaise_status ON public.chaises_gaming;
CREATE TRIGGER trigger_update_chaise_status
  BEFORE INSERT OR UPDATE ON public.chaises_gaming
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chaise_status();

-- Insérer des données de test avec des ID simples
INSERT INTO public.chaises_gaming (id, nom_produit, code_barre, marque, prix_achat, prix_vente, stock_actuel, stock_minimum, image_url) VALUES
('chaise-001', 'DXRacer Formula Series', 'DXR001', 'DXRacer', 1800.00, 2500.00, 5, 2, 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400'),
('chaise-002', 'Secretlab Titan Evo', 'SEC002', 'Secretlab', 3200.00, 4200.00, 2, 3, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('chaise-003', 'Corsair T3 Rush', 'COR003', 'Corsair', 1400.00, 1900.00, 8, 3, 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400');

-- Vérifier les données insérées
SELECT 
  id, 
  nom_produit, 
  marque, 
  prix_achat, 
  prix_vente, 
  stock_actuel, 
  statut, 
  created_at
FROM public.chaises_gaming 
ORDER BY created_at DESC;

-- Message de confirmation
SELECT 'Table chaises_gaming créée SANS CONTRAINTES - Prête à utiliser!' as status;

-- Commentaires
COMMENT ON TABLE public.chaises_gaming IS 'Table des chaises gaming sans contraintes pour éviter les erreurs';
COMMENT ON COLUMN public.chaises_gaming.id IS 'Identifiant unique (TEXT simple)';
COMMENT ON COLUMN public.chaises_gaming.nom_produit IS 'Nom du produit';
COMMENT ON COLUMN public.chaises_gaming.marque IS 'Marque de la chaise';
COMMENT ON COLUMN public.chaises_gaming.prix_achat IS 'Prix d''achat en MAD';
COMMENT ON COLUMN public.chaises_gaming.prix_vente IS 'Prix de vente en MAD';
COMMENT ON COLUMN public.chaises_gaming.stock_actuel IS 'Stock actuel';
COMMENT ON COLUMN public.chaises_gaming.stock_minimum IS 'Stock minimum';
COMMENT ON COLUMN public.chaises_gaming.statut IS 'Statut du stock';
COMMENT ON COLUMN public.chaises_gaming.created_at IS 'Date de création';
COMMENT ON COLUMN public.chaises_gaming.updated_at IS 'Date de modification'; 