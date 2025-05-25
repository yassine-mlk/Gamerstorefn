-- Suppression de la table si elle existe déjà
DROP TABLE IF EXISTS public.peripheriques CASCADE;

-- Création de la table périphériques
CREATE TABLE public.peripheriques (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_produit VARCHAR(255) NOT NULL,
    code_barre VARCHAR(100),
    prix_achat DECIMAL(10, 2) NOT NULL DEFAULT 0,
    prix_vente DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('claviers', 'casque', 'sac_a_dos', 'souris', 'tapis_de_souris', 'stockage', 'webcam')),
    fournisseur_id UUID,
    marque VARCHAR(100),
    modele VARCHAR(100),
    reference VARCHAR(100),
    etat VARCHAR(20) DEFAULT 'Neuf' CHECK (etat IN ('Neuf', 'Comme neuf', 'Occasion')),
    garantie VARCHAR(20) DEFAULT '12 mois',
    stock_actuel INTEGER DEFAULT 0 CHECK (stock_actuel >= 0),
    stock_minimum INTEGER DEFAULT 1 CHECK (stock_minimum >= 0),
    statut VARCHAR(20) DEFAULT 'disponible' CHECK (statut IN ('disponible', 'rupture', 'commande')),
    emplacement VARCHAR(100),
    description TEXT,
    notes TEXT,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Contrainte de clé étrangère pour le fournisseur
    CONSTRAINT fk_peripheriques_fournisseur 
        FOREIGN KEY (fournisseur_id) REFERENCES public.fournisseurs(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_peripheriques_nom_produit ON public.peripheriques(nom_produit);
CREATE INDEX idx_peripheriques_code_barre ON public.peripheriques(code_barre);
CREATE INDEX idx_peripheriques_categorie ON public.peripheriques(categorie);
CREATE INDEX idx_peripheriques_fournisseur_id ON public.peripheriques(fournisseur_id);
CREATE INDEX idx_peripheriques_statut ON public.peripheriques(statut);
CREATE INDEX idx_peripheriques_date_creation ON public.peripheriques(date_creation);

-- Fonction pour mettre à jour automatiquement la date de modification
CREATE OR REPLACE FUNCTION update_peripheriques_modified_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la mise à jour automatique de la date de modification
CREATE TRIGGER update_peripheriques_modtime
    BEFORE UPDATE ON public.peripheriques
    FOR EACH ROW
    EXECUTE FUNCTION update_peripheriques_modified_time();

-- Fonction pour mettre à jour automatiquement le statut en fonction du stock
CREATE OR REPLACE FUNCTION update_peripheriques_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour du statut basé sur le stock
    IF NEW.stock_actuel = 0 THEN
        NEW.statut = 'rupture';
    ELSIF NEW.stock_actuel <= NEW.stock_minimum THEN
        NEW.statut = 'commande';
    ELSE
        NEW.statut = 'disponible';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la mise à jour automatique du statut
CREATE TRIGGER update_peripheriques_status_trigger
    BEFORE INSERT OR UPDATE OF stock_actuel, stock_minimum ON public.peripheriques
    FOR EACH ROW
    EXECUTE FUNCTION update_peripheriques_status();

-- Activation RLS (Row Level Security)
ALTER TABLE public.peripheriques ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Permettre lecture peripheriques" ON public.peripheriques
    FOR SELECT
    TO authenticated
    USING (true);

-- Politique pour permettre l'insertion aux utilisateurs authentifiés
CREATE POLICY "Permettre insertion peripheriques" ON public.peripheriques
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Permettre mise à jour peripheriques" ON public.peripheriques
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Permettre suppression peripheriques" ON public.peripheriques
    FOR DELETE
    TO authenticated
    USING (true);

-- Insertion de quelques données de test
INSERT INTO public.peripheriques (
    nom_produit, 
    code_barre, 
    prix_achat, 
    prix_vente, 
    categorie, 
    marque, 
    modele, 
    stock_actuel, 
    stock_minimum,
    description
) VALUES 
('Clavier Gaming RGB Corsair K95', '123456789012', 85.00, 129.99, 'claviers', 'Corsair', 'K95 RGB Platinum', 15, 3, 'Clavier mécanique gaming avec rétroéclairage RGB'),
('Souris Gaming Logitech G502', '123456789013', 45.00, 79.99, 'souris', 'Logitech', 'G502 HERO', 25, 5, 'Souris gaming haute précision'),
('Casque Gaming SteelSeries Arctis 7', '123456789014', 95.00, 159.99, 'casque', 'SteelSeries', 'Arctis 7', 12, 2, 'Casque gaming sans fil 7.1'),
('Tapis de souris XXL', '123456789015', 12.00, 24.99, 'tapis_de_souris', 'Generic', 'XXL Gaming', 30, 10, 'Tapis de souris gaming grande taille'),
('Sac à dos Gaming ASUS ROG', '123456789016', 55.00, 89.99, 'sac_a_dos', 'ASUS', 'ROG Backpack', 8, 2, 'Sac à dos pour ordinateur portable gaming'),
('SSD Samsung 1TB', '123456789017', 75.00, 119.99, 'stockage', 'Samsung', '980 EVO', 20, 5, 'SSD NVMe M.2 1TB'),
('Webcam Logitech C920', '123456789018', 55.00, 89.99, 'webcam', 'Logitech', 'C920 HD Pro', 10, 3, 'Webcam Full HD 1080p');

-- Affichage du résumé
SELECT 
    'Périphériques' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT categorie) as categories_count,
    COUNT(DISTINCT marque) as marques_count
FROM public.peripheriques; 