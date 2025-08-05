-- 🔧 CORRECTION COMPLÈTE : Politiques RLS pour la table clients
-- Exécutez ce script dans Supabase SQL Editor pour résoudre définitivement l'erreur 409

-- 1. Vérifier l'état actuel de RLS
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clients';

-- 2. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Permettre toutes les opérations pour les utilisateurs authentifiés" ON clients;
DROP POLICY IF EXISTS "Service role full access clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users full access clients" ON clients;
DROP POLICY IF EXISTS "Anonymous users can read clients" ON clients;
DROP POLICY IF EXISTS "Service role can insert clients" ON clients;
DROP POLICY IF EXISTS "Authenticated can insert clients" ON clients;
DROP POLICY IF EXISTS "Service role can update clients" ON clients;
DROP POLICY IF EXISTS "Authenticated can update clients" ON clients;
DROP POLICY IF EXISTS "Service role can delete clients" ON clients;
DROP POLICY IF EXISTS "Authenticated can delete clients" ON clients;

-- 3. Désactiver RLS temporairement
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 4. Réactiver RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques simples et permissives

-- Politique pour permettre TOUT aux utilisateurs authentifiés
CREATE POLICY "enable_all_for_authenticated_users" ON clients
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre TOUT au service_role
CREATE POLICY "enable_all_for_service_role" ON clients
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la lecture aux utilisateurs anonymes
CREATE POLICY "enable_select_for_anon" ON clients
    FOR SELECT 
    TO anon
    USING (true);

-- 6. Vérifier que les politiques sont créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'clients'
ORDER BY policyname;

-- 7. Vérifier que RLS est activé
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clients';

-- 8. Test d'insertion (optionnel - à commenter si nécessaire)
-- INSERT INTO clients (nom, prenom, email, statut) 
-- VALUES ('Test', 'RLS', 'test-rls@example.com', 'Actif')
-- ON CONFLICT (email) DO NOTHING;

-- 9. Message de confirmation
SELECT 'Politiques RLS pour la table clients mises à jour avec succès!' as status; 