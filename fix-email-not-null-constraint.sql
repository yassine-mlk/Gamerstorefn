-- 🔧 CORRECTION : Supprimer la contrainte NOT NULL sur l'email
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier les contraintes actuelles sur la colonne email
SELECT 
    column_name,
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
    AND column_name = 'email';

-- 2. Vérifier les contraintes NOT NULL
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'clients' 
    AND kcu.column_name = 'email'
    AND tc.constraint_type = 'CHECK';

-- 3. Modifier la colonne email pour permettre les valeurs NULL
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;

-- 4. Vérifier que la modification a été appliquée
SELECT 
    column_name,
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
    AND column_name = 'email';

-- 5. Vérifier la contrainte d'unicité
SELECT 
    constraint_name,
    table_name,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'clients' 
    AND tc.constraint_type = 'UNIQUE'
    AND ccu.column_name = 'email';

-- 6. S'assurer que la contrainte d'unicité permet les NULL
-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key;

-- Créer une nouvelle contrainte d'unicité simple
-- Note: PostgreSQL permet automatiquement plusieurs valeurs NULL dans une contrainte UNIQUE
ALTER TABLE clients ADD CONSTRAINT clients_email_key UNIQUE (email);

-- 7. Test d'insertion avec email NULL (optionnel)
-- INSERT INTO clients (nom, prenom, email, statut) 
-- VALUES ('Test', 'NULL Email', NULL, 'Actif')
-- ON CONFLICT DO NOTHING;

-- 8. Message de confirmation
SELECT 'Contrainte NOT NULL supprimée de la colonne email!' as status; 