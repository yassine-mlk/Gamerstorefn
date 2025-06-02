# 🚨 CORRECTION URGENTE : Récursion infinie dans les politiques RLS

## ❌ **Erreur critique rencontrée :**
```
Error code: "42P17"
Message: "infinite recursion detected in policy for relation \"profiles\""
```

## 🔥 **ACTION IMMÉDIATE REQUISE**

### **Cette erreur BLOQUE complètement l'accès à la table `profiles` !**

## ✅ **SOLUTION RAPIDE (2 minutes)**

### **Étape 1 : Accès d'urgence à Supabase**
1. **Ouvrez immédiatement :** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez votre projet**
3. **Allez dans SQL Editor**

### **Étape 2 : Script de correction d'urgence**
**Copiez et exécutez IMMÉDIATEMENT ce script :**

```sql
-- CORRECTION D'URGENCE - Récursion infinie
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Désactiver RLS temporairement
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Créer politiques simples NON-RÉCURSIVES
CREATE POLICY "Service role access" ON public.profiles FOR ALL TO service_role USING (true);
CREATE POLICY "Users own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id);

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Donner permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
```

### **Étape 3 : Vérification immédiate**
Après avoir exécuté le script, **rafraîchissez votre application**. L'erreur devrait disparaître.

## 🔍 **Explication du problème**

### **Cause de la récursion :**
La politique problématique était :
```sql
-- PROBLÉMATIQUE - CAUSE LA RÉCURSION !
CREATE POLICY "Admins can do everything" ON public.profiles
USING (
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'  -- RÉCURSION ICI !
    )
);
```

### **Pourquoi ça fait une boucle infinie :**
1. Pour lire `profiles`, PostgreSQL vérifie la politique
2. La politique lit `profiles` pour vérifier si l'utilisateur est admin
3. Pour lire `profiles`, PostgreSQL vérifie la politique...
4. **BOUCLE INFINIE !** 🔄

## 🔧 **Solution définitive**

### **Une fois l'urgence résolue, exécutez le script complet :**
Utilisez le fichier `fix-rls-infinite-recursion.sql` pour une correction complète avec toutes les politiques nécessaires.

### **Politiques corrigées utilisent :**
- ✅ **Métadonnées JWT** au lieu de lire la table `profiles`
- ✅ **`auth.uid()`** pour l'identification directe
- ✅ **`service_role`** pour les opérations admin

## 🎯 **Test de la correction**

### **1. Vérification immédiate :**
- ✅ L'application se charge sans erreur 500
- ✅ La page Team affiche les membres
- ✅ Aucune erreur de récursion dans la console

### **2. Test de création de membre :**
- ✅ "Nouvel Employé" fonctionne
- ✅ Membre créé avec succès

## 🚨 **Si le problème persiste**

### **En cas d'urgence absolue :**
```sql
-- DÉSACTIVER COMPLÈTEMENT RLS (temporaire)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles TO authenticated, anon, service_role;
```

**⚠️ ATTENTION :** Cette solution supprime toute sécurité. À utiliser uniquement en urgence, puis reconfigurer les politiques rapidement.

## 🔄 **Prévention future**

### **Règles pour éviter la récursion :**
1. **JAMAIS** faire référence à la table protégée dans sa propre politique
2. **Utiliser** les métadonnées JWT : `auth.jwt() -> 'user_metadata' ->> 'role'`
3. **Utiliser** `auth.uid()` pour l'identification directe
4. **Tester** chaque politique avant de l'activer

## 📞 **Statut de résolution**

Une fois le script d'urgence exécuté :
- ✅ **Récursion infinie corrigée**
- ✅ **Accès à la table `profiles` restauré**
- ✅ **Création de membres fonctionnelle**
- ✅ **Application opérationnelle**

---

**🎯 Exécutez le script d'urgence MAINTENANT pour résoudre le problème en 30 secondes !** 