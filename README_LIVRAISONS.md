# Système de Gestion des Livraisons

## Description

Ce système permet de gérer automatiquement les livraisons des ventes de type **"commande (livraison)"** dans votre application Gamer Store. Chaque vente de ce type génère automatiquement une livraison avec un statut par défaut "en cours de livraison".

## Fonctionnalités

### 🚚 Gestion automatique des livraisons
- **Création automatique** : Les ventes de type **"commande (livraison)"** génèrent automatiquement une livraison
- **Statut par défaut** : Toutes les nouvelles livraisons commencent avec le statut "en cours de livraison"
- **Suivi complet** : Numéro de livraison unique, transporteur, adresse, etc.

### 📊 Statuts de livraison
- **En cours** : Livraison en cours de traitement/transport
- **Livré** : Livraison réussie
- **Non livré** : Échec de livraison
- **Retour** : Produit retourné
- **Annulé** : Livraison annulée

### 🎯 Interface utilisateur
- **Tableau de bord** : Statistiques en temps réel
- **Filtres avancés** : Par statut, transporteur, ville, date
- **Recherche** : Par nom client, numéro de livraison, suivi
- **Actions rapides** : Boutons pour changer le statut facilement

## Installation

### 1. Créer les tables dans Supabase

Exécutez le script `create-livraisons-table.sql` dans l'éditeur SQL de Supabase :

```sql
-- Le script créera automatiquement :
-- - Table `livraisons` : Informations principales des livraisons
-- - Table `livraisons_articles` : Détail des articles par livraison
-- - Triggers automatiques pour la création et mise à jour
-- - Permissions et index pour les performances
```

### 2. Insérer des données de test (optionnel)

Pour tester le système, exécutez `insert-commandes-livraison-test.sql` :

```sql
-- Ce script créera :
-- - 5 ventes de test de type "commande (livraison)"
-- - Articles associés à chaque vente
-- - Livraisons générées automatiquement par les triggers
```

## Utilisation

### Accès à la page de livraisons

1. Connectez-vous à votre application Gamer Store
2. Naviguez vers **Livraisons** dans le menu principal
3. Vous verrez toutes les livraisons des ventes en ligne

### Synchronisation des ventes existantes

Si vous avez déjà des ventes de type "commande (livraison)" sans livraisons :

1. Cliquez sur le bouton **"Synchroniser"** en haut à droite
2. Le système créera automatiquement les livraisons manquantes
3. Les nouvelles livraisons auront le statut "en cours"

### Gestion des statuts

Pour changer le statut d'une livraison :

1. Cliquez sur l'icône **"👁️"** (Voir détails) dans la colonne Actions
2. Dans la popup, utilisez les boutons de statut :
   - **🚚 En cours** : Livraison en transit
   - **✅ Livré** : Marquer comme livré (ajoute automatiquement la date)
   - **❌ Non livré** : Échec de livraison
   - **🔄 Retour** : Produit retourné

### Filtres et recherche

**Filtres disponibles :**
- **Recherche** : Nom client, numéro de livraison, numéro de suivi
- **Statut** : Filtrer par statut de livraison
- **Transporteur** : Filtrer par société de transport
- **Ville** : Filtrer par ville de livraison

**Utilisation :**
1. Saisissez vos critères dans les champs de filtre
2. Cliquez sur **"Rechercher"** ou appuyez sur Entrée
3. Utilisez **"Réinitialiser"** pour effacer tous les filtres

## Statistiques

Le tableau de bord affiche en temps réel :

- **En cours** : Nombre de livraisons en transit
- **Livrées** : Nombre de livraisons réussies
- **Non livrées** : Nombre d'échecs de livraison
- **Retours** : Nombre de retours
- **Total** : Nombre total de livraisons
- **Valeur** : Valeur totale des livraisons (en DH)

## Architecture technique

### Tables de base de données

**Table `livraisons` :**
- Informations principales (client, adresse, transporteur)
- Statut et dates de suivi
- Métadonnées (créé par, modifié par)

**Table `livraisons_articles` :**
- Détail des produits dans chaque livraison
- Statut individuel par article (optionnel)
- Liaison avec les articles de vente

### Triggers automatiques

1. **Création automatique** : Quand une vente "en_ligne" est créée
2. **Génération de numéro** : Format LIV-YYYYMMDD-XXXX
3. **Mise à jour des compteurs** : Nombre d'articles automatique
4. **Gestion des dates** : Dates de livraison automatiques

### Hooks React

**`useLivraisons`** fournit :
- `fetchLivraisons()` : Charger avec filtres
- `updateLivraisonStatut()` : Changer le statut
- `getLivraisonsStats()` : Statistiques
- `syncLivraisonsFromVentes()` : Synchronisation

## Workflow type

### Pour une nouvelle vente de type commande (livraison) :

1. **Client passe commande** → Vente créée avec `type_vente = 'commande (livraison)'`
2. **Trigger automatique** → Livraison créée avec statut `'en_cours'`
3. **Équipe logistique** → Assigne transporteur et met à jour
4. **Suivi** → Changement de statut selon l'avancement
5. **Livraison** → Statut final `'livre'` ou `'non_livre'`

### États possibles :

```
[Vente commande (livraison)] → [en_cours] → [livre]
                                        → [non_livre] → [retour]
                                        → [annule]
```

## Personnalisation

### Ajouter un transporteur

Les transporteurs sont extraits automatiquement des livraisons existantes. Pour ajouter un nouveau transporteur :

1. Modifiez une livraison existante
2. Ajoutez le nom du transporteur
3. Il apparaîtra automatiquement dans les filtres

### Ajouter des villes

Même principe que les transporteurs - les villes sont extraites des adresses de livraison.

### Modifier les statuts

Pour ajouter de nouveaux statuts, modifiez :

1. **Base de données** : Contrainte CHECK dans `create-livraisons-table.sql`
2. **Types TypeScript** : Interface `Livraison` dans `useLivraisons.ts`
3. **Interface** : Fonctions `getStatusColor`, `getStatusText`, `getStatusIcon` dans `Delivery.tsx`

## Dépannage

### Problème : Aucune livraison n'apparaît

**Solution :**
1. Vérifiez que vous avez des ventes avec `type_vente = 'en_ligne'`
2. Cliquez sur **"Synchroniser"** pour créer les livraisons manquantes
3. Vérifiez les permissions de la table `livraisons` dans Supabase

### Problème : Erreur lors du changement de statut

**Solution :**
1. Vérifiez votre connexion internet
2. Assurez-vous d'être connecté à l'application
3. Vérifiez les permissions d'écriture dans Supabase

### Problème : Données de test manquantes

**Solution :**
1. Exécutez d'abord `create-livraisons-table.sql`
2. Puis `insert-commandes-livraison-test.sql`
3. Rechargez la page des livraisons

## Support

Pour toute question ou problème :

1. Vérifiez d'abord ce README
2. Consultez les logs de la console du navigateur
3. Vérifiez les tables dans Supabase
4. Contactez l'équipe de développement

---

**Note :** Ce système est conçu pour fonctionner uniquement avec les ventes de type **"commande (livraison)"**. Les ventes en magasin, par téléphone, en ligne classiques ou commandes spéciales ne génèrent pas de livraisons automatiquement. 