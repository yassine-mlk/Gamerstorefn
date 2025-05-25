# Guide d'Authentification - Gamerstore Manager avec Supabase

## Fonctionnalités Implémentées

### ✅ Système d'Authentification Supabase
- Connexion sécurisée avec email/mot de passe via Supabase
- Gestion des sessions avec Supabase Auth
- Redirection automatique selon le rôle (Admin/Membre)
- Déconnexion avec nettoyage automatique des sessions
- Inscription utilisateur avec métadonnées personnalisées

### ✅ Gestion des Rôles
- **Administrateur** : Accès complet au tableau de bord admin
- **Membre** : Accès limité au tableau de bord membre
- Rôles stockés dans les métadonnées utilisateur Supabase

### ✅ Persistance des Sessions
- Sessions gérées automatiquement par Supabase
- Rafraîchissement automatique des tokens
- Maintien de la connexion au rafraîchissement de page

## Configuration Requise

### 1. Variables d'Environnement
Créez un fichier `.env` à la racine avec :
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Configuration Supabase
Consultez le fichier `SUPABASE_SETUP.md` pour :
- Obtenir vos clés Supabase
- Configurer la base de données
- Créer la table profiles
- Configurer les politiques de sécurité

## Utilisation

### Connexion
1. Ouvrez l'application
2. Saisissez votre email et mot de passe Supabase
3. Connexion automatique et redirection selon le rôle

### Création d'Utilisateurs
Vous pouvez créer des utilisateurs de deux façons :

#### Via Supabase Dashboard
1. Allez dans `Authentication` > `Users`
2. Cliquez sur "Add user"
3. Ajoutez les métadonnées : `{"name": "Nom", "role": "admin"}` ou `{"name": "Nom", "role": "member"}`

#### Via Code (si vous ajoutez l'inscription)
```typescript
await signUp("email@example.com", "password", {
  name: "Nom Utilisateur",
  role: "admin" // ou "member"
});
```

## Architecture Technique

### Configuration Supabase (`src/lib/supabase.ts`)
- Configuration du client Supabase
- Types TypeScript pour l'authentification
- Gestion des erreurs

### Contexte d'Authentification (`src/contexts/AuthContext.tsx`)
- Intégration complète avec Supabase Auth
- Écoute des changements d'état d'authentification
- Transformation des données utilisateur Supabase
- Gestion des erreurs et états de chargement

### Interface Utilisateur
- Page de connexion intégrée avec Supabase
- Menu utilisateur avec déconnexion sécurisée
- Notifications en temps réel des actions

## Sécurité

### Supabase Auth
- Hachage automatique des mots de passe
- Tokens JWT sécurisés
- Rafraîchissement automatique des sessions
- Protection CSRF intégrée

### Row Level Security (RLS)
- Politiques de sécurité au niveau base de données
- Accès restreint aux données utilisateur
- Protection automatique contre les accès non autorisés

## Flux d'Authentification

1. **Chargement** : Vérification de session existante
2. **Connexion** : Authentification via Supabase
3. **Session** : Gestion automatique par Supabase
4. **Redirection** : Navigation vers l'espace approprié
5. **Persistance** : Maintien automatique de la session
6. **Déconnexion** : Nettoyage sécurisé via Supabase

## Test de l'Application

1. Configurez vos variables d'environnement
2. Configurez votre base de données Supabase
3. Créez un utilisateur test dans Supabase Dashboard
4. Lancez l'application : `npm run dev`
5. Testez la connexion/déconnexion

## Dépannage

### Variables d'environnement manquantes
- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur après modification

### Erreurs de connexion
- Vérifiez vos clés Supabase dans le Dashboard
- Vérifiez que l'utilisateur existe
- Consultez la console navigateur pour les erreurs détaillées

### Problèmes de rôles
- Vérifiez les métadonnées utilisateur dans Supabase
- Assurez-vous que le champ `role` est défini
- Vérifiez la fonction de création de profil

## Avantages de l'Intégration Supabase

✅ **Sécurité renforcée** : Authentification professionnelle  
✅ **Simplicité** : Pas de serveur d'authentification à maintenir  
✅ **Scalabilité** : Gestion automatique de la charge  
✅ **Fonctionnalités** : Reset password, confirmation email, etc.  
✅ **Temps réel** : Synchronisation automatique des sessions  

## Prochaines Étapes Possibles

- Ajout de l'inscription utilisateur dans l'interface
- Reset de mot de passe
- Authentification sociale (Google, GitHub, etc.)
- Confirmation d'email obligatoire
- Authentification à deux facteurs 