-- 🔧 CORRECTION SIMPLE : Désactiver RLS sur la table clients
-- Exécutez ce script dans Supabase SQL Editor pour résoudre l'erreur 409

-- 1. Désactiver RLS sur la table clients (solution temporaire)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que RLS est désactivé
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clients';

-- 3. Message de confirmation
SELECT 'RLS désactivé sur la table clients avec succès!' as status; 