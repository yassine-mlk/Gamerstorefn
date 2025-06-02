-- Script pour résoudre le problème "Email not confirmed"
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- 1. Confirmer tous les utilisateurs existants qui ne sont pas confirmés
UPDATE auth.users 
SET 
  email_confirmed_at = NOW()
WHERE 
  email_confirmed_at IS NULL;

-- 2. Créer une fonction pour auto-confirmer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION auto_confirm_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirmer l'email pour tous les nouveaux utilisateurs
  -- Note: confirmed_at est une colonne générée, on ne peut que mettre à jour email_confirmed_at
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS auto_confirm_new_users ON auth.users;

-- 4. Créer le trigger pour auto-confirmer les nouveaux utilisateurs
CREATE TRIGGER auto_confirm_new_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_users();

-- 5. Vérifier le résultat
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
  COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- 6. Vérifier que confirmed_at est automatiquement généré
SELECT 
  email_confirmed_at,
  confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL AND confirmed_at IS NOT NULL THEN 'Confirmé'
    ELSE 'Non confirmé'
  END as status
FROM auth.users 
LIMIT 5;

-- 7. Message de confirmation
SELECT 'Auto-confirmation des emails activée pour tous les utilisateurs' as status; 