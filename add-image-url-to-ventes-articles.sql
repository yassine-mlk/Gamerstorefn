-- Script pour ajouter la colonne image_url à la table ventes_articles
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne image_url à la table ventes_articles
ALTER TABLE ventes_articles 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Vérifier que la colonne a été ajoutée
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventes_articles' 
AND column_name = 'image_url';

-- 3. Mettre à jour les politiques RLS si nécessaire
-- (Les politiques existantes devraient déjà couvrir cette nouvelle colonne)

-- 4. Message de confirmation
SELECT 'Colonne image_url ajoutee avec succes a la table ventes_articles' as message; 