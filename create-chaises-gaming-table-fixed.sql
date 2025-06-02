-- Script SQL corrigé pour créer la table des chaises gaming
-- Gamerstore - Gestion des chaises gaming

-- Activer l'extension UUID si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer la table si elle existe déjà (pour recréer proprement)
DROP TABLE IF EXISTS public.chaises_gaming CASCADE;

-- Créer la table chaises_gaming avec UUID par défaut
CREATE TABLE public.chaises_gaming (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nom_produit VARCHAR(255) NOT NULL,
  code_barre VARCHAR(100) UNIQUE,
  marque VARCHAR(100) NOT NULL,
  prix_achat DECIMAL(10,2) NOT NULL CHECK (prix_achat >= 0),
  prix_vente DECIMAL(10,2) NOT NULL CHECK (prix_vente >= 0),
  stock_actuel INTEGER NOT NULL DEFAULT 0 CHECK (stock_actuel >= 0),
  stock_minimum INTEGER NOT NULL DEFAULT 1 CHECK (stock_minimum >= 0),
  image_url TEXT,
  fournisseur_id UUID,
  statut VARCHAR(20) DEFAULT 'Disponible' CHECK (statut IN ('Disponible', 'Stock faible', 'Rupture', 'Réservé', 'Archivé')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chaises_gaming_nom_produit ON public.chaises_gaming(nom_produit);
CREATE INDEX IF NOT EXISTS idx_chaises_gaming_marque ON public.chaises_gaming(marque);
CREATE INDEX IF NOT EXISTS idx_chaises_gaming_code_barre ON public.chaises_gaming(code_barre);
CREATE INDEX IF NOT EXISTS idx_chaises_gaming_statut ON public.chaises_gaming(statut);
CREATE INDEX IF NOT EXISTS idx_chaises_gaming_fournisseur ON public.chaises_gaming(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_chaises_gaming_created_at ON public.chaises_gaming(created_at);

-- Activer RLS (Row Level Security)
ALTER TABLE public.chaises_gaming ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Admins can view all chaises gaming" ON public.chaises_gaming;
DROP POLICY IF EXISTS "Users can view chaises gaming" ON public.chaises_gaming;
DROP POLICY IF EXISTS "Admins can insert chaises gaming" ON public.chaises_gaming;
DROP POLICY IF EXISTS "Admins can update chaises gaming" ON public.chaises_gaming;
DROP POLICY IF EXISTS "Admins can delete chaises gaming" ON public.chaises_gaming;

-- Créer les politiques RLS
-- Politique pour que les admins puissent voir toutes les chaises gaming
CREATE POLICY "Admins can view all chaises gaming" ON public.chaises_gaming
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour que tous les utilisateurs authentifiés puissent voir les chaises gaming
CREATE POLICY "Users can view chaises gaming" ON public.chaises_gaming
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour que les admins puissent ajouter des chaises gaming
CREATE POLICY "Admins can insert chaises gaming" ON public.chaises_gaming
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour que les admins puissent modifier les chaises gaming
CREATE POLICY "Admins can update chaises gaming" ON public.chaises_gaming
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour que les admins puissent supprimer les chaises gaming
CREATE POLICY "Admins can delete chaises gaming" ON public.chaises_gaming
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour mettre à jour automatiquement le statut basé sur le stock
CREATE OR REPLACE FUNCTION public.update_chaise_gaming_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le statut automatiquement basé sur le stock
  IF NEW.stock_actuel = 0 THEN
    NEW.statut = 'Rupture';
  ELSIF NEW.stock_actuel <= NEW.stock_minimum THEN
    NEW.statut = 'Stock faible';
  ELSE
    NEW.statut = 'Disponible';
  END IF;
  
  -- Mettre à jour la date de modification
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour mettre à jour automatiquement le statut
DROP TRIGGER IF EXISTS trigger_update_chaise_gaming_status ON public.chaises_gaming;
CREATE TRIGGER trigger_update_chaise_gaming_status
  BEFORE INSERT OR UPDATE ON public.chaises_gaming
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chaise_gaming_status();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at_chaises_gaming()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS handle_updated_at_chaises_gaming ON public.chaises_gaming;
CREATE TRIGGER handle_updated_at_chaises_gaming
  BEFORE UPDATE ON public.chaises_gaming
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at_chaises_gaming();

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.chaises_gaming TO authenticated;
GRANT SELECT ON public.chaises_gaming TO anon;

-- Test de la génération d'UUID
DO $$
BEGIN
  IF uuid_generate_v4() IS NULL THEN
    RAISE EXCEPTION 'UUID generation failed';
  ELSE
    RAISE NOTICE 'UUID generation working correctly: %', uuid_generate_v4();
  END IF;
END $$;

-- Insérer des données de test
INSERT INTO public.chaises_gaming (nom_produit, code_barre, marque, prix_achat, prix_vente, stock_actuel, stock_minimum, image_url) VALUES
('DXRacer Formula Series', 'DXR001', 'DXRacer', 1800.00, 2500.00, 5, 2, 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400'),
('Secretlab Titan Evo', 'SEC002', 'Secretlab', 3200.00, 4200.00, 2, 3, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('Corsair T3 Rush', 'COR003', 'Corsair', 1400.00, 1900.00, 8, 3, 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400')
ON CONFLICT (code_barre) DO NOTHING;

-- Vérifier que les données ont été insérées avec des UUID valides
SELECT 
  id, 
  nom_produit, 
  marque, 
  prix_achat, 
  prix_vente, 
  stock_actuel, 
  statut, 
  created_at,
  CASE 
    WHEN id IS NULL THEN 'ERROR: NULL ID'
    WHEN length(id::text) = 36 THEN 'OK: Valid UUID'
    ELSE 'ERROR: Invalid UUID format'
  END as uuid_status
FROM public.chaises_gaming 
ORDER BY created_at DESC;

-- Afficher la structure de la table
\d public.chaises_gaming;

-- Afficher les politiques
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chaises_gaming';

NOTIFY setup_complete, 'Table chaises_gaming créée avec succès avec UUID!';

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.chaises_gaming IS 'Table pour stocker les informations des chaises gaming';
COMMENT ON COLUMN public.chaises_gaming.id IS 'Identifiant unique UUID de la chaise gaming';
COMMENT ON COLUMN public.chaises_gaming.nom_produit IS 'Nom du produit de la chaise gaming';
COMMENT ON COLUMN public.chaises_gaming.code_barre IS 'Code-barres unique du produit';
COMMENT ON COLUMN public.chaises_gaming.marque IS 'Marque de la chaise gaming';
COMMENT ON COLUMN public.chaises_gaming.prix_achat IS 'Prix d''achat en MAD';
COMMENT ON COLUMN public.chaises_gaming.prix_vente IS 'Prix de vente en MAD';
COMMENT ON COLUMN public.chaises_gaming.stock_actuel IS 'Quantité en stock actuellement';
COMMENT ON COLUMN public.chaises_gaming.stock_minimum IS 'Seuil minimum de stock';
COMMENT ON COLUMN public.chaises_gaming.image_url IS 'URL de l''image du produit';
COMMENT ON COLUMN public.chaises_gaming.fournisseur_id IS 'Référence vers le fournisseur';
COMMENT ON COLUMN public.chaises_gaming.statut IS 'Statut du stock (Disponible, Stock faible, Rupture, etc.)';
COMMENT ON COLUMN public.chaises_gaming.created_at IS 'Date de création de l''enregistrement';
COMMENT ON COLUMN public.chaises_gaming.updated_at IS 'Date de dernière modification'; 