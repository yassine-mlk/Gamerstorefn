# 🖥️ Gestion des Composants PC - Gamerstore

## 🎯 Vue d'ensemble

La page **Composants PC** permet de gérer efficacement le stock de tous les composants informatiques de votre magasin. Cette fonctionnalité complète offre une gestion détaillée avec catégorisation automatique et suivi des stocks.

## ✨ Fonctionnalités Principales

### 📦 Gestion Complète des Composants
- **8 catégories** prédéfinies : CPU, GPU, RAM, Stockage, Boîtier, Carte mère, Alimentation, Refroidissement
- **Formulaire complet** avec tous les champs demandés
- **Codes-barres** automatiques ou manuels
- **États** : Neuf, Comme neuf, Occasion
- **Garanties** : 0, 3, 6, 12 mois

### 💰 Informations Commerciales
- Prix d'achat et de vente
- **Calcul automatique de la marge**
- Gestion des stocks (actuel/minimum)
- Lien avec les fournisseurs
- Statut automatique basé sur le stock

### 📊 Statistiques et Tableaux de Bord
- **Cartes de résumé** : Total, Disponibles, Stock faible, Rupture
- **Répartition par catégorie** avec icônes spécifiques
- **Filtrage avancé** par catégorie
- **Recherche multi-champs**

### 📷 Gestion d'Images
- **Upload de fichiers** images
- **Capture caméra** intégrée
- **Aperçu en temps réel**
- Stockage des images en base64

### 🔍 Recherche et Filtres
- Recherche par nom, catégorie, code-barres, notes
- Filtre déroulant par catégorie
- Tri automatique par date de création

## 🗄️ Structure de la Base de Données

### Table `composants_pc`
```sql
- id (UUID, clé primaire)
- nom_produit (VARCHAR, obligatoire)
- categorie (ENUM: cpu, gpu, ram, disc, case, mother_board, power, cooling)
- code_barre (VARCHAR, unique)
- stock_actuel (INTEGER)
- stock_minimum (INTEGER)
- prix_achat (DECIMAL)
- prix_vente (DECIMAL)
- fournisseur_id (UUID, référence à fournisseurs)
- etat (ENUM: Neuf, Comme neuf, Occasion)
- garantie (ENUM: 0, 3, 6, 12)
- image_url (TEXT)
- notes (TEXT)
- statut (ENUM: Disponible, Stock faible, Rupture, Réservé, Archivé)
- date_ajout, derniere_modification, created_at, updated_at
```

### Table `mouvements_stock_composants_pc`
- Historique complet des mouvements de stock
- Types : Entrée, Sortie, Correction, Retour
- Traçabilité avec utilisateur et date

### Vue `vue_stats_composants_pc`
- Statistiques automatiques pour le tableau de bord
- Calculs en temps réel des totaux et moyennes

## 🚀 Installation et Configuration

### 1. Créer la Base de Données
Exécutez le script SQL dans Supabase :
```bash
# Dans l'éditeur SQL de Supabase, exécuter :
create-composants-pc-table.sql
```

### 2. Vérifier les Hooks
Le hook `useComposantsPC` est automatiquement disponible :
```typescript
import { useComposantsPC } from '@/hooks/useComposantsPC';
```

### 3. Accéder à la Page
- **URL** : `/composants-pc`
- **Menu** : "Composants PC" dans la sidebar
- **Icône** : CPU (Cpu de Lucide React)

## 📋 Guide d'Utilisation

### Ajouter un Nouveau Composant
1. Cliquez sur **"Nouveau Composant"**
2. Remplissez les informations obligatoires :
   - Nom du produit
   - Catégorie
   - Prix d'achat et de vente
3. Complétez les informations optionnelles :
   - Code-barres (auto-généré si vide)
   - Fournisseur
   - État et garantie
   - Stock actuel/minimum
   - Image (upload ou caméra)
   - Notes

### Modifier un Composant
1. Cliquez sur l'icône **"Modifier"** (crayon)
2. Modifiez les informations
3. Sauvegardez les changements

### Supprimer un Composant
1. Cliquez sur l'icône **"Supprimer"** (poubelle)
2. Confirmez la suppression

### Rechercher et Filtrer
1. **Barre de recherche** : Tapez le nom, catégorie, code-barres ou notes
2. **Filtre catégorie** : Sélectionnez une catégorie spécifique
3. **Résultats en temps réel**

## 🎨 Interface Utilisateur

### Cartes de Statistiques
- **Total Composants** : Nombre total d'articles
- **Disponibles** : Stock normal
- **Stock Faible** : Alerte stock minimum
- **En Rupture** : Stock à zéro

### Répartition par Catégorie
- Affichage avec icônes spécifiques par type
- Compteurs en temps réel
- Navigation visuelle intuitive

### Cartes Produits
- **Image** ou icône de catégorie
- **Informations principales** : nom, catégorie, état
- **Détails commerciaux** : prix, stock, garantie
- **Actions** : modifier, supprimer

## 🔧 Fonctionnalités Techniques

### Gestion Automatique du Statut
```typescript
// Le statut est automatiquement calculé :
- Stock = 0 → "Rupture"
- Stock ≤ Stock minimum → "Stock faible"  
- Sinon → "Disponible"
```

### Triggers Base de Données
- **Auto-update statut** basé sur les modifications de stock
- **Timestamps automatiques** pour la traçabilité
- **Contraintes de validation** pour l'intégrité des données

### Types TypeScript
```typescript
interface ComposantPC {
  id: string;
  nom_produit: string;
  categorie: 'cpu' | 'gpu' | 'ram' | 'disc' | 'case' | 'mother_board' | 'power' | 'cooling';
  // ... autres champs
}
```

## 📱 Responsive Design

- **Mobile-first** : Adaptation automatique aux petits écrans
- **Grille adaptative** : 1 colonne (mobile) → 3 colonnes (desktop)
- **Navigation tactile** : Boutons et zones de touch optimisés

## 🔐 Sécurité

- **Validation côté client** et serveur
- **Contraintes de base de données** pour l'intégrité
- **Gestion des erreurs** avec messages utilisateur
- **Échappement automatique** des données

## 🚀 Performance

- **Pagination automatique** pour les grandes listes
- **Recherche optimisée** avec index sur les colonnes clés
- **Images optimisées** en base64
- **Chargement lazy** des composants lourds

## 🔄 Intégration Point de Vente

Les composants PC sont automatiquement intégrés dans le système de vente :
- **Recherche par code-barres** dans le POS
- **Gestion des stocks** en temps réel lors des ventes
- **Historique des mouvements** pour la traçabilité

## 🎯 Prochaines Évolutions

- **Import/Export Excel** pour la gestion en masse
- **Étiquettes codes-barres** imprimables
- **Alertes automatiques** de réapprovisionnement
- **Compatibilité** entre composants
- **Kits de composants** prédéfinis

## 📞 Support

Pour toute question ou amélioration :
1. Vérifiez les logs de la console pour les erreurs
2. Consultez la documentation Supabase
3. Testez les requêtes SQL directement dans Supabase

---

## 🏷️ Catégories Disponibles

| Catégorie | Label | Icône | Exemples |
|-----------|--------|-------|----------|
| `cpu` | Processeur | Cpu | Intel i7, AMD Ryzen |
| `gpu` | Carte graphique | Monitor | RTX 4080, RX 7800 |
| `ram` | Mémoire RAM | MemoryStick | DDR5 32GB, DDR4 16GB |
| `disc` | Stockage | HardDrive | SSD NVMe, HDD 1TB |
| `case` | Boîtier | Box | Tour gaming, Mini-ITX |
| `mother_board` | Carte mère | Cpu | ATX Z790, mATX B550 |
| `power` | Alimentation | Zap | 850W Gold, 750W Bronze |
| `cooling` | Refroidissement | Fan | AIO 240mm, Ventirad |

Cette fonctionnalité complète permet une gestion professionnelle de tous les composants PC avec une interface moderne et intuitive ! 🎮 