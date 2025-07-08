# 🖥️ PC Portables V2 - Architecture à deux niveaux

## 📋 Vue d'ensemble

Le nouveau système PC portables utilise une architecture à deux niveaux :

1. **Configurations** (Types) : Les modèles/spécifications techniques
2. **Articles individuels** : Les unités physiques en stock

## 🎯 Avantages de cette approche

- **Gestion simplifiée** : Une configuration peut avoir plusieurs articles avec des prix différents
- **Flexibilité** : Même configuration disponible en neuf, occasion, avec différents fournisseurs
- **Statistiques automatiques** : Prix moyen, stock total, etc. calculés automatiquement
- **Codes-barres uniques** : Chaque article physique a son propre code-barres

## 🚀 Installation

### 1. Exécuter le script SQL

Exécutez le script `setup-pc-portables-v2.sql` dans votre base de données Supabase :

```sql
-- Via l'interface Supabase ou psql
\i setup-pc-portables-v2.sql
```

### 2. Vérifier les tables

Après exécution, vous devriez avoir :
- `pc_portables_types` : Configurations
- `pc_portables_articles` : Articles individuels

## 📊 Structure des données

### Table : pc_portables_types (Configurations)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `nom_produit` | VARCHAR | Nom du produit |
| `marque` | VARCHAR | Marque (ASUS, Apple, etc.) |
| `modele` | VARCHAR | Modèle spécifique |
| `processeur` | VARCHAR | Processeur |
| `ram` | VARCHAR | Mémoire RAM |
| `carte_graphique` | VARCHAR | Carte graphique |
| `stockage` | VARCHAR | Stockage |
| `ecran` | VARCHAR | Écran |
| `stock_total` | INTEGER | **Calculé automatiquement** |
| `stock_disponible` | INTEGER | **Calculé automatiquement** |
| `prix_moyen` | DECIMAL | **Calculé automatiquement** |

### Table : pc_portables_articles (Articles individuels)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `pc_portable_type_id` | UUID | Référence à la configuration |
| `code_barre` | VARCHAR | Code-barres unique |
| `numero_serie` | VARCHAR | Numéro de série |
| `etat` | ENUM | Neuf, Comme neuf, Occasion |
| `prix_achat` | DECIMAL | Prix d'achat de cet article |
| `prix_vente` | DECIMAL | Prix de vente de cet article |
| `statut` | ENUM | Disponible, Vendu, Réservé, etc. |

## 🔄 Workflow recommandé

### 1. Créer une configuration

1. Aller dans l'onglet "Configurations"
2. Cliquer sur "Nouvelle configuration"
3. Remplir les spécifications techniques
4. Sauvegarder

### 2. Ajouter des articles

1. Cliquer sur "Articles (X)" sur une configuration
2. Ajouter chaque unité physique avec :
   - Son code-barres
   - Son état (neuf/occasion)
   - Ses prix d'achat/vente
   - Son fournisseur

### 3. Exemple concret

**Configuration** : MacBook Air M2 13"
- Processeur : Apple M2
- RAM : 8 GB
- Stockage : 256 GB SSD

**Articles individuels** :
1. Article 1 : Neuf, 1200€ achat, 1400€ vente, code-barres MAC001
2. Article 2 : Occasion, 900€ achat, 1100€ vente, code-barres MAC002
3. Article 3 : Neuf, 1150€ achat, 1380€ vente, code-barres MAC003

## 📈 Statistiques automatiques

Le système calcule automatiquement :
- **Stock total** : Nombre total d'articles
- **Stock disponible** : Articles avec statut "Disponible"
- **Prix moyen** : Moyenne des prix de vente
- **Prix min/max** : Fourchette de prix

## 🛠️ Fonctionnalités avancées

### Codes-barres automatiques
```sql
SELECT generer_code_barre_unique('PC'); -- PC1703845123_456
```

### Mise à jour automatique des statistiques
Les triggers maintiennent les statistiques à jour automatiquement quand vous :
- Ajoutez un article
- Modifiez un prix
- Changez un statut

## 🔧 Migration depuis l'ancien système

Si vous avez des données dans l'ancienne table `pc_portables`, vous pouvez utiliser le script de migration (à créer si nécessaire).

## 📱 Interface utilisateur

L'interface est organisée en deux onglets :

1. **Configurations** : Vue d'ensemble des modèles
2. **Articles** : Gestion détaillée des unités individuelles

## 🐛 Résolution de problèmes

### Tables n'existent pas
```sql
-- Vérifier l'existence des tables
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'pc_portables_%';
```

### Statistiques incorrectes
```sql
-- Recalculer manuellement les statistiques
SELECT update_pc_portables_types_stats();
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que le script SQL a bien été exécuté
2. Consultez les logs de la base de données
3. Vérifiez les permissions sur les tables

---

✅ **Le système est maintenant opérationnel !**

Vous pouvez commencer par créer vos premières configurations PC portables. 