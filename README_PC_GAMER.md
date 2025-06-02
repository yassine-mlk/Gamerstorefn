# 🎮 Gestion des PC Gamer - Configurations Complètes

## 🎯 Vue d'ensemble

La page **PC Gamer** permet de créer des configurations PC complètes en assemblant des composants provenant du stock existant. Cette fonctionnalité révolutionnaire transforme votre inventaire de composants en configurations pré-assemblées prêtes à la vente !

## ✨ Fonctionnalités Principales

### 🔧 Création de Configurations Intelligente
- **Sélection automatique** des composants depuis le stock
- **Calcul en temps réel** du prix coûtant total
- **Stock possible calculé automatiquement** selon le composant le plus limitant
- **Validation des configurations** (composants obligatoires/optionnels)
- **Gestion des quantités** pour chaque composant

### 📊 Calculs Automatiques
- **Prix coûtant** : Somme des prix d'achat des composants
- **Marge bénéficiaire** : Calcul automatique en pourcentage
- **Stock possible** : Nombre maximum de PC assemblables
- **Mise à jour en temps réel** des calculs lors des modifications

### 🎛️ Composants Configurables
#### Obligatoires :
- **CPU** (Processeur) 🔥
- **Carte mère** (Mother Board) 🔥  
- **Alimentation** (Power Supply) 🔥
- **Boîtier** (Case) 🔥

#### Optionnels :
- **GPU** (Carte graphique)
- **RAM** (Mémoire)
- **Stockage** (Disques)
- **Refroidissement** (Cooling)

### 💰 Gestion Commerciale Avancée
- **Prix de vente personnalisable**
- **Garanties** : 0, 3, 6, 9, 12 mois
- **Codes-barres** automatiques ou manuels
- **Statuts** : Actif, Inactif, Archivé
- **Images et photos** pour chaque configuration

## 🗄️ Architecture Base de Données

### Table `pc_gamer_configs`
```sql
- id (UUID, clé primaire)
- nom_config (VARCHAR, nom de la configuration)
- description (TEXT, description détaillée) 
- prix_vente (DECIMAL, prix de vente au client)
- prix_coutant (DECIMAL, calculé automatiquement)
- code_barre (VARCHAR, unique)
- image_url (TEXT, image de la configuration)
- notes (TEXT, notes internes)
- garantie (ENUM: 0, 3, 6, 9, 12)
- statut (ENUM: Actif, Inactif, Archivé)
- stock_possible (INTEGER, calculé automatiquement)
- date_ajout, derniere_modification, created_at, updated_at
```

### Table `pc_gamer_composants`
```sql
- id (UUID, clé primaire)
- config_id (UUID, référence à pc_gamer_configs)
- composant_id (UUID, référence à composants_pc)
- quantite (INTEGER, quantité nécessaire)
- type_composant (ENUM, type du composant)
- ordre_affichage (INTEGER, ordre d'affichage)
```

### Table `pc_gamer_instances` (Bonus)
```sql
- id (UUID, PC assemblé individuel)
- config_id (UUID, référence à la configuration)
- numero_serie (VARCHAR, numéro de série unique)
- statut (ENUM: Assemblé, Testé, Vendu, SAV, Retourné)
- date_assemblage, date_vente, prix_vente_final
- client_id, technicien, notes_assemblage
```

## 🚀 Fonctionnalités Techniques Avancées

### ⚡ Calculs en Temps Réel
```typescript
// Fonction automatique de calcul du stock possible
const calculateStockPossible = (composants) => {
  return Math.min(...composants.map(comp => 
    Math.floor(comp.stock_actuel / comp.quantite_requise)
  ));
};

// Triggers SQL automatiques
- Mise à jour automatique du stock_possible quand le stock des composants change
- Recalcul automatique du prix_coutant lors des modifications
- Mise à jour des timestamps automatiquement
```

### 🔄 Synchronisation Intelligente
- **Triggers bidirectionnels** entre composants et configurations
- **Mise à jour en cascade** des stocks possibles
- **Recalcul automatique** lors des changements de stock
- **Contraintes d'intégrité** pour éviter les incohérences

### 📈 Statistiques Dynamiques
```sql
-- Vue automatique des statistiques
CREATE VIEW vue_stats_pc_gamer AS
SELECT 
  COUNT(*) as total_configs,
  COUNT(CASE WHEN stock_possible > 0 THEN 1 END) as configs_disponibles,
  SUM(stock_possible) as total_stock_possible,
  AVG(prix_vente) as prix_moyen,
  AVG(marge_percentage) as marge_moyenne
FROM pc_gamer_configs;
```

## 💡 Guide d'Utilisation

### Créer une Nouvelle Configuration

1. **Informations de base**
   - Nom de la configuration (obligatoire)
   - Description détaillée
   - Code-barres (auto-généré si vide)
   - Garantie et statut

2. **Sélection des composants**
   - Cliquez sur les boutons de catégories pour ajouter des composants
   - Choisissez le composant spécifique dans la liste déroulante
   - Définissez la quantité nécessaire
   - Visualisez le prix unitaire et sous-total en temps réel

