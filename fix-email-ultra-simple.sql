-- 🔧 CORRECTION ULTRA SIMPLE : Permettre les emails NULL
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Supprimer la contrainte NOT NULL sur l'email
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;

-- 2. Supprimer l'ancienne contrainte d'unicité
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key;

-- 3. Créer une nouvelle contrainte d'unicité
ALTER TABLE clients ADD CONSTRAINT clients_email_key UNIQUE (email);

-- 4. Test simple : insérer un client sans email
INSERT INTO clients (nom, prenom, email, statut) 
VALUES ('Test', 'Sans Email', NULL, 'Actif')
ON CONFLICT DO NOTHING;

-- 5. Vérifier que ça a marché
SELECT COUNT(*) as clients_sans_email 
FROM clients 
WHERE email IS NULL;

-- 6. Message de succès
SELECT 'Correction terminée! Les emails NULL sont maintenant autorisés.' as status; 