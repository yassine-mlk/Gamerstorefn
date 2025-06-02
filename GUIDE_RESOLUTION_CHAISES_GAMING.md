# Guide de Résolution - Problème UUID Chaises Gaming

## 🚨 Problème Identifié

**Erreur:** `null value in column "id" of relation "chaises_gaming" violates not-null constraint`

**Cause:** L'extension UUID n'est pas activée ou la fonction `gen_random_uuid()` ne fonctionne pas correctement dans Supabase.

## 🔧 Solution Étape par Étape

### Étape 1: Exécuter le Script SQL Corrigé

1. **Ouvrez votre dashboard Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Sélectionnez votre projet

2. **Accédez au SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche

3. **Exécutez le script corrigé**
   - Copiez tout le contenu du fichier `create-chaises-gaming-table-fixed.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" pour exécuter

### Étape 2: Vérifications

Après l'exécution du script, vous devriez voir :

```sql
-- Message de succès
NOTICE: UUID generation working correctly: [un-uuid-valide]

-- Résultats de la vérification
id                                   | nom_produit           | uuid_status
-------------------------------------|----------------------|-------------
[uuid-valide]                        | DXRacer Formula Series| OK: Valid UUID
[uuid-valide]                        | Secretlab Titan Evo  | OK: Valid UUID
[uuid-valide]                        | Corsair T3 Rush      | OK: Valid UUID
```

### Étape 3: Test de l'Application

1. **Redémarrez votre application**
   ```bash
   npm run dev
   ```

2. **Testez l'ajout d'une chaise gaming**
   - Allez sur la page "Chaises Gaming"
   - Cliquez sur "Nouvelle Chaise Gaming"
   - Remplissez le formulaire avec des données de test :
     - Nom du produit: "Test Chaise"
     - Marque: "DXRacer"
     - Prix d'achat: 1000
     - Prix de vente: 1500
     - Stock actuel: 5
   - Cliquez sur "Ajouter"

## 🔍 Diagnostic des Problèmes

### Si l'erreur persiste :

1. **Vérifiez l'extension UUID**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
   ```

2. **Testez la génération d'UUID**
   ```sql
   SELECT uuid_generate_v4();
   ```

3. **Vérifiez la structure de la table**
   ```sql
   \d public.chaises_gaming
   ```

### Messages d'erreur courants :

- **"extension uuid-ossp does not exist"**
  - Solution: Exécutez `CREATE EXTENSION "uuid-ossp";`

- **"function uuid_generate_v4() does not exist"**
  - Solution: L'extension n'est pas correctement installée

- **"permission denied"**
  - Solution: Assurez-vous d'être connecté en tant qu'admin

## 🎯 Points Clés de la Correction

### 1. Extension UUID
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Fonction UUID Correcte
```sql
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
```
Au lieu de `gen_random_uuid()` qui peut ne pas être disponible.

### 3. Suppression des Valeurs NULL
Le hook a été modifié pour ne pas envoyer de champs vides ou null inutilement.

### 4. Validation des Données
Ajout de vérifications pour s'assurer que les UUID sont correctement générés.

## 📝 Après la Correction

Une fois le problème résolu, vous devriez pouvoir :

- ✅ Ajouter des chaises gaming sans erreur
- ✅ Voir les chaises dans la liste
- ✅ Modifier et supprimer les chaises
- ✅ Voir des UUID valides dans la base de données

## 🆘 Support Supplémentaire

Si le problème persiste après avoir suivi ces étapes :

1. Vérifiez les logs de la console du navigateur
2. Vérifiez les logs Supabase dans le dashboard
3. Assurez-vous que votre utilisateur a les permissions admin
4. Vérifiez que les politiques RLS sont correctement configurées

## 🔄 Commandes de Nettoyage (si nécessaire)

Si vous voulez repartir de zéro :

```sql
-- Supprimer complètement la table
DROP TABLE IF EXISTS public.chaises_gaming CASCADE;

-- Puis réexécuter le script create-chaises-gaming-table-fixed.sql
``` 