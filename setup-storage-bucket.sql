-- ========================================
-- Configuration du Storage Bucket pour les images PC Portables
-- ========================================

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pc-portables-images');

-- Politique pour permettre aux utilisateurs authentifiés de voir toutes les images
CREATE POLICY "Allow authenticated users to view images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'pc-portables-images');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs images
CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'pc-portables-images');

-- Politique pour permettre aux utilisateurs authentifiés de supprimer des images
CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'pc-portables-images');

-- Politique pour permettre l'accès public en lecture (pour afficher les images)
CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'pc-portables-images'); 