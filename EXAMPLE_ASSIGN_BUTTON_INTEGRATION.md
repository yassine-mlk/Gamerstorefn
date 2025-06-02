# Guide d'intégration du bouton d'assignation

Ce document montre comment ajouter le bouton d'assignation de produits dans toutes les pages de produits.

## Étapes d'intégration

### 1. Importer le composant

Dans chaque page de produit, ajouter ces imports :

```typescript
import { UserPlus } from "lucide-react";
import { AssignProductDialog } from "@/components/AssignProductDialog";
```

### 2. Ajouter le bouton dans la section des actions

Pour chaque produit affiché, ajouter le bouton d'assignation dans la zone des actions :

```tsx
{/* Section actions existante */}
<div className="flex gap-2">
  {/* Boutons existants (Modifier, Supprimer, etc.) */}
</div>

{/* Nouveau bouton d'assignation */}
<AssignProductDialog
  productId={product.id}
  productType="TYPE_DU_PRODUIT" // Voir types disponibles ci-dessous
  productName={product.nom_produit}
  productCode={product.code_barre}
  trigger={
    <Button
      variant="outline"
      size="sm"
      className="w-full border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
    >
      <UserPlus className="w-4 h-4 mr-2" />
      Assigner à l'équipe
    </Button>
  }
/>
```

### 3. Types de produits disponibles

Utilisez le bon type selon la page :

- `pc_portable` - pour la page PC Portables
- `pc_gamer` - pour la page PC Gamer  
- `moniteur` - pour la page Moniteurs
- `chaise_gaming` - pour la page Chaises Gaming
- `peripherique` - pour la page Périphériques
- `composant_pc` - pour la page Composants PC

## Exemples spécifiques par page

### Page Moniteurs

```tsx
// Import à ajouter
import { UserPlus } from "lucide-react";
import { AssignProductDialog } from "@/components/AssignProductDialog";

// Dans la section actions du produit
<AssignProductDialog
  productId={moniteur.id}
  productType="moniteur"
  productName={moniteur.nom_produit}
  productCode={moniteur.code_barre}
  trigger={
    <Button
      variant="outline"
      size="sm"
      className="w-full border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
    >
      <UserPlus className="w-4 h-4 mr-2" />
      Assigner à l'équipe
    </Button>
  }
/>
```

### Page Chaises Gaming

```tsx
// Import à ajouter
import { UserPlus } from "lucide-react";
import { AssignProductDialog } from "@/components/AssignProductDialog";

// Dans la section actions du produit
<AssignProductDialog
  productId={chaise.id}
  productType="chaise_gaming"
  productName={chaise.nom_produit}
  productCode={chaise.code_barre}
  trigger={
    <Button
      variant="outline"
      size="sm"
      className="w-full border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
    >
      <UserPlus className="w-4 h-4 mr-2" />
      Assigner à l'équipe
    </Button>
  }
/>
```

### Page Périphériques

```tsx
// Import à ajouter
import { UserPlus } from "lucide-react";
import { AssignProductDialog } from "@/components/AssignProductDialog";

// Dans la section actions du produit
<AssignProductDialog
  productId={peripherique.id}
  productType="peripherique"
  productName={peripherique.nom_produit}
  productCode={peripherique.code_barre}
  trigger={
    <Button
      variant="outline"
      size="sm"
      className="w-full border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
    >
      <UserPlus className="w-4 h-4 mr-2" />
      Assigner à l'équipe
    </Button>
  }
/>
```

## Structure recommandée pour les actions

Pour une meilleure organisation, structurer les actions comme suit :

```tsx
<div className="border-t border-gray-700 pt-3 space-y-3">
  {/* Première ligne : actions principales */}
  <div className="flex justify-between items-center">
    <Button>Voir détails</Button>
    <div className="flex gap-2">
      <Button>Modifier</Button>
      <Button>Supprimer</Button>
    </div>
  </div>
  
  {/* Deuxième ligne : bouton d'assignation */}
  <AssignProductDialog
    productId={product.id}
    productType="TYPE_PRODUIT"
    productName={product.nom_produit}
    productCode={product.code_barre}
    trigger={
      <Button className="w-full" variant="outline">
        <UserPlus className="w-4 h-4 mr-2" />
        Assigner à l'équipe
      </Button>
    }
  />
</div>
```

## Notes importantes

1. **ID du produit** : Assurez-vous que `product.id` existe et est valide
2. **Nom du produit** : Utilisez le champ approprié selon votre structure de données
3. **Code-barres** : Peut être optionnel, passez `undefined` si non disponible
4. **Type de produit** : Doit correspondre exactement aux types définis dans le hook

## Test

Après intégration, vérifiez que :
- Le bouton s'affiche correctement
- Le modal s'ouvre au clic
- Les informations du produit sont correctement pré-remplies
- L'assignation fonctionne et crée une nouvelle tâche
- La tâche apparaît dans l'espace membre 