# 🔧 Configuration SERVICE_ROLE pour le changement de mot de passe

## 🚨 **Problème résolu**
L'erreur `"Fetch API cannot load https://ljaaqattzvklzjftkyrq.supabase.co/auth/v1/user due to access control checks"` indique que l'admin n'a pas les permissions nécessaires pour changer les mots de passe des membres.

## ✅ **Solution : Configuration de la clé SERVICE_ROLE**

### **Étape 1 : Obtenir votre clé SERVICE_ROLE**

1. **Connectez-vous à votre dashboard Supabase :**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet Gamerstore

2. **Récupérez la clé SERVICE_ROLE :**
   - Cliquez sur **Settings** (icône d'engrenage) dans le menu de gauche
   - Cliquez sur **API** dans le sous-menu
   - Copiez la valeur de **`service_role` secret** (PAS la clé `anon` !)

### **Étape 2 : Ajouter la variable d'environnement**

Créez ou modifiez votre fichier `.env` à la racine du projet :

```env
# Configuration Supabase - OBLIGATOIRE
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Configuration API (optionnel)
VITE_API_URL=http://localhost:3001
```

**⚠️ Remplacez les valeurs par vos vraies clés Supabase !**

### **Étape 3 : Redémarrer l'application**

Après avoir ajouté la clé SERVICE_ROLE :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

## 🔍 **Vérification**

### **Avant (sans SERVICE_ROLE) :**
```
❌ Erreur: "Fetch API cannot load... due to access control checks"
❌ Impossible de changer les mots de passe
```

### **Après (avec SERVICE_ROLE) :**
```
✅ Changement de mot de passe fonctionnel
✅ Aucune erreur d'accès
✅ Messages de succès affichés
```

## ⚠️ **ATTENTION SÉCURITÉ**

La clé `SERVICE_ROLE` donne des **privilèges administrateur complets** :

- ✅ **En développement :** OK d'utiliser cette clé
- ❌ **En production :** JAMAIS exposer cette clé côté client
- 🏭 **Pour la production :** Utilisez un backend sécurisé pour les opérations admin

## 🔧 **Comment ça fonctionne**

### **Avec SERVICE_ROLE (Recommandé) :**
```javascript
// Utilise supabaseAdmin.auth.admin.updateUserById()
✅ Change le mot de passe sans affecter votre session
✅ Accès complet aux opérations admin
✅ Vous restez connecté en tant qu'admin
```

### **Sans SERVICE_ROLE (Fallback) :**
```javascript
// Utilise supabase.auth.admin.updateUserById()
❌ Erreur d'accès refusé
❌ Impossible de changer les mots de passe
```

## 🎯 **Test de la fonctionnalité**

Une fois la configuration terminée :

1. **Allez dans la page Team**
2. **Cliquez sur l'icône d'édition d'un membre**
3. **Cochez "Modifier le mot de passe"**
4. **Entrez un nouveau mot de passe**
5. **Cliquez sur "Sauvegarder"**
6. **Vérifiez que :**
   - ✅ Aucune erreur dans la console
   - ✅ Message de succès affiché
   - ✅ Le membre peut se connecter avec le nouveau mot de passe

## 🐛 **Dépannage**

### **La variable n'est pas reconnue**
- Vérifiez que le fichier `.env` est à la racine du projet
- Redémarrez le serveur de développement
- Vérifiez que la variable commence par `VITE_`

### **Erreur "Unauthorized"**
- Vérifiez que vous avez copié la bonne clé `service_role`
- Assurez-vous que la clé n'a pas d'espaces avant/après

### **L'erreur persiste**
- Vérifiez les logs de la console pour les erreurs
- Assurez-vous que la clé SERVICE_ROLE est correcte
- Vérifiez que vous êtes connecté en tant qu'admin

## 📞 **Besoin d'aide ?**

Si le problème persiste après avoir suivi ces étapes :

1. Vérifiez que toutes vos clés Supabase sont correctes
2. Assurez-vous que vous avez le rôle `admin` dans votre profil
3. Vérifiez les logs Supabase dans le dashboard

---

**📝 Note :** Cette configuration est essentielle pour permettre aux administrateurs de gérer les mots de passe des membres de l'équipe de manière sécurisée ! 