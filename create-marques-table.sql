-- ===========================================
-- Script de création de la table Marques
-- Gamerstore - Gestion centralisée des marques
-- ===========================================

-- Table des marques pour centraliser et standardiser
CREATE TABLE IF NOT EXISTS marques (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    site_web VARCHAR(255),
    description TEXT,
    pays_origine VARCHAR(100),
    specialite VARCHAR(100), -- Gaming, Business, Créateur, etc.
    statut VARCHAR(20) DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'Archivé')),
    popularite INTEGER DEFAULT 0, -- Score de popularité 1-10
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_marques_nom ON marques(nom);
CREATE INDEX IF NOT EXISTS idx_marques_specialite ON marques(specialite);
CREATE INDEX IF NOT EXISTS idx_marques_statut ON marques(statut);
CREATE INDEX IF NOT EXISTS idx_marques_popularite ON marques(popularite DESC);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE TRIGGER update_marques_updated_at 
    BEFORE UPDATE ON marques 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer toutes les marques de PC portable gamer
INSERT INTO marques (nom, specialite, pays_origine, popularite, description) VALUES
-- Marques principales Gaming
('ASUS', 'Gaming', 'Taiwan', 10, 'Marque leader pour PC gaming avec les gammes ROG (Republic of Gamers)'),
('MSI', 'Gaming', 'Taiwan', 9, 'Spécialiste du gaming avec les séries Gaming, Creator et Workstation'),
('Acer', 'Gaming', 'Taiwan', 8, 'Marque populaire avec la gamme Predator pour gaming'),
('Alienware', 'Gaming', 'USA', 9, 'Marque premium de Dell dédiée au gaming haut de gamme'),
('Razer', 'Gaming', 'Singapour', 8, 'Marque spécialisée gaming avec design distinctif'),
('Gigabyte', 'Gaming', 'Taiwan', 7, 'Marque gaming avec la série AORUS'),

-- Marques traditionnelles avec gammes gaming
('HP', 'Business', 'USA', 9, 'Marque mondiale avec gamme OMEN pour gaming'),
('Dell', 'Business', 'USA', 8, 'Marque business avec gamme gaming G-Series'),
('Lenovo', 'Business', 'Chine', 9, 'Marque internationale avec Legion pour gaming'),

-- Marques premium
('Apple', 'Créateur', 'USA', 10, 'Marque premium pour créateurs et professionnels'),
('Microsoft', 'Créateur', 'USA', 8, 'Surface pour professionnels et créateurs'),

-- Marques gaming spécialisées
('Origin PC', 'Gaming', 'USA', 6, 'PC gaming personnalisés haut de gamme'),
('Clevo', 'Gaming', 'Taiwan', 6, 'ODM pour PC gaming (barebone)'),
('Sager', 'Gaming', 'USA', 5, 'PC gaming basés sur Clevo'),
('XMG', 'Gaming', 'Allemagne', 6, 'Marque européenne de PC gaming'),
('Schenker', 'Gaming', 'Allemagne', 6, 'PC gaming allemands premium'),

-- Marques émergentes gaming
('Eluktronics', 'Gaming', 'USA', 5, 'PC gaming innovants et personnalisables'),
('Maingear', 'Gaming', 'USA', 4, 'PC gaming artisanaux américains'),
('Digital Storm', 'Gaming', 'USA', 4, 'PC gaming haut de gamme personnalisés'),

-- Marques budget-gaming
('Medion', 'Budget', 'Allemagne', 5, 'PC gaming abordables vendus chez Aldi'),
('Cyberpower', 'Budget', 'USA', 5, 'PC gaming bon rapport qualité-prix'),
('iBuyPower', 'Budget', 'USA', 5, 'PC gaming configurables abordables'),

-- Marques internationales avec gaming
('Samsung', 'Business', 'Corée du Sud', 7, 'Marque coréenne avec quelques modèles gaming'),
('LG', 'Business', 'Corée du Sud', 6, 'PC portable avec options gaming'),
('Huawei', 'Business', 'Chine', 6, 'MateBook avec performances gaming'),
('Xiaomi', 'Budget', 'Chine', 6, 'Mi Gaming Laptop - gaming abordable'),

-- Marques spécialisées composants (qui font aussi PC)
('EVGA', 'Gaming', 'USA', 6, 'Marque de composants qui produit aussi des PC'),
('Corsair', 'Gaming', 'USA', 7, 'Périphériques et PC gaming'),
('Thermaltake', 'Gaming', 'Taiwan', 5, 'Boîtiers et PC gaming'),

-- Marques françaises/européennes
('Materiel.net', 'Gaming', 'France', 5, 'PC gaming assemblés en France'),
('LDLC', 'Gaming', 'France', 6, 'PC gaming français haut de gamme'),
('Millenium', 'Gaming', 'France', 4, 'PC gaming pour esport'),

-- Marques workstation gaming
('Eurocom', 'Workstation', 'Canada', 5, 'PC mobiles workstation gaming'),
('Precision', 'Workstation', 'USA', 4, 'PC workstation avec capacités gaming'),

ON CONFLICT (nom) DO NOTHING;

-- Créer une vue pour les marques actives populaires
CREATE OR REPLACE VIEW marques_populaires AS
SELECT nom, specialite, popularite, description
FROM marques 
WHERE statut = 'Actif' 
ORDER BY popularite DESC, nom ASC;

-- Commentaires sur la table
COMMENT ON TABLE marques IS 'Table centralisée des marques pour tous les produits';
COMMENT ON COLUMN marques.popularite IS 'Score de popularité de 1 à 10 (10 = très populaire)';
COMMENT ON COLUMN marques.specialite IS 'Domaine de spécialisation : Gaming, Business, Créateur, Budget, Workstation';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Table marques créée avec succès avec % marques ajoutées', 
        (SELECT COUNT(*) FROM marques);
END $$; 