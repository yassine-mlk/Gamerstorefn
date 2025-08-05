-- 🔧 CORRECTION SIMPLE : Permettre les emails NULL pour les clients
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier l'état actuel de la colonne email
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'clients' 
    AND column_name = 'email';

-- 2. Supprimer la contrainte NOT NULL sur l'email
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;

-- 3. Supprimer l'ancienne contrainte d'unicité si elle existe
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key;

-- 4. Créer une nouvelle contrainte d'unicité simple
-- PostgreSQL permet automatiquement plusieurs valeurs NULL dans une contrainte UNIQUE
ALTER TABLE clients ADD CONSTRAINT clients_email_key UNIQUE (email);

-- 5. Vérifier que la modification a été appliquée
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'clients' 
    AND column_name = 'email';

-- 6. Vérifier la contrainte d'unicité
SELECT 
    tc.constraint_name,
    tc.table_name,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'clients' 
    AND tc.constraint_type = 'UNIQUE'
    AND ccu.column_name = 'email';

-- 7. Test d'insertion avec email NULL
INSERT INTO clients (nom, prenom, email, statut) 
VALUES ('Test', 'Sans Email', NULL, 'Actif')
ON CONFLICT DO NOTHING;

-- 8. Vérifier que le test a fonctionné
SELECT 
    id,
    nom,
    prenom,
    email,
    created_at
FROM clients 
WHERE nom = 'Test' AND prenom = 'Sans Email'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Nettoyer le test (optionnel)
-- DELETE FROM clients WHERE nom = 'Test' AND prenom = 'Sans Email';

-- 10. Message de confirmation
SELECT 'Correction terminée! Les emails NULL sont maintenant autorisés.' as status; 