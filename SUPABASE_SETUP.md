# Configuration Supabase pour Gamerstore

## 📋 Prérequis
- Un compte Supabase (gratuit)
- Un projet Supabase créé

## 🔧 Configuration du fichier .env

Créez un fichier `.env` à la racine du projet avec :

```env
# Configuration Supabase - OBLIGATOIRE
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Configuration API (optionnel)
VITE_API_URL=http://localhost:3001
```

## 🔍 Où trouver vos clés Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans `Settings` > `API`
4. Copiez :
   - **URL** dans `VITE_SUPABASE_URL`
   - **anon public** dans `VITE_SUPABASE_ANON_KEY`

## 🗄️ Configuration de la base de données

### Table `profiles` (recommandée)

```sql
-- Créer la table profiles pour étendre les données utilisateur
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Fonction pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer un profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🚀 Fonctionnalités disponibles

### ✅ Avec l'implémentation actuelle
- Connexion avec email/mot de passe
- Inscription avec métadonnées (nom, rôle)
- Déconnexion sécurisée
- Gestion automatique des sessions
- Persistance des sessions
- Gestion des rôles (admin/member)

### 📧 Configuration email (optionnel)
Pour l'inscription par email :
1. Allez dans `Authentication` > `Settings`
2. Configurez votre provider SMTP
3. Personnalisez les templates d'email

## 🧪 Test de l'authentification

1. Lancez l'application : `npm run dev`
2. Créez un compte via l'interface (si vous ajoutez la fonctionnalité d'inscription)
3. Ou créez un utilisateur directement dans Supabase Dashboard
4. Testez la connexion/déconnexion

## 🔒 Sécurité

- Les mots de passe sont automatiquement hashés par Supabase
- Les sessions sont gérées de manière sécurisée
- RLS (Row Level Security) protège les données
- Les tokens sont automatiquement rafraîchis

## 🐛 Dépannage

### Erreur "Variables d'environnement manquantes"
- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur de développement

### Erreur de connexion
- Vérifiez vos clés Supabase
- Vérifiez que l'utilisateur existe dans Supabase
- Consultez les logs dans l'onglet Network du navigateur

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Guide Supabase + React](https://supabase.com/docs/guides/getting-started/tutorials/with-react) 