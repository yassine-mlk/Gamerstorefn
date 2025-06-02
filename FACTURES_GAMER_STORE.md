# Système de Facturation GAMER STORE

## Vue d'ensemble

Ce système reproduit fidèlement le format de facture utilisé par GAMER STORE SARL, avec un design professionnel et toutes les informations légales requises au Maroc. Il inclut également un système de génération de garanties.

## Fonctionnalités

### ✅ Format de Facture Identique
- **Logo Personnalisable** : Zone dédiée pour votre logo (voir `LOGO_CONFIGURATION.md`)
- **En-tête** : Logo avec GAMER STORE, titre "Facture", nom de l'entreprise
- **Informations de Facture** : Numéro, date, informations client
- **QR Code** : Génération automatique pour chaque facture
- **Tableau Produits** : Format identique avec ID, nom, prix, quantité, total
- **Totaux** : HT, TVA 20%, frais livraison, total TTC
- **Montant en Lettres** : Conversion automatique en français (dirhams et centimes)
- **Pied de Page** : Téléphone, adresse, RC, IF, ICE

### ✅ Système de Garantie
- **Certificat Professionnel** : Design doré avec informations complètes
- **Durée** : Garantie automatique de 12 mois
- **QR Code** : Vérification de validité
- **Conditions** : Termes et conditions détaillés
- **Signatures** : Zones pour vendeur et client

### ✅ Composants Créés

#### 1. **InvoiceGenerator** (`src/components/InvoiceGenerator.tsx`)
Composant principal qui génère les factures au format HTML/CSS avec :
- Boutons : Aperçu, Impression, Téléchargement
- Génération HTML complète avec styles inline
- Support logo personnalisé
- Format responsive pour impression

#### 2. **WarrantyGenerator** (`src/components/WarrantyGenerator.tsx`)
Composant pour générer les certificats de garantie :
- Design professionnel doré
- Informations d'achat et période de garantie
- Conditions détaillées
- QR code de vérification

#### 3. **InvoicePreview** (`src/components/InvoicePreview.tsx`)
Modal de prévisualisation qui affiche :
- Facture en taille réelle dans un modal
- Interface de contrôle (imprimer, télécharger)
- Rendu identique à l'impression

#### 4. **POSInvoiceGenerator** (`src/components/POSInvoiceGenerator.tsx`)
Modal spécialisé pour le point de vente :
- Confirmation de vente réussie
- Accès rapide aux options de facturation
- Bouton "Nouvelle vente"

#### 5. **Configuration Centralisée** (`src/lib/companyConfig.ts`)
Fichier de configuration pour :
- Informations de l'entreprise
- Configuration du logo
- Gestion du logo de fallback

### ✅ Intégrations

#### Page des Ventes (Principal)
- **Intégré dans `Sales.tsx`** avec boutons dédiés
- **Nouveau générateur de facture** : Boutons Aperçu, Impression, Téléchargement
- **Générateur de garantie** : Boutons avec style doré
- **Ancien système** : Maintenu pour compatibilité (bouton grisé)

#### Point de Vente
- Intégré dans `PointOfSale.tsx`
- Génération automatique après validation vente
- Modal de confirmation avec options facturation

#### Gestion des Ventes
- Intégré dans `VenteDetailsModal.tsx`
- Boutons additionnels pour nouveau format
- Maintien de l'ancien système pour compatibilité

## Installation et Configuration

### Dépendances Installées
```bash
npm install qrcode @types/qrcode
```

### Fichiers Créés
```
src/
├── components/
│   ├── InvoiceGenerator.tsx
│   ├── InvoicePreview.tsx
│   ├── WarrantyGenerator.tsx
│   └── POSInvoiceGenerator.tsx
├── lib/
│   ├── qrCodeGenerator.ts
│   └── companyConfig.ts
└── LOGO_CONFIGURATION.md
```

### Configuration du Logo
Voir le fichier `LOGO_CONFIGURATION.md` pour les instructions détaillées.

## Utilisation

### 1. Depuis la Page des Ventes (Recommandé)
1. Allez dans **Ventes** depuis la sidebar
2. Pour chaque vente, utilisez les boutons :
   - **Aperçu/Imprimer/Télécharger** (facture GAMER STORE)
   - **Aperçu Garantie/Imprimer/Télécharger** (certificat de garantie)