3. **Configuration des prix**
   - Le prix coûtant se calcule automatiquement
   - Saisissez le prix de vente souhaité
   - La marge se calcule automatiquement en pourcentage
   - Le stock possible s'affiche en temps réel

4. **Finalisation**
   - Ajoutez une image (upload ou caméra)
   - Complétez les notes si nécessaire
   - Sauvegardez la configuration

### Modifier une Configuration Existante

1. Cliquez sur l'icône "Modifier" sur une configuration
2. Les composants existants se chargent automatiquement
3. Modifiez selon vos besoins
4. Les calculs se mettent à jour en temps réel
5. Sauvegardez les modifications

### Comprendre les Indicateurs

#### Statuts de Stock
- 🟢 **Vert** : Stock suffisant (> 3 unités)
- 🟡 **Jaune** : Stock faible (1-3 unités)  
- 🔴 **Rouge** : Rupture de stock (0 unité)

#### Calculs Automatiques
- **Prix coûtant** = Σ(prix_achat_composant × quantité)
- **Marge** = ((prix_vente - prix_coutant) / prix_coutant) × 100
- **Stock possible** = MIN(stock_composant / quantité_requise)

## 🎯 Cas d'Usage Pratiques

### 1. Configuration Gaming Haut de Gamme
```
- CPU: Intel i7-13700K (1×)
- GPU: RTX 4080 (1×) 
- RAM: 32GB DDR5 (2×16GB)
- SSD: 1TB NVMe (1×)
- Carte mère: Z790 (1×)
- Boîtier: Tour Gaming (1×)
- Alimentation: 850W (1×)
- Refroidissement: AIO 240mm (1×)

Prix coûtant calculé: 2,100 MAD
Prix de vente: 2,800 MAD
Marge: 33.3%
Stock possible: 3 unités
```

### 2. Configuration Bureautique
```
- CPU: AMD Ryzen 5 (1×)
- RAM: 16GB DDR4 (1×)
- SSD: 500GB (1×)
- Carte mère: B450 (1×)
- Boîtier: Mini Tower (1×)
- Alimentation: 550W (1×)

Prix coûtant calculé: 800 MAD
Prix de vente: 1,200 MAD
Marge: 50%
Stock possible: 8 unités
```

## 📊 Tableaux de Bord

### Cartes de Statistiques
- **Total Configurations** : Nombre total de configs créées
- **Disponibles** : Configurations avec stock > 0
- **Stock Faible** : Configurations avec stock ≤ 3
- **Rupture** : Configurations avec stock = 0

### Informations par Configuration
- Nom et description
- Code-barres et statut
- Prix coûtant et de vente calculés
- Marge bénéficiaire
- Stock possible actuel
- Garantie offerte

## 🔧 Intégrations Système

### Avec les Composants PC
- **Lecture en temps réel** du stock des composants
- **Mise à jour automatique** des stocks possibles
- **Filtrage intelligent** des composants disponibles
- **Validation des quantités** selon le stock

### Avec le Point de Vente (Futur)
- Vente de configurations complètes
- Décrémentation automatique des stocks de composants
- Génération d'instances PC assemblées
- Suivi des numéros de série

### Avec la Gestion de Stock
- **Alertes automatiques** quand stock faible
- **Suggestions de réapprovisionnement** basées sur les configs populaires
- **Optimisation des achats** selon les configurations

## 🚀 Fonctionnalités Avancées

### Gestion des Instances
Chaque PC vendu devient une "instance" avec :
- Numéro de série unique
- Statut de production (Assemblé → Testé → Vendu)
- Traçabilité complète
- Historique des interventions SAV

### Optimisations Futures
- **Kits de composants** recommandés
- **Configurateur automatique** selon le budget
- **Comparateur de configurations**
- **Alertes de compatibilité** entre composants
- **Export vers étiquettes** et documentation

## 📈 Avantages Business

### 🎯 Pour les Ventes
- **Configurations pré-définies** pour accélérer les ventes
- **Calculs automatiques** évitent les erreurs de prix
- **Stock en temps réel** évite les promesses impossibles
- **Marges optimisées** selon les objectifs

### 📦 Pour la Gestion
- **Visibilité complète** sur les capacités d'assemblage
- **Optimisation des stocks** selon les configurations populaires
- **Traçabilité totale** des composants utilisés
- **Statistiques avancées** pour la prise de décision

### 💰 Pour la Rentabilité
- **Marges calculées automatiquement**
- **Optimisation des prix** selon les coûts réels
- **Identification des configs** les plus rentables
- **Planification des achats** optimisée

---

## 🎮 Résultat Final

Cette fonctionnalité transforme votre magasin en **assembleur PC professionnel** avec :

✅ **Configurations intelligentes** basées sur le stock réel  
✅ **Calculs automatiques** des coûts et marges  
✅ **Gestion optimisée** des stocks de composants  
✅ **Interface intuitive** pour créer des configs rapidement  
✅ **Traçabilité complète** de l'assemblage à la vente  

**Vous pouvez maintenant proposer des PC Gamer pré-configurés à vos clients tout en optimisant votre rentabilité et votre gestion de stock !** 🚀 