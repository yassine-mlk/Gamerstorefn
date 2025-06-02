-- ===========================================
-- Script d'insertion de clients de test avec types et ICE
-- ===========================================

-- IMPORTANT: Exécuter d'abord add-client-type-and-ice.sql
-- avant d'exécuter ce script de données de test

-- Insérer des clients particuliers
INSERT INTO clients (
    nom, prenom, email, telephone, adresse, statut, 
    type_client, total_achats, notes
) VALUES 
(
    'Benali', 'Ahmed', 'ahmed.benali@gmail.com', '+212-612-345-678',
    '45 Rue Hassan II, Quartier Maarif, Casablanca 20000',
    'VIP', 'particulier', 15420.00,
    'Client VIP - Gamer passionné, achète régulièrement du matériel high-end'
),
(
    'Zahra', 'Fatima', 'fatima.zahra@hotmail.com', '+212-661-234-567',
    '12 Avenue Mohammed V, Rabat 10000',
    'Actif', 'particulier', 8750.00,
    'Étudiante en informatique, préfère les produits gaming abordables'
),
(
    'Slimani', 'Omar', 'omar.slimani@yahoo.fr', '+212-622-987-654',
    '78 Boulevard Zerktouni, Marrakech 40000',
    'Actif', 'particulier', 3200.00,
    'Développeur web, intéressé par les moniteurs et périphériques'
);

-- Insérer des sociétés avec numéros ICE
INSERT INTO clients (
    nom, prenom, email, telephone, adresse, statut, 
    type_client, ice, total_achats, notes
) VALUES 
(
    'TechSolutions SARL', 'Hassan Benchekroun', 'h.benchekroun@techsolutions.ma', '+212-522-456-789',
    'Zone Industrielle Sidi Bernoussi, Casablanca 20000',
    'VIP', 'societe', '001234567000045', 45600.00,
    'Société IT - Commandes groupées pour équiper les bureaux'
),
(
    'Gaming Center Rabat', 'Youssef Alami', 'direction@gamingcenter-rabat.ma', '+212-537-123-456',
    '25 Avenue Allal Ben Abdellah, Agdal, Rabat 10090',
    'VIP', 'societe', '001567890000067', 78950.00,
    'Centre de gaming - Achats de PC gaming et périphériques professionnels'
),
(
    'Institut Al Akhawayn IT', 'Dr. Amina Benjelloun', 'a.benjelloun@aui.ma', '+212-535-862-000',
    'Avenue Hassan II, BP 104, Ifrane 53000',
    'Actif', 'societe', '001987654000023', 25400.00,
    'Institution éducative - Matériel informatique pour laboratoires'
),
(
    'StartupTech Innovation', 'Mehdi Fassi', 'contact@startuptech.ma', '+212-524-789-123',
    '34 Rue de la Liberté, Gueliz, Marrakech 40000',
    'Actif', 'societe', '002145678000089', 12800.00,
    'Startup tech - Équipement bureaux et développement'
),
(
    'Cyber Café Al Houda', 'Rachid Nejjar', 'cybercafe.alhouda@gmail.com', '+212-528-456-789',
    '156 Avenue Hassan II, Agadir 80000',
    'Actif', 'societe', '003456789000012', 18750.00,
    'Cyber café - Renouvellement parc informatique'
);

-- Vérifier les insertions
SELECT 
    nom,
    prenom,
    type_client,
    ice,
    statut,
    total_achats,
    CASE 
        WHEN type_client = 'societe' THEN 'Société'
        ELSE 'Particulier'
    END as type_affichage
FROM clients 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY type_client, total_achats DESC;

-- Statistiques par type de client
SELECT 
    type_client,
    COUNT(*) as nombre_clients,
    SUM(total_achats) as total_chiffre_affaires,
    AVG(total_achats) as moyenne_achats,
    MAX(total_achats) as plus_gros_client
FROM clients 
GROUP BY type_client
ORDER BY type_client;

-- Afficher les sociétés avec leur ICE
SELECT 
    nom as societe,
    prenom as contact_principal,
    ice,
    total_achats,
    statut
FROM clients 
WHERE type_client = 'societe'
ORDER BY total_achats DESC; 