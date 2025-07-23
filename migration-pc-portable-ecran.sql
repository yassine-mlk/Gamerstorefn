-- Migration pour ajouter les nouveaux champs d'écran et VRAM à la table pc_portables
-- Exécutez ce script dans votre base de données Supabase

-- Ajouter les nouveaux champs pour l'écran
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS taille_ecran VARCHAR(20);
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS resolution_ecran VARCHAR(50);
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS taux_rafraichissement VARCHAR(20);

-- Ajouter le champ VRAM pour la carte graphique
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS vram_carte_graphique VARCHAR(20);

-- Ajouter le champ vitesse RAM
ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS vitesse_ram VARCHAR(20);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_pc_portables_taille_ecran ON pc_portables(taille_ecran);
CREATE INDEX IF NOT EXISTS idx_pc_portables_resolution_ecran ON pc_portables(resolution_ecran);
CREATE INDEX IF NOT EXISTS idx_pc_portables_taux_rafraichissement ON pc_portables(taux_rafraichissement);
CREATE INDEX IF NOT EXISTS idx_pc_portables_vram ON pc_portables(vram_carte_graphique);
CREATE INDEX IF NOT EXISTS idx_pc_portables_vitesse_ram ON pc_portables(vitesse_ram);

-- Ajouter les commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN pc_portables.taille_ecran IS 'Taille de l''écran en pouces (ex: 15.6", 17.3")';
COMMENT ON COLUMN pc_portables.resolution_ecran IS 'Résolution de l''écran (ex: 1920x1080, 2560x1440)';
COMMENT ON COLUMN pc_portables.taux_rafraichissement IS 'Taux de rafraîchissement en Hz (ex: 60Hz, 144Hz, 240Hz)';
COMMENT ON COLUMN pc_portables.vram_carte_graphique IS 'Mémoire vidéo de la carte graphique (ex: 4GB, 8GB, 16GB)';
COMMENT ON COLUMN pc_portables.vitesse_ram IS 'Vitesse de la RAM en MHz (ex: 2400MHz, 3200MHz, 4800MHz)';

-- Mettre à jour les données existantes si nécessaire
-- Vous pouvez exécuter ces requêtes pour migrer les données existantes
-- UPDATE pc_portables SET taille_ecran = '15.6"' WHERE taille_ecran IS NULL AND ecran LIKE '%15.6%';
-- UPDATE pc_portables SET resolution_ecran = '1920x1080' WHERE resolution_ecran IS NULL AND ecran LIKE '%1920%'; 