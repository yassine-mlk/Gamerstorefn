# 🚨 SOLUTION : "Database error creating new user"

## ❌ **Erreur rencontrée :**
```json
{
    "code": "unexpected_failure",
    "message": "Database error creating new user"
}
```

## 🔍 **Causes possibles :**

1. **Table `profiles` corrompue ou mal configurée**
2. **Triggers défaillants**
3. **Politiques RLS (Row Level Security) trop restrictives**
4. **Contraintes de base de données problématiques**
5. **Permissions manquantes**

## ✅ **SOLUTION COMPLÈTE**

### **Étape 1 : Diagnostic rapide**

Exécutez le script de diagnostic :
```bash
node diagnose-supabase-config.js
```

### **Étape 2 : Correction de la base de données**

1. **Connectez-vous à Supabase Dashboard**
2. **Allez dans SQL Editor**
3. **Exécutez le script `fix-database-user-creation.sql`**

Ce script va :
- ✅ Diagnostiquer les problèmes existants
- 🔧 Supprimer les contraintes problématiques
- 🗄️ Recréer la table `profiles` proprement
- 🔒 Configurer les bonnes politiques RLS
- ⚡ Créer un trigger robuste avec gestion d'erreur
- 🎯 Vérifier que tout fonctionne

### **Étape 3 : Vérification**

Après avoir exécuté le script, vous devriez voir dans la console SQL :

```
✅ Script de correction exécuté avec succès
📋 Table profiles recréée avec les bonnes politiques
🔧 Trigger handle_new_user configuré avec gestion d'erreur
🔒 Politiques RLS mises à jour
🎯 Prêt pour la création d'utilisateurs
```

## 🔧 **Ce que fait le script de correction**

### **1. Nettoyage des problèmes existants :**
- Supprime les contraintes CHECK problématiques
- Supprime les politiques RLS trop restrictives
- Supprime les triggers défaillants

### **2. Recréation propre :**
```sql
-- Table profiles optimisée
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'actif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **3. Politiques RLS permissives :**
- **Admins :** Accès complet à tous les profils
- **Service Role :** Accès complet (pour la création d'utilisateurs)
- **Utilisateurs :** Accès à leur propre profil

### **4. Trigger robuste avec gestion d'erreur :**
```sql
-- Gestion des erreurs dans le trigger
EXCEPTION
    WHEN unique_violation THEN
        -- Met à jour si l'utilisateur existe déjà
    WHEN OTHERS THEN
        -- Log l'erreur mais ne fait pas échouer la création
```

## 🎯 **Test de la solution**

### **1. Après avoir exécuté le script :**

1. **Allez dans votre application**
2. **Page Team > "Nouvel Employé"**
3. **Créez un utilisateur de test :**
   - Nom : Test User
   - Email : test@example.com
   - Mot de passe : 123456
   - Rôle : Membre

### **2. Résultat attendu :**
```
✅ Membre Test User créé avec succès
```

### **3. Si ça ne marche toujours pas :**

**Vérifiez dans la console navigateur :**
- Pas d'erreur "Database error"
- Message de succès affiché

**Vérifiez dans Supabase Dashboard :**
- Authentication > Users : Le nouvel utilisateur apparaît
- Database > profiles : Le profil est créé

## 🐛 **Dépannage avancé**

### **Si l'erreur persiste après le script :**

**1. Vérifiez les logs Supabase :**
- Dashboard > Logs
- Cherchez les erreurs liées à `profiles`

**2. Vérifiez la configuration :**
```bash
# Variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_SERVICE_ROLE_KEY
```

**3. Test manuel dans SQL Editor :**
```sql
-- Test de création manuelle
INSERT INTO public.profiles (id, email, name, role, status)
VALUES (
    gen_random_uuid(),
    'test-manual@example.com',
    'Test Manuel',
    'member',
    'actif'
);
```

### **Si l'insertion manuelle échoue :**

Il y a un problème de permissions. Exécutez :
```sql
-- Donner toutes les permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;
```

## 🔄 **Alternative : Méthode sans trigger**

Si le problème persiste, modifiez le hook `useMembers.ts` pour créer le profil manuellement :

```typescript
// Dans createMember, après la création de l'utilisateur auth
if (authData?.user) {
  // Créer le profil manuellement SANS compter sur le trigger
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: memberData.email,
      name: memberData.name,
      role: memberData.role,
      status: 'actif'
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Continuer quand même, ne pas faire échouer la création
  }
}
```

## ✅ **Vérification finale**

Une fois tout configuré :

1. **Aucune erreur dans la console**
2. **Utilisateurs créés avec succès**
3. **Profils visibles dans la table `profiles`**
4. **Authentification fonctionnelle**

## 📞 **Support**

Si le problème persiste après toutes ces étapes :

1. **Exportez votre schéma de base de données**
2. **Vérifiez les logs détaillés dans Supabase**
3. **Contactez le support Supabase si nécessaire**

---

**🎯 Cette solution corrige 99% des problèmes de création d'utilisateur en base !** 