### 2. Depuis le Point de Vente
```tsx
import { POSInvoiceGenerator } from '@/components/POSInvoiceGenerator';

// Après une vente réussie
<POSInvoiceGenerator
  vente={venteData}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onNewSale={() => startNewSale()}
/>
```

### 3. Depuis la Gestion des Ventes
```tsx
import { InvoiceGenerator } from '@/components/InvoiceGenerator';
import { WarrantyGenerator } from '@/components/WarrantyGenerator';

// Dans le modal de détails vente
<InvoiceGenerator vente={vente} />
<WarrantyGenerator vente={vente} />
```

## Format de Données

### Structure Vente Requise
```typescript
interface Vente {
  numero_vente: string;        // "210/2025"
  date_vente: string;          // ISO date
  client_nom: string;          // "LEONARDO 3D METROLOGY"
  client_email?: string;       // Utilisé pour ICE
  total_ht: number;           // 2483.00
  tva: number;                // 496.6
  total_ttc: number;          // 2979.6
  frais_livraison?: number;   // 0
  articles: VenteArticle[];   // Liste des produits
}
```

### Structure Article
```typescript
interface VenteArticle {
  nom_produit: string;         // "Système windows 11"
  prix_unitaire_ttc: number;  // 150.00
  quantite: number;           // 2
  total_ttc: number;          // 300.00
}
```

## Configuration Entreprise

Les informations sont centralisées dans `src/lib/companyConfig.ts` :

```typescript
export const COMPANY_CONFIG = {
  nom: "GAMER STORE SARL",
  telephone: "+212613093858",
  adresse: "10 RUE AMRAH CHLOUH QUARTIER VIELLE MONTAGNE, Tanger",
  rc: "127475",
  if: "52468578",
  ice: "003040101000031",
  
  logo: {
    url: "", // ← ZONE LOGO À REMPLIR
    width: 80,
    height: 60,
    alt: "Logo GAMER STORE"
  }
};
```

## Fonctionnalités Avancées

### QR Codes
- **Facture** : Informations complètes (numéro, client, montant, statut)
- **Garantie** : Code de vérification simple
- **Paiement** : Format bancaire marocain pour paiement mobile

### Montant en Lettres
Conversion automatique des montants :
- `2979.6` → "deux mille neuf cent soixante-dix-neuf dirhams et soixante centimes"

### Impression
- CSS optimisé pour impression A4
- Marges et tailles adaptées
- Suppression des éléments non-imprimables

### Téléchargement
- Export HTML avec styles inline
- Noms de fichiers automatiques : `Facture_210-2025.html`, `Garantie_210-2025.html`

## Test et Validation

### Depuis la Page des Ventes
1. Allez dans **Ventes** dans la sidebar
2. Cliquez sur **Aperçu** pour une facture existante
3. Testez **Aperçu Garantie** pour un certificat
4. Vérifiez l'affichage du logo si configuré

## Maintenance

### Modifier les Informations Entreprise
Mettre à jour `src/lib/companyConfig.ts`

### Ajouter de Nouveaux Formats
Créer de nouveaux composants basés sur `InvoiceGenerator.tsx` ou `WarrantyGenerator.tsx`

### Personnaliser le QR Code
Modifier `QRCodeGenerator.ts` pour inclure d'autres informations

## Changements Récents

### ✅ Intégration Complète
- Suppression de la page de test `/invoice-test`
- Intégration directe dans la page **Ventes**
- Boutons dédiés pour chaque vente

### ✅ Logo Personnalisable
- Zone dédiée pour le logo du magasin
- Support multiple formats (PNG, JPG, SVG, Base64, URL)
- Documentation complète dans `LOGO_CONFIGURATION.md`

### ✅ Système de Garantie
- Certificats professionnels avec design doré
- Garantie automatique de 12 mois
- QR codes de vérification

## Support

Pour toute question :
1. Consulter `LOGO_CONFIGURATION.md` pour le logo
2. Vérifier les données dans `hooks/useVentes.ts`
3. Tester depuis la page **Ventes**

## Notes Importantes

- Le système maintient la compatibilité avec l'ancien générateur PDF
- Les QR codes sont générés côté client
- L'impression utilise les media queries CSS `@media print`
- Le format est optimisé pour le Maroc (dirham, français, format A4)
- **Accès principal** : Page **Ventes** → Boutons sur chaque vente 