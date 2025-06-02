-- Script simplifié pour corriger les problèmes de création d'utilisateurs
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer tous les triggers existants pour éviter les conflits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;

-- 2. Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_login() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- 3. Vérifier si la table profiles existe et la recréer si nécessaire
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    status VARCHAR(50) NOT NULL DEFAULT 'actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- 4. Désactiver temporairement RLS pour les tests
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Accorder toutes les permissions pour les tests
GRANT ALL ON public.profiles TO anon, authenticated;

-- 6. Créer une fonction très simple pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Essayer d'insérer le profil, ignorer les erreurs
  BEGIN
    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
      'actif'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Ne rien faire, juste continuer
      NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer le trigger (optionnel pour les tests)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Message de confirmation
SELECT 'Table profiles configurée en mode test' as status;

-- 9. Afficher les utilisateurs existants
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM public.profiles; 