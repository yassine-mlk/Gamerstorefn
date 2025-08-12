# 🔧 Guide de Correction des Images dans les Factures

## 🎯 Problème
Les images des produits ne s'affichent pas correctement dans les factures générées.

## 🔍 Diagnostic
Le problème vient de plusieurs sources :
1. **Colonne `image_url` manquante** dans la table `ventes_articles`
2. **Données existantes** sans images
3. **URLs d'images** non normalisées

## ✅ Solution Complète

### Étape 1 : Exécuter le Script SQL de Correction

1. **Ouvrir Supabase Dashboard** → SQL Editor
2. **Copier et exécuter** le contenu du fichier `fix-facture-images.sql`

Ce script va :
- ✅ Ajouter la colonne `image_url` si elle n'existe pas
- ✅ Mettre à jour les articles existants avec les images des produits
- ✅ Créer un trigger pour automatiquement ajouter les images aux nouvelles ventes
- ✅ Afficher un rapport des corrections effectuées

### Étape 2 : Vérifier les Résultats

Après l'exécution du script, vous devriez voir :
```
✅ Colonne image_url ajoutée à ventes_articles
✅ Articles mis à jour avec les images
✅ Trigger créé pour les nouvelles ventes
```

### Étape 3 : Tester les Factures

1. **Créer une nouvelle vente** avec un PC portable qui a une image
2. **Générer une facture** (HTML ou PDF)
3. **Vérifier** que l'image s'affiche sur une ligne séparée

## 🔧 Améliorations Apportées

### Code Frontend
- ✅ **Normalisation des URLs** d'images Supabase
- ✅ **Gestion d'erreur** avec fallback vers placeholder
- ✅ **Debug console** pour identifier les problèmes d'images
- ✅ **Affichage séparé** des images sur une ligne dédiée

### Base de Données
- ✅ **Colonne `image_url`** ajoutée à `ventes_articles`
- ✅ **Trigger automatique** pour les nouvelles ventes
- ✅ **Migration des données** existantes

## 🧪 Test de Fonctionnement

### Test 1 : Vente Existante
1. Aller dans **Ventes** → Sélectionner une vente récente
2. Cliquer sur **"Voir Facture"**
3. Vérifier que les images s'affichent

### Test 2 : Nouvelle Vente
1. Aller dans **Point de Vente**
2. Ajouter un PC portable avec image au panier
3. Finaliser la vente
4. Générer la facture
5. Vérifier l'affichage de l'image

## 🐛 Debug en Cas de Problème

### Vérifier les URLs d'Images
```sql
-- Vérifier les articles avec images
SELECT 
    va.nom_produit,
    va.image_url,
    v.numero_vente
FROM ventes_articles va
JOIN ventes v ON va.vente_id = v.id
WHERE va.image_url IS NOT NULL
ORDER BY v.date_vente DESC
LIMIT 10;
```

### Vérifier les Produits Sources
```sql
-- Vérifier les PC portables avec images
SELECT 
    nom_produit,
    image_url
FROM pc_portables
WHERE image_url IS NOT NULL
LIMIT 5;
```

### Console Browser
Ouvrir la console du navigateur et vérifier les messages :
```
Image failed to load: [URL]
```

## 📋 Checklist de Validation

- [ ] Script SQL exécuté avec succès
- [ ] Colonne `image_url` présente dans `ventes_articles`
- [ ] Articles existants mis à jour avec images
- [ ] Trigger créé pour nouvelles ventes
- [ ] Images s'affichent dans les factures HTML
- [ ] Images s'affichent dans les factures PDF
- [ ] Placeholder affiché si image manquante
- [ ] Console sans erreurs d'images

## 🚀 Résultat Attendu

Après application de ces corrections :
- ✅ **Images affichées** sur une ligne séparée dans les factures
- ✅ **URLs normalisées** pour Supabase Storage
- ✅ **Fallback gracieux** vers placeholder si image manquante
- ✅ **Automatisation** pour les nouvelles ventes

## 📞 Support

Si le problème persiste :
1. Vérifier les logs de la console browser
2. Contrôler les URLs d'images dans la base de données
3. Tester avec une nouvelle vente
4. Vérifier les permissions Supabase Storage
