-- 🔧 CORRECTION : Permettre les emails NULL pour les clients
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier la contrainte actuelle
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

-- 2. Supprimer la contrainte d'unicité actuelle
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key;

-- 3. Créer une nouvelle contrainte qui permet les emails NULL
-- Cette contrainte ne s'applique que quand l'email n'est pas NULL
ALTER TABLE clients ADD CONSTRAINT clients_email_key UNIQUE (email) WHERE email IS NOT NULL;

-- 4. Vérifier que la nouvelle contrainte est créée
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

-- 5. Nettoyer les emails générés automatiquement (optionnel)
-- Mettre à jour les clients avec des emails générés automatiquement pour les remettre à NULL
UPDATE clients 
SET email = NULL
WHERE email LIKE 'client-%@gamerstore.local';

-- 6. Vérifier le résultat
SELECT 
    id,
    nom,
    prenom,
    email,
    created_at
FROM clients 
ORDER BY created_at DESC
LIMIT 10;

-- 7. Message de confirmation
SELECT 'Contrainte email modifiée pour permettre les valeurs NULL!' as status; 