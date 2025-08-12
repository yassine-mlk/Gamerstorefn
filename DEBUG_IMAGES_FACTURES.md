# 🔍 Debug des Images dans les Factures

## 🎯 Problème Actuel
La colonne `image_url` existe dans la table `ventes_articles` mais les images ne s'affichent toujours pas dans les factures.

## 🛠️ Étapes de Diagnostic

### 1. **Exécuter le Script SQL de Diagnostic**

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Copier et exécuter le contenu du fichier `debug-ventes-articles.sql`
3. Noter les résultats pour chaque section

### 2. **Tester l'Affichage avec Debug Console**

1. **Ouvrir l'application** dans le navigateur
2. **Ouvrir la console** du navigateur (F12 → Console)
3. **Aller dans Ventes** → Sélectionner une vente récente
4. **Cliquer sur "Voir Facture"** ou **"Aperçu"**
5. **Vérifier les logs** dans la console :
   ```
   DEBUG ARTICLE: [Nom du produit] image_url: [URL ou undefined]
   DEBUG PREVIEW ARTICLE: [Nom du produit] image_url: [URL ou undefined]
   ```

### 3. **Créer une Nouvelle Vente de Test**

1. **Aller dans Point de Vente**
2. **Ajouter un PC portable** qui a une image visible dans la liste
3. **Finaliser la vente**
4. **Générer la facture** et vérifier la console

## 🔍 Scénarios Possibles

### Scénario A : `image_url` est `undefined` ou `null`
**Symptômes :** 
- Console : `DEBUG ARTICLE: [Nom] image_url: undefined`
- Commentaire HTML : `<!-- Article sans image: [Nom] -->`

**Cause :** Les données `image_url` ne sont pas récupérées depuis la base

**Solution :** Exécuter le script SQL de mise à jour

### Scénario B : `image_url` existe mais image ne charge pas
**Symptômes :**
- Console : `DEBUG ARTICLE: [Nom] image_url: https://...`
- Console : `Image failed to load: https://...`

**Cause :** URL invalide ou problème d'accès

**Solution :** Vérifier les permissions Supabase Storage

### Scénario C : `image_url` existe mais pas d'affichage
**Symptômes :**
- Console : `DEBUG ARTICLE: [Nom] image_url: https://...`
- Pas d'erreur de chargement d'image

**Cause :** Problème CSS ou logique d'affichage

**Solution :** Vérifier le code HTML généré

## 🛠️ Actions Correctives

### Si les données sont manquantes (Scénario A)

```sql
-- Mettre à jour manuellement un article de test
UPDATE ventes_articles 
SET image_url = 'https://exemple-url-image.jpg'
WHERE id = 'ID_ARTICLE_TEST';
```

### Si les URLs sont invalides (Scénario B)

1. Vérifier les permissions du bucket Supabase
2. Tester l'URL directement dans le navigateur
3. Vérifier la configuration RLS

### Si le problème persiste (Scénario C)

1. Forcer l'affichage temporairement :
```javascript
// Dans la console, forcer l'affichage
document.querySelector('.product-image-row')?.style.display = 'table-row';
```

## 📋 Checklist de Diagnostic

- [ ] Script SQL exécuté et résultats notés
- [ ] Console browser ouverte pendant test de facture
- [ ] Logs `DEBUG ARTICLE` visibles dans console
- [ ] Vente de test créée avec PC portable
- [ ] URLs d'images vérifiées dans les logs
- [ ] Erreurs de chargement d'image identifiées
- [ ] HTML généré inspecté

## 📞 Rapport de Bug

Après diagnostic, noter :

1. **Résultats du script SQL :**
   - Nombre total d'articles : ___
   - Articles avec images : ___
   - Articles sans images : ___

2. **Logs console :**
   - `image_url` est : `undefined` / `null` / `URL valide`
   - Erreurs de chargement : `Oui` / `Non`

3. **Test nouvelle vente :**
   - Image visible dans liste produits : `Oui` / `Non`
   - `image_url` dans console après vente : ___
   - Image affichée dans facture : `Oui` / `Non`

## 🔧 Actions Finales

Une fois le problème identifié :
1. Supprimer les logs de debug
2. Appliquer la correction appropriée
3. Tester le fonctionnement normal
4. Documenter la solution
