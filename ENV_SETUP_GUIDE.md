# 🔧 Configuration des Variables d'Environnement et Admin

## 📋 Problème actuel
Vous avez l'erreur : "Variables d'environnement Supabase manquantes"

## 🔧 Solution : Configuration des variables d'environnement

### Étape 1 : Créer le fichier .env

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration Supabase - OBLIGATOIRE
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Configuration API (optionnel)
VITE_API_URL=http://localhost:3001
```

### Étape 2 : Récupérer vos clés Supabase

1. **Connectez-vous à [supabase.com](https://supabase.com)**
2. **Sélectionnez votre projet**
3. **Allez dans `Settings` > `API`**
4. **Copiez :**
   - **URL** → dans `VITE_SUPABASE_URL`
   - **anon public** → dans `VITE_SUPABASE_ANON_KEY`

### Étape 3 : Redémarrer le serveur

Après avoir modifié le `.env` :
```bash
npm run dev
```

## 👑 Rendre un utilisateur admin

### Méthode 1 : Dashboard Supabase (Recommandée)

1. **Allez sur votre dashboard Supabase**
2. **Cliquez sur `Authentication` > `Users`**
3. **Trouvez votre utilisateur et cliquez dessus**
4. **Dans "Raw User Meta Data", ajoutez :**
   ```json
   {
     "role": "admin",
     "name": "Votre Nom"
   }
   ```
5. **Sauvegardez**

### Méthode 2 : Via SQL

Dans le SQL Editor de Supabase :

```sql
-- Vérifier l'utilisateur
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'votre-email@example.com';

-- Rendre admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{role}',
    '"admin"'
)
WHERE email = 'votre-email@example.com';

-- Ajouter un nom (optionnel)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{name}',
    '"Nom Admin"'
)
WHERE email = 'votre-email@example.com';
```

## ✅ Vérification

1. **Déconnectez-vous de l'application**
2. **Reconnectez-vous**
3. **Vérifiez l'accès aux fonctionnalités admin**

## 🚨 Points importants

- Les variables doivent commencer par `VITE_`
- L'utilisateur doit se reconnecter après changement de rôle
- Le fichier `.env` ne doit pas être commité (vérifié dans `.gitignore`)

## 🐛 Dépannage

### Si l'erreur persiste :
1. Vérifiez que le fichier `.env` est à la racine
2. Vérifiez l'orthographe des variables
3. Redémarrez complètement le serveur
4. Vérifiez dans la console que les variables sont chargées

### Pour vérifier si les variables sont chargées :
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
``` 