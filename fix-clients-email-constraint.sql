-- 🔧 CORRECTION : Problème de contrainte d'unicité sur l'email
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier les clients avec des emails vides ou NULL
SELECT 
    id,
    nom,
    prenom,
    email,
    created_at
FROM clients 
WHERE email IS NULL OR email = '' OR email = '()'
ORDER BY created_at DESC;

-- 2. Supprimer les clients avec des emails vides (optionnel - à commenter si vous voulez les garder)
-- DELETE FROM clients WHERE email IS NULL OR email = '' OR email = '()';

-- 3. Mettre à jour les clients avec des emails vides en leur donnant un email unique
UPDATE clients 
SET email = CONCAT('client-', id, '@gamerstore.local')
WHERE email IS NULL OR email = '' OR email = '()';

-- 4. Vérifier que tous les clients ont maintenant un email valide
SELECT 
    id,
    nom,
    prenom,
    email,
    created_at
FROM clients 
WHERE email IS NULL OR email = '' OR email = '()'
ORDER BY created_at DESC;

-- 5. Vérifier la contrainte d'unicité actuelle
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

-- 6. Optionnel : Modifier la contrainte pour permettre les emails NULL
-- ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key;
-- ALTER TABLE clients ADD CONSTRAINT clients_email_key UNIQUE (email) WHERE email IS NOT NULL;

-- 7. Message de confirmation
SELECT 'Correction des emails clients terminée!' as status; 