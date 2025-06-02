-- Script de débogage pour vérifier les clients
-- Exécuter dans Supabase SQL Editor

-- 1. Vérifier la table clients existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'clients';

-- 2. Vérifier la structure de la table clients
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- 3. Compter le nombre de clients
SELECT COUNT(*) as total_clients FROM clients;

-- 4. Afficher quelques clients (si ils existent)
SELECT 
    id,
    prenom,
    nom,
    email,
    statut,
    created_at
FROM clients 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Vérifier les politiques RLS sur la table clients
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'clients';

-- 6. Vérifier si RLS est activé
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clients';

-- Message de diagnostic
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM clients) THEN 'Des clients existent dans la base'
        ELSE 'Aucun client trouvé - ajoutez des clients via la page Clients'
    END as diagnostic; 