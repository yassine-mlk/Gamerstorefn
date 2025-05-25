# 💳 Gestion des Comptes Bancaires - Gamerstore

## 📋 Vue d'ensemble

Cette fonctionnalité ajoute un système complet de gestion des comptes bancaires de l'entreprise dans l'application Gamerstore. Elle permet de distinguer clairement la **caisse physique** (espèces) des **comptes bancaires** (virements, cartes, etc.).

## 🏦 Fonctionnalités principales

### 1. Gestion des Comptes Bancaires (Paramètres)

- **Ajout de comptes bancaires** avec les informations suivantes :
  - Nom du compte (obligatoire)
  - Nom de la banque (obligatoire)
  - Solde initial (obligatoire)
  - Numéro de compte
  - IBAN
  - BIC
  - Type de compte (Professionnel, Courant, Épargne, Crédit)
  - Contact banque et téléphone
  - Description

- **Modification et suppression** des comptes existants
- **Statistiques en temps réel** :
  - Total des soldes bancaires
  - Nombre de comptes actifs
  - Nombre de banques partenaires

### 2. Page Gestion Financière (anciennement Caisse)

La page de caisse a été entièrement refaite pour inclure :

#### Vue d'ensemble financière
- **Caisse Physique** : Solde des espèces
- **Comptes Bancaires** : Total des soldes bancaires
- **Total Liquidités** : Caisse + Banques
- **Banques Partenaires** : Nombre d'institutions

#### Onglets séparés
1. **Caisse Physique (Espèces)** :
   - Gestion des entrées/sorties d'espèces
   - Statistiques des mouvements
   - Historique complet

2. **Comptes Bancaires** :
   - Vue d'ensemble des comptes actifs
   - Soldes par compte
   - Lien vers la configuration

## 💰 Devise

Toutes les valeurs sont affichées en **Dirham Marocain (MAD)** comme demandé.

## 🔧 Structure technique

### Fichiers créés/modifiés

1. **`create-comptes-bancaires-table.sql`** - Script SQL pour créer les tables
2. **`src/hooks/useBankAccounts.ts`** - Hook React pour la gestion des comptes
3. **`src/pages/Settings.tsx`** - Ajout de la section comptes bancaires
4. **`src/pages/CashRegister.tsx`** - Refonte complète avec onglets

### Base de données

#### Table `comptes_bancaires`
- Stockage des informations des comptes bancaires
- Solde initial et solde actuel calculé automatiquement
- Support de différents types de comptes

#### Table `mouvements_bancaires`
- Historique des mouvements bancaires
- Système de catégorisation
- Rapprochement bancaire

### Hooks React

#### `useBankAccounts`
- Gestion CRUD des comptes bancaires
- Calcul automatique des soldes
- Statistiques et totaux
- Persistance localStorage (dev) / Supabase (prod)

## 🚀 Utilisation

### 1. Configuration des comptes bancaires
1. Aller dans **Paramètres** → **Comptes Bancaires**
2. Cliquer sur **"Nouveau Compte"**
3. Remplir les informations (nom compte, banque, solde initial minimum)
4. Sauvegarder

### 2. Suivi de la caisse
1. Aller dans **Gestion Financière**
2. Voir la vue d'ensemble des liquidités
3. Utiliser l'onglet **"Caisse Physique"** pour les espèces
4. Utiliser l'onglet **"Comptes Bancaires"** pour voir les soldes

### 3. Transactions caisse
1. Dans l'onglet "Caisse Physique"
2. Cliquer sur **"Nouvelle Transaction"**
3. Choisir le type (Entrée/Sortie)
4. Saisir montant, catégorie et description
5. Valider

## 📊 Tableaux de bord

### Statistiques caisse physique
- Total des entrées d'espèces
- Total des sorties d'espèces
- Solde de caisse actuel

### Statistiques comptes bancaires
- Total des soldes bancaires
- Nombre de comptes actifs
- Répartition par banque

## 🔒 Sécurité

- Validation des données côté client et serveur
- Politiques RLS (Row Level Security) sur Supabase
- Authentification requise pour toutes les opérations

## 🎯 Avantages

1. **Séparation claire** entre espèces et comptes bancaires
2. **Vue consolidée** des liquidités de l'entreprise
3. **Traçabilité complète** des mouvements financiers
4. **Interface intuitive** avec onglets et statistiques
5. **Conformité comptable** avec catégorisation des opérations
6. **Multi-banques** pour diversifier les partenaires financiers

## 🔮 Évolutions futures

- Rapprochement bancaire automatique
- Import des relevés bancaires
- Prévisionnel de trésorerie
- Alertes de soldes faibles
- Export comptable
- Graphiques d'évolution des soldes

## 🐛 Support

Pour toute question ou problème, consultez :
1. La documentation technique dans le code
2. Les commentaires dans les fichiers SQL
3. Les interfaces TypeScript pour les structures de données

---

**Note** : Cette fonctionnalité utilise localStorage en développement et sera automatiquement compatible avec Supabase en production grâce aux hooks React génériques. 