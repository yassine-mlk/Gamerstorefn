# Guide d'Intégration Supabase - Gestion d'Équipe

## 🎯 Fonctionnalités Intégrées

### ✅ Gestion d'Équipe avec Supabase
- Création de membres depuis l'interface admin
- Authentification sécurisée via Supabase Auth
- Gestion des rôles : Admin, Manager, Membre, Vendeur, Livreur
- Gestion des statuts : Actif/Inactif
- Suivi des connexions et dates de création
- Suppression et modification des membres

## 🚀 Installation et Configuration

### 1. Prérequis
- Un projet Supabase actif
- Variables d'environnement configurées
- Accès admin à votre projet Supabase

### 2. Configuration du fichier .env
Assurez-vous d'avoir ces variables dans votre fichier `.env` :

```env
# Configuration Supabase - OBLIGATOIRE
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configuration de la Base de Données

#### Étape 1: Exécuter le script SQL
1. Ouvrez votre tableau de bord Supabase
2. Allez dans `SQL Editor`
3. Exécutez le contenu du fichier `create-profiles-table.sql`

#### Étape 2: Créer votre premier admin
1. Dans Supabase Dashboard, allez dans `Authentication` > `Users`
2. Cliquez sur "Add user"
3. Ajoutez votre email et mot de passe
4. Dans les métadonnées, ajoutez :
```json
{
  "name": "Votre Nom",
  "role": "admin"
}
```

#### Étape 3: Mettre à jour le profil admin (optionnel)
Si vous avez déjà un utilisateur, vous pouvez l'upgrade en admin :
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'votre-email@example.com';
```

## 🔧 Utilisation

### Création de Membres
1. Connectez-vous en tant qu'admin
2. Allez dans "Équipe" dans le menu
3. Cliquez sur "Nouvel Employé"
4. Remplissez les informations :
   - Nom complet
   - Email (doit être unique)
   - Rôle (Admin, Manager, Membre, Vendeur, Livreur)
   - Mot de passe (minimum 6 caractères)
5. Cliquez sur "Créer le compte"

### Gestion des Membres
- **Modifier** : Cliquez sur l'icône d'édition pour modifier nom, email, rôle
- **Statut** : Cliquez sur le badge de statut pour activer/désactiver
- **Supprimer** : Cliquez sur l'icône poubelle (avec confirmation)

### Rôles Disponibles
- **Admin** : Accès complet à toutes les fonctionnalités
- **Manager** : Gestion d'équipe et supervision
- **Membre** : Accès de base au système
- **Vendeur** : Spécialisé dans les ventes
- **Livreur** : Gestion des livraisons

## 🔒 Sécurité

### Row Level Security (RLS)
- Activé sur la table `profiles`
- Les admins peuvent voir/modifier tous les profils
- Les utilisateurs ne peuvent voir que leur propre profil
- Protection automatique contre les accès non autorisés

### Authentification
- Hachage automatique des mots de passe
- Sessions sécurisées avec Supabase Auth
- Tokens JWT avec rafraîchissement automatique

## 📊 Tableau de Bord

### Statistiques d'Équipe
- Nombre d'administrateurs
- Nombre de managers
- Nombre de membres
- Nombre de vendeurs
- Nombre de livreurs

### Liste des Membres
- Vue d'ensemble de tous les membres
- Filtrage par rôle et statut
- Tri par date de création
- Informations de dernière connexion

## 🐛 Dépannage

### Erreur "Impossible de charger les membres"
- Vérifiez que la table `profiles` existe
- Vérifiez les politiques RLS
- Assurez-vous d'être connecté en tant qu'admin

### Erreur de création de membre
- Vérifiez que l'email n'existe pas déjà
- Mot de passe minimum 6 caractères
- Vérifiez la connexion Supabase

### Permissions insuffisantes
- Assurez-vous d'avoir le rôle `admin` dans votre profil
- Vérifiez les politiques RLS dans Supabase

### Suppression de membre échoue
- La suppression auth user nécessite des privilèges élevés
- Le profil sera supprimé même si l'utilisateur auth reste

## 🔄 Migration depuis l'Ancien Système

Si vous avez des données d'équipe existantes :

1. **Sauvegardez** vos données actuelles
2. **Créez** les comptes Supabase pour chaque membre
3. **Configurez** les rôles appropriés
4. **Testez** la connexion de chaque membre

## ⚡ Améliorations Possibles

### Fonctionnalités Futures
- Reset de mot de passe par email
- Invitation par email
- Authentification à deux facteurs
- Historique des modifications
- Groupes et permissions avancées

### Optimisations
- Cache des données membres
- Pagination pour grandes équipes
- Recherche et filtres avancés
- Export des données d'équipe

## 📚 Structure des Données

### Table `profiles`
```sql
id               UUID (PK)           -- ID utilisateur Supabase
email            TEXT (UNIQUE)       -- Email de connexion
name             TEXT                -- Nom complet
role             TEXT                -- Rôle (admin|member|manager|vendeur|livreur)
status           TEXT                -- Statut (actif|inactif)
created_at       TIMESTAMP           -- Date de création
updated_at       TIMESTAMP           -- Dernière modification
last_sign_in_at  TIMESTAMP           -- Dernière connexion
```

## 🎨 Interface Utilisateur

### Design Gaming
- Theme sombre avec accents cyan/purple
- Animations fluides et modernes
- Interface responsive
- Feedback visuel pour toutes les actions

### Expérience Utilisateur
- Création simple en quelques clics
- Feedback immédiat sur les actions
- Chargement progressif des données
- Messages d'erreur clairs

## 🚀 Pour Commencer

1. **Configurez** votre environnement Supabase
2. **Exécutez** le script SQL pour créer la table
3. **Créez** votre premier admin
4. **Lancez** l'application : `npm run dev`
5. **Connectez-vous** et créez votre équipe !

---

**Note** : Cette intégration remplace complètement l'ancien système de gestion d'équipe local par une solution cloud sécurisée et scalable avec Supabase. 