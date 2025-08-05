-- 🔧 CORRECTION URGENTE : Politiques RLS pour la table clients
-- Exécutez ce script dans Supabase SQL Editor pour résoudre l'erreur 409

-- 1. Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Permettre toutes les opérations pour les utilisateurs authentifiés" ON clients;

-- 2. Désactiver temporairement RLS pour corriger le problème
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 3. Réactiver RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques NON-RÉCURSIVES et plus permissives

-- Politique pour le service_role (clé admin) - accès complet
CREATE POLICY "Service role full access clients" ON clients
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Politique pour les utilisateurs authentifiés - accès complet
CREATE POLICY "Authenticated users full access clients" ON clients
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique pour les utilisateurs anonymes - lecture seulement
CREATE POLICY "Anonymous users can read clients" ON clients
    FOR SELECT 
    TO anon
    USING (true);

-- Politique pour permettre l'insertion par service_role
CREATE POLICY "Service role can insert clients" ON clients
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Politique pour permettre l'insertion par utilisateurs authentifiés
CREATE POLICY "Authenticated can insert clients" ON clients
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Politique pour permettre la mise à jour par service_role
CREATE POLICY "Service role can update clients" ON clients
    FOR UPDATE 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la mise à jour par utilisateurs authentifiés
CREATE POLICY "Authenticated can update clients" ON clients
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la suppression par service_role
CREATE POLICY "Service role can delete clients" ON clients
    FOR DELETE 
    TO service_role
    USING (true);

-- Politique pour permettre la suppression par utilisateurs authentifiés
CREATE POLICY "Authenticated can delete clients" ON clients
    FOR DELETE 
    TO authenticated
    USING (true);

-- 5. Vérifier que les politiques sont créées
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

-- 6. Message de confirmation
SELECT 'Politiques RLS pour la table clients mises à jour avec succès!' as status; 