-- Script simplifié pour résoudre "Email not confirmed"
-- Version corrigée qui évite les problèmes avec les colonnes générées

-- 1. Confirmer tous les utilisateurs existants (seulement email_confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Vérifier le résultat
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as users_with_confirmed_email
FROM auth.users;

-- 3. Créer une fonction simple pour auto-confirmer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Seulement mettre à jour email_confirmed_at (confirmed_at est généré automatiquement)
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS auto_confirm_new_users ON auth.users;

-- 5. Créer le nouveau trigger
CREATE TRIGGER auto_confirm_new_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_email();

-- 6. Test : vérifier quelques utilisateurs
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- 7. Message de confirmation
SELECT 'Script exécuté avec succès - Auto-confirmation activée' as result; 