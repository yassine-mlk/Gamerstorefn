-- Script pour corriger la table ventes et rendre vendeur_id optionnel
-- Exécuter ce script dans Supabase SQL Editor

-- 1. Modifier la contrainte de clé étrangère vendeur_id pour qu'elle soit optionnelle
ALTER TABLE ventes ALTER COLUMN vendeur_id DROP NOT NULL;

-- 2. Créer une fonction pour créer automatiquement un profil si nécessaire
CREATE OR REPLACE FUNCTION create_profile_if_not_exists(user_id UUID, user_email TEXT, user_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- Vérifier si le profil existe
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
    
    -- Si le profil n'existe pas, le créer
    IF NOT profile_exists THEN
        INSERT INTO profiles (id, email, name, role, status)
        VALUES (user_id, user_email, COALESCE(user_name, user_email, 'Utilisateur'), 'member', 'actif')
        ON CONFLICT (id) DO NOTHING;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer une fonction trigger pour vérifier/créer le profil lors de l'insertion de ventes
CREATE OR REPLACE FUNCTION ensure_vendeur_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Si vendeur_id est fourni, s'assurer que le profil existe
    IF NEW.vendeur_id IS NOT NULL THEN
        PERFORM create_profile_if_not_exists(
            NEW.vendeur_id, 
            COALESCE(NEW.vendeur_nom, 'Utilisateur'), 
            COALESCE(NEW.vendeur_nom, 'Utilisateur')
        );
    END IF;
    
    -- Si created_by est fourni, s'assurer que le profil existe
    IF NEW.created_by IS NOT NULL THEN
        PERFORM create_profile_if_not_exists(
            NEW.created_by, 
            COALESCE(NEW.vendeur_nom, 'Utilisateur'), 
            COALESCE(NEW.vendeur_nom, 'Utilisateur')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger
DROP TRIGGER IF EXISTS trigger_ensure_vendeur_profile ON ventes;
CREATE TRIGGER trigger_ensure_vendeur_profile
    BEFORE INSERT OR UPDATE ON ventes
    FOR EACH ROW
    EXECUTE FUNCTION ensure_vendeur_profile();

-- 5. Mettre à jour les ventes existantes qui pourraient avoir des vendeur_id invalides
UPDATE ventes 
SET vendeur_id = NULL 
WHERE vendeur_id IS NOT NULL 
AND vendeur_id NOT IN (SELECT id FROM profiles);

-- 6. Afficher un message de confirmation
SELECT 'Table ventes mise à jour avec succès. Les contraintes vendeur_id sont maintenant optionnelles.' as message; 