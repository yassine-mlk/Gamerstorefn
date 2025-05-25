-- Script SQL pour rendre un utilisateur admin
-- Remplacez 'USER_EMAIL_HERE' par l'email de l'utilisateur

-- 1. Vérifier l'utilisateur existant
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'USER_EMAIL_HERE';

-- 2. Mettre à jour les métadonnées pour rendre l'utilisateur admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{role}',
    '"admin"'
)
WHERE email = 'USER_EMAIL_HERE';

-- 3. Optionnel : Ajouter/mettre à jour le nom si nécessaire
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{name}',
    '"Nom Admin"'
)
WHERE email = 'USER_EMAIL_HERE';

-- 4. Vérifier que les changements ont été appliqués
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'USER_EMAIL_HERE'; 