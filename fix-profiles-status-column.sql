-- Script pour ajouter la colonne status manquante à la table profiles
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Ajouter la colonne status si elle n'existe pas
DO $$ 
BEGIN
  -- Ajouter la colonne status si elle n'existe pas
  BEGIN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'actif';
    RAISE NOTICE 'Colonne status ajoutée avec succès';
  EXCEPTION
    WHEN duplicate_column THEN
      -- La colonne existe déjà, ne rien faire
      RAISE NOTICE 'La colonne status existe déjà';
  END;
END $$;

-- Ajouter la contrainte de vérification pour la colonne status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
  CHECK (status IN ('actif', 'inactif'));

-- Mettre à jour les enregistrements existants qui n'ont pas de statut
UPDATE public.profiles SET status = 'actif' WHERE status IS NULL;

-- Créer un index pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Message de confirmation
SELECT 'Colonne status ajoutée avec succès à la table profiles!' as message; 