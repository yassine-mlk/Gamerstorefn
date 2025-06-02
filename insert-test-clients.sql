-- Script pour insérer des clients de test
-- Exécuter dans Supabase SQL Editor

-- Insérer des clients de test (seulement s'il n'y en a pas déjà)
INSERT INTO clients (nom, prenom, email, telephone, adresse, statut, notes, date_inscription, total_achats)
SELECT * FROM (
  VALUES 
    ('Benali', 'Ahmed', 'ahmed.benali@email.com', '0612345678', '123 Rue Mohammed V, Casablanca', 'Actif', 'Client régulier', NOW(), 2500.00),
    ('El Alami', 'Fatima', 'fatima.elalami@email.com', '0623456789', '456 Avenue Hassan II, Rabat', 'VIP', 'Cliente premium', NOW(), 8500.50),
    ('Tazi', 'Omar', 'omar.tazi@email.com', '0634567890', '789 Boulevard Zerktouni, Marrakech', 'Actif', 'Passionné de gaming', NOW(), 3200.75),
    ('Amrani', 'Khadija', 'khadija.amrani@email.com', '0645678901', '321 Rue Allal Ben Abdellah, Fès', 'Actif', 'Nouvelle cliente', NOW(), 450.00),
    ('Zerouali', 'Youssef', 'youssef.zerouali@email.com', '0656789012', '654 Avenue des FAR, Tanger', 'Actif', 'Client entreprise', NOW(), 12000.00)
) AS new_clients(nom, prenom, email, telephone, adresse, statut, notes, date_inscription, total_achats)
WHERE NOT EXISTS (
  SELECT 1 FROM clients WHERE email = new_clients.email
);

-- Vérifier les clients insérés
SELECT 
    COUNT(*) as total_clients_apres_insertion,
    'Clients de test ajoutés avec succès!' as message
FROM clients;

-- Afficher tous les clients
SELECT 
    id,
    prenom,
    nom,
    email,
    statut,
    total_achats,
    created_at
FROM clients 
ORDER BY created_at DESC; 