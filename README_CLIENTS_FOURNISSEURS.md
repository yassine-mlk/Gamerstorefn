# Gestion des Clients et Fournisseurs

Ce document explique comment configurer et utiliser les nouvelles fonctionnalités de gestion des clients et fournisseurs.

## 📋 Fonctionnalités

### Clients
- ✅ Création, modification et suppression de clients
- ✅ Recherche avancée (nom, prénom, email)
- ✅ Gestion des statuts (Actif, Inactif, VIP)
- ✅ Suivi des totaux d'achats automatique
- ✅ Interface moderne et responsive

### Fournisseurs
- ✅ Création, modification et suppression de fournisseurs
- ✅ Recherche avancée (nom, contact, spécialité)
- ✅ Gestion des statuts (Actif, Inactif, Privilégié)
- ✅ Suivi des conditions de paiement et délais de livraison
- ✅ Interface moderne et responsive

## 🚀 Installation et Configuration

### 1. Exécution du Script SQL

Connectez-vous à votre console Supabase et exécutez le script SQL :

```bash
# Dans le SQL Editor de Supabase, copiez et exécutez le contenu de :
create-clients-fournisseurs-tables.sql
```

Ce script va créer :
- Les tables `clients` et `fournisseurs`
- Les tables de relations `achats_clients` et `commandes_fournisseurs`
- Les index pour optimiser les performances
- Les triggers pour mise à jour automatique des totaux
- Les politiques RLS (Row Level Security)
- Quelques données de démonstration

### 2. Vérification des Tables

Après exécution, vous devriez voir ces nouvelles tables dans votre base Supabase :

- `clients` - Informations des clients
- `fournisseurs` - Informations des fournisseurs
- `achats_clients` - Historique des achats clients
- `commandes_fournisseurs` - Historique des commandes fournisseurs

### 3. Configuration des Variables d'Environnement

Assurez-vous que votre fichier `.env` contient :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
```

## 📊 Structure des Données

### Table Clients
```sql
id (UUID) - Identifiant unique
nom (VARCHAR) - Nom de famille *obligatoire*
prenom (VARCHAR) - Prénom *obligatoire*
email (VARCHAR) - Email unique *obligatoire*
telephone (VARCHAR) - Numéro de téléphone
adresse (TEXT) - Adresse complète
date_inscription (TIMESTAMP) - Date d'inscription automatique
total_achats (DECIMAL) - Total des achats (mis à jour automatiquement)
derniere_commande (TIMESTAMP) - Date de la dernière commande
statut (VARCHAR) - Actif, Inactif, VIP
notes (TEXT) - Notes libres
created_at/updated_at - Métadonnées
```

### Table Fournisseurs
```sql
id (UUID) - Identifiant unique
nom (VARCHAR) - Nom de l'entreprise *obligatoire*
contact_principal (VARCHAR) - Nom du contact *obligatoire*
email (VARCHAR) - Email unique *obligatoire*
telephone (VARCHAR) - Numéro de téléphone
adresse (TEXT) - Adresse complète
specialite (VARCHAR) - Domaine de spécialité
date_partenariat (TIMESTAMP) - Date de partenariat
total_commandes (DECIMAL) - Total des commandes
derniere_commande (TIMESTAMP) - Date de la dernière commande
statut (VARCHAR) - Actif, Inactif, Privilégié
conditions_paiement (VARCHAR) - Conditions de paiement
delai_livraison_moyen (INTEGER) - Délai en jours
notes (TEXT) - Notes libres
created_at/updated_at - Métadonnées
```

## 🎯 Utilisation

### Page Clients (`/clients`)

**Fonctionnalités disponibles :**
- ➕ **Ajouter un client** : Bouton "Nouveau client"
- 🔍 **Rechercher** : Barre de recherche en temps réel
- ✏️ **Modifier** : Bouton éditer sur chaque client
- 🗑️ **Supprimer** : Bouton supprimer avec confirmation
- 📊 **Statistiques** : Cartes de résumé (Total, Actifs, VIP, Total achats)

**Champs obligatoires :**
- Nom
- Prénom
- Email

### Page Fournisseurs (`/suppliers`)

**Fonctionnalités disponibles :**
- ➕ **Ajouter un fournisseur** : Bouton "Nouveau fournisseur"
- 🔍 **Rechercher** : Barre de recherche en temps réel
- ✏️ **Modifier** : Bouton éditer sur chaque fournisseur
- 🗑️ **Supprimer** : Bouton supprimer avec confirmation
- 📊 **Statistiques** : Cartes de résumé (Total, Actifs, Privilégiés, Total commandes)

**Champs obligatoires :**
- Nom de l'entreprise
- Contact principal
- Email

## ⚡ Fonctionnalités Automatiques

### Mise à Jour des Totaux
Les totaux d'achats (clients) et de commandes (fournisseurs) sont automatiquement calculés via des triggers PostgreSQL lorsque des entrées sont ajoutées dans les tables `achats_clients` ou `commandes_fournisseurs`.

### Recherche Intelligente
La recherche fonctionne sur plusieurs champs simultanément :
- **Clients** : nom, prénom, email
- **Fournisseurs** : nom, contact principal, email, spécialité

### Validation des Données
- Emails uniques
- Validation des statuts via contraintes CHECK
- Champs obligatoires validés côté client et base de données

## 🛠️ Technologies Utilisées

- **Base de données** : Supabase (PostgreSQL)
- **Frontend** : React + TypeScript
- **Hooks personnalisés** : `useClients`, `useSuppliers`
- **UI** : shadcn/ui components
- **Validation** : Validation en temps réel
- **Sécurité** : Row Level Security (RLS) activé

## 🔧 Maintenance

### Backup des Données
Sauvegardez régulièrement vos données via la console Supabase.

### Monitoring
Surveillez les performances des requêtes via le dashboard Supabase.

### Mise à Jour du Schéma
Pour modifier le schéma, utilisez les migrations Supabase :

```sql
-- Exemple d'ajout d'un champ
ALTER TABLE clients ADD COLUMN nouveau_champ VARCHAR(100);
```

## 🐛 Résolution de Problèmes

### Erreur "Table does not exist"
Vérifiez que le script SQL a été correctement exécuté dans Supabase.

### Erreur de permissions
Assurez-vous que les politiques RLS sont correctement configurées.

### Données demo présentes
Les données de démonstration peuvent être supprimées :

```sql
-- Supprimer les données demo
DELETE FROM clients WHERE email LIKE '%@email.com';
DELETE FROM fournisseurs WHERE email LIKE '%@techdistrib.com' OR email LIKE '%@ghw.com' OR email LIKE '%@monitorsolutions.eu';
```

## 📝 Notes Importantes

1. **Suppression en cascade** : Supprimer un client ou fournisseur supprime automatiquement ses achats/commandes associés.

2. **Performance** : Des index sont créés automatiquement pour optimiser les recherches.

3. **Sécurité** : Seuls les utilisateurs authentifiés peuvent accéder aux données (RLS activé).

4. **Extensibilité** : Le schéma est conçu pour être facilement étendu avec de nouvelles fonctionnalités.

---

✅ **Les pages clients et fournisseurs sont maintenant pleinement fonctionnelles avec une base de données réelle !** 