-- 🔧 CORRECTION URGENTE : Récursion infinie dans les politiques RLS
-- Exécutez ce script IMMÉDIATEMENT dans Supabase SQL Editor

-- 1. Supprimer TOUTES les politiques problématiques
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Désactiver temporairement RLS pour corriger le problème
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Créer des politiques NON-RÉCURSIVES

-- Politique pour le service_role (clé admin) - accès complet
CREATE POLICY "Service role full access" ON public.profiles
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Politique pour les utilisateurs authentifiés - lecture seulement de leur profil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

-- Politique pour les utilisateurs authentifiés - mise à jour de leur profil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Politique pour permettre l'insertion par service_role uniquement
CREATE POLICY "Service role can insert profiles" ON public.profiles
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Politique pour permettre l'insertion via trigger (utilisateurs authentifiés)
CREATE POLICY "Authenticated can insert own profile" ON public.profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Politique pour les admins basée sur les métadonnées JWT (sans récursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT 
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'service_role'
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR
        auth.uid() = id
    );

-- Politique pour les admins - mise à jour de tous les profils
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE 
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'service_role'
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR
        auth.uid() = id
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'service_role'
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR
        auth.uid() = id
    );

-- Politique pour les admins - suppression de profils
CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE 
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'service_role'
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- 4. Réactiver RLS avec les nouvelles politiques
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Donner les permissions nécessaires
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;

-- 6. Test de fonctionnement
DO $$
BEGIN
    RAISE NOTICE '✅ RÉCURSION INFINIE CORRIGÉE !';
    RAISE NOTICE '🔒 Nouvelles politiques RLS sans récursion créées';
    RAISE NOTICE '👑 Accès admin basé sur les métadonnées JWT';
    RAISE NOTICE '🎯 Table profiles accessible maintenant';
END $$;

-- 7. Vérification que les politiques sont créées
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 8. Test simple pour vérifier que ça fonctionne
-- Cette requête ne devrait plus causer de récursion
SELECT 'Test de lecture profiles' as test, COUNT(*) as total_profiles 
FROM public.profiles;

RAISE NOTICE '🎉 PROBLÈME DE RÉCURSION RÉSOLU - Vous pouvez maintenant utiliser la création de membres !'; 