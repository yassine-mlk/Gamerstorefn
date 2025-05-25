-- Étape 1 : Vérifier l'utilisateur existant
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'omar@gamerstore.com'; 