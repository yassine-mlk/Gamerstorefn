# Configuration Admin pour la création d'utilisateurs

## Problème résolu
Lors de la création d'un nouvel utilisateur via la page Team, l'admin était automatiquement déconnecté et connecté au nouveau compte créé.

## Solution implémentée
Utilisation de l'API Admin de Supabase avec la clé `SERVICE_ROLE` pour créer des utilisateurs sans affecter la session courante.

## Configuration requise

### 1. Obtenir la clé SERVICE_ROLE

1. Allez dans votre projet Supabase Dashboard
2. Naviguez vers **Settings** > **API**
3. Copiez la clé `service_role` (pas la clé `anon` !)

### 2. Ajouter la variable d'environnement

Ajoutez cette ligne à votre fichier `.env` :

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_ici
```

**⚠️ ATTENTION SÉCURITÉ :**
- Cette clé donne des privilèges administrateur complets
- Ne jamais l'exposer dans le code côté client en production
- Pour la production, utilisez un backend sécurisé pour les opérations admin

### 3. Redémarrer l'application

Après avoir ajouté la variable d'environnement :

```bash
npm run dev
```

## Comment ça fonctionne

### Avec la clé SERVICE_ROLE (Recommandé)
```javascript
// Utilise supabaseAdmin.auth.admin.createUser()
// ✅ Crée l'utilisateur sans affecter votre session
// ✅ Auto-confirme l'email
// ✅ Vous restez connecté en tant qu'admin
```

### Sans la clé SERVICE_ROLE (Fallback)
```javascript
// Utilise supabase.auth.signUp() puis restaure la session
// ⚠️ Méthode de secours moins élégante
// ✅ Fonctionne mais peut avoir des effets de bord
```

## Vérification

Après configuration, testez la création d'un utilisateur :

1. Allez dans la page **Team**
2. Créez un nouvel utilisateur
3. Vérifiez que :
   - ✅ L'utilisateur est créé
   - ✅ Vous restez connecté en tant qu'admin
   - ✅ Aucune déconnexion automatique

## Dépannage

### La variable n'est pas reconnue
- Vérifiez que le fichier `.env` est à la racine du projet
- Redémarrez le serveur de développement
- Vérifiez que la variable commence par `VITE_`

### Erreur "Unauthorized"
- Vérifiez que vous avez copié la bonne clé `service_role`
- Assurez-vous que la clé n'a pas d'espaces avant/après

### L'utilisateur n'est pas créé
- Vérifiez les logs de la console pour les erreurs
- Assurez-vous que la table `profiles` existe
- Exécutez le script `fix-email-confirmation-simple.sql` si nécessaire 