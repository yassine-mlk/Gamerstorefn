-- Script pour insérer des ventes de test de type "commande (livraison)"
-- Exécuter ce script APRÈS avoir créé les tables de livraisons

-- Insérer quelques ventes de type commande (livraison) de test
INSERT INTO ventes (
    client_nom,
    client_email,
    client_telephone,
    vendeur_nom,
    sous_total,
    tva,
    total_ht,
    total_ttc,
    mode_paiement,
    type_vente,
    statut,
    adresse_livraison,
    notes
) VALUES 
(
    'Ahmed Benali',
    'ahmed.benali@email.com',
    '+212-612-345-678',
    'Équipe Livraison',
    2500.00,
    500.00,
    2500.00,
    3000.00,
    'carte',
    'commande (livraison)',
    'payee',
    '45 Rue Hassan II, Quartier Maarif, Casablanca 20000',
    'Commande avec livraison - PC Gaming'
),
(
    'Fatima Zahra',
    'fatima.zahra@gmail.com',
    '+212-661-234-567',
    'Équipe Livraison',
    1800.00,
    360.00,
    1800.00,
    2160.00,
    'virement',
    'commande (livraison)',
    'payee',
    '12 Avenue Mohammed V, Rabat 10000',
    'Commande avec livraison - Setup bureau'
),
(
    'Omar Slimani',
    'omar.slimani@hotmail.com',
    '+212-622-987-654',
    'Équipe Livraison',
    1200.00,
    240.00,
    1200.00,
    1440.00,
    'carte',
    'commande (livraison)',
    'payee',
    '78 Boulevard Zerktouni, Marrakech 40000',
    'Commande avec livraison - Moniteur + clavier'
),
(
    'Aicha Bennani',
    'aicha.bennani@yahoo.fr',
    '+212-655-111-222',
    'Équipe Livraison',
    3500.00,
    700.00,
    3500.00,
    4200.00,
    'carte',
    'commande (livraison)',
    'en_cours',
    '23 Rue de la Liberté, Agadir 80000',
    'Commande avec livraison - PC Portable gaming'
),
(
    'Youssef Tazi',
    'youssef.tazi@gmail.com',
    '+212-677-333-444',
    'Équipe Livraison',
    900.00,
    180.00,
    900.00,
    1080.00,
    'carte',
    'commande (livraison)',
    'payee',
    '56 Avenue Hassan II, Fès 30000',
    'Commande avec livraison - Périphériques gaming'
);

-- Insérer des articles pour les ventes (exemples)
-- Pour la première vente (PC Gaming)
INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'pc_gamer_001',
    'pc_gamer',
    'PC Gaming RTX 4070 - AMD Ryzen 7',
    2000.00,
    2400.00,
    1,
    2000.00,
    2400.00
FROM ventes v 
WHERE v.client_nom = 'Ahmed Benali' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'souris_001',
    'peripherique',
    'Souris Gaming RGB',
    83.33,
    100.00,
    1,
    83.33,
    100.00
FROM ventes v 
WHERE v.client_nom = 'Ahmed Benali' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

-- Pour la deuxième vente (Setup bureau)
INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'moniteur_001',
    'moniteur',
    'Moniteur 27" 1440p IPS',
    1000.00,
    1200.00,
    1,
    1000.00,
    1200.00
FROM ventes v 
WHERE v.client_nom = 'Fatima Zahra' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'clavier_001',
    'peripherique',
    'Clavier mécanique RGB',
    400.00,
    480.00,
    1,
    400.00,
    480.00
FROM ventes v 
WHERE v.client_nom = 'Fatima Zahra' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'casque_001',
    'peripherique',
    'Casque Gaming 7.1',
    400.00,
    480.00,
    1,
    400.00,
    480.00
FROM ventes v 
WHERE v.client_nom = 'Fatima Zahra' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

-- Pour la troisième vente (Moniteur + clavier)
INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'moniteur_002',
    'moniteur',
    'Moniteur 24" 1080p Gaming 144Hz',
    833.33,
    1000.00,
    1,
    833.33,
    1000.00
FROM ventes v 
WHERE v.client_nom = 'Omar Slimani' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'clavier_002',
    'peripherique',
    'Clavier Gaming Compact',
    366.67,
    440.00,
    1,
    366.67,
    440.00
FROM ventes v 
WHERE v.client_nom = 'Omar Slimani' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

-- Pour la quatrième vente (PC Portable gaming)
INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'pc_portable_001',
    'pc_portable',
    'PC Portable Gaming RTX 4060 17"',
    2916.67,
    3500.00,
    1,
    2916.67,
    3500.00
FROM ventes v 
WHERE v.client_nom = 'Aicha Bennani' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'refroidisseur_001',
    'peripherique',
    'Refroidisseur pour PC Portable',
    583.33,
    700.00,
    1,
    583.33,
    700.00
FROM ventes v 
WHERE v.client_nom = 'Aicha Bennani' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

-- Pour la cinquième vente (Périphériques gaming)
INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'souris_002',
    'peripherique',
    'Souris Gaming Pro',
    250.00,
    300.00,
    1,
    250.00,
    300.00
FROM ventes v 
WHERE v.client_nom = 'Youssef Tazi' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'tapis_001',
    'peripherique',
    'Tapis de souris XXL Gaming',
    166.67,
    200.00,
    1,
    166.67,
    200.00
FROM ventes v 
WHERE v.client_nom = 'Youssef Tazi' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

INSERT INTO ventes_articles (
    vente_id,
    produit_id,
    produit_type,
    nom_produit,
    prix_unitaire_ht,
    prix_unitaire_ttc,
    quantite,
    total_ht,
    total_ttc
) 
SELECT 
    v.id,
    'microphone_001',
    'peripherique',
    'Microphone Gaming USB',
    483.33,
    580.00,
    1,
    483.33,
    580.00
FROM ventes v 
WHERE v.client_nom = 'Youssef Tazi' AND v.type_vente = 'commande (livraison)'
LIMIT 1;

-- Afficher les ventes créées
SELECT 
    v.numero_vente,
    v.client_nom,
    v.type_vente,
    v.total_ttc,
    v.adresse_livraison,
    COUNT(va.id) as nb_articles
FROM ventes v
LEFT JOIN ventes_articles va ON v.id = va.vente_id
WHERE v.type_vente = 'commande (livraison)'
GROUP BY v.id, v.numero_vente, v.client_nom, v.type_vente, v.total_ttc, v.adresse_livraison
ORDER BY v.created_at DESC;

-- Note: Les livraisons seront créées automatiquement par le trigger
-- Vérifier les livraisons créées après exécution de ce script
SELECT 
    l.numero_livraison,
    l.client_nom,
    l.ville,
    l.statut,
    l.total_articles,
    l.valeur_totale
FROM livraisons l
ORDER BY l.created_at DESC; 