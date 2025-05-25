-- ========================================
-- Script pour ajouter des fournisseurs de test
-- ========================================

-- Insérer des fournisseurs de test s'ils n'existent pas déjà
INSERT INTO fournisseurs (nom, contact_principal, email, telephone, adresse, specialite, statut, conditions_paiement, delai_livraison_moyen, notes)
VALUES 
  (
    'TechDistrib Pro',
    'Laurent Moreau',
    'contact@techdistrib.com',
    '+212 522 123 456',
    '15 Zone Industrielle, Casablanca',
    'Composants PC et Portables',
    'Privilégié',
    '30 jours',
    5,
    'Fournisseur principal pour les PC gaming et composants haut de gamme'
  ),
  (
    'Gaming Hardware Wholesale',
    'Sarah Chen',
    'orders@ghw.com',
    '+212 537 987 654',
    '89 Avenue Tech, Rabat',
    'Matériel Gaming',
    'Actif',
    '15 jours',
    3,
    'Spécialisé dans le matériel gaming et accessoires'
  ),
  (
    'Monitor Solutions Europe',
    'Thomas Weber',
    'thomas@monitorsolutions.eu',
    '+212 523 456 789',
    '234 Rue Innovation, Marrakech',
    'Écrans et Moniteurs',
    'Actif',
    '45 jours',
    7,
    'Fournisseur européen spécialisé dans les écrans professionnels'
  ),
  (
    'Apple Distribution Maroc',
    'Fatima Alami',
    'fatima@appledistrib.ma',
    '+212 522 345 678',
    '67 Boulevard Zerktouni, Casablanca',
    'Produits Apple',
    'Privilégié',
    'Comptant',
    2,
    'Distributeur officiel Apple au Maroc'
  ),
  (
    'Dell Partners MEA',
    'Ahmed Bennani',
    'ahmed@dellpartners.com',
    '+212 537 111 222',
    '123 Avenue Hassan II, Rabat',
    'Ordinateurs Dell',
    'Actif',
    '30 jours',
    5,
    'Partenaire Dell pour l''Afrique du Nord'
  ),
  (
    'HP Enterprise Morocco',
    'Laila Kadiri',
    'laila@hp-enterprise.ma',
    '+212 522 777 888',
    '45 Rue de la Liberté, Casablanca',
    'Solutions HP',
    'Actif',
    '60 jours',
    10,
    'Solutions HP pour entreprises et particuliers'
  )
ON CONFLICT (email) DO NOTHING;

-- Afficher les fournisseurs ajoutés
SELECT nom, contact_principal, email, statut, specialite 
FROM fournisseurs 
ORDER BY created_at DESC 
LIMIT 10; 