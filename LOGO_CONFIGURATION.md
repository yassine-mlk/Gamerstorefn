# Configuration du Logo GAMER STORE

## Comment ajouter votre logo

### 1. Préparer votre logo
- Format recommandé : PNG ou JPG
- Taille recommandée : 80x60 pixels (ou proportions similaires)
- Fond transparent de préférence (PNG)

### 2. Méthodes d'ajout du logo

#### Option A : Fichier local
1. Placez votre logo dans le dossier `public/assets/`
2. Exemple : `public/assets/logo-gamer-store.png`
3. Modifiez le fichier `src/lib/companyConfig.ts` :

```typescript
logo: {
  url: "/assets/logo-gamer-store.png", // ← Remplacez par le chemin de votre logo
  width: 80,
  height: 60,
  alt: "Logo GAMER STORE"
}
```

#### Option B : URL externe
Si votre logo est hébergé en ligne :

```typescript
logo: {
  url: "https://votre-site.com/logo.png", // ← URL de votre logo
  width: 80,
  height: 60,
  alt: "Logo GAMER STORE"
}
```

#### Option C : Base64 (pour un logo intégré)
Si vous voulez intégrer le logo directement dans le code :

```typescript
logo: {
  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // ← Votre logo en base64
  width: 80,
  height: 60,
  alt: "Logo GAMER STORE"
}
```

### 3. Emplacement du fichier de configuration

Le fichier à modifier se trouve ici : `src/lib/companyConfig.ts`

```typescript
export const COMPANY_CONFIG = {
  // ... autres informations ...
  
  logo: {
    url: "", // ← ZONE À REMPLIR AVEC VOTRE LOGO
    width: 80,
    height: 60,
    alt: "Logo GAMER STORE"
  },
  
  // ... reste de la configuration ...
};
```

### 4. Où apparaît le logo

Le logo apparaîtra automatiquement sur :
- ✅ **Factures** (format GAMER STORE)
- ✅ **Certificats de garantie**
- ✅ **Tickets de caisse** (si configuré)

### 5. Logo de fallback

Si aucun logo n'est configuré, le système utilise automatiquement le logo de fallback actuel (carré noir avec "GS").

### 6. Test du logo

Après avoir configuré votre logo :
1. Allez dans **Ventes** dans la sidebar
2. Cliquez sur **Aperçu** pour une facture existante
3. Vérifiez que votre logo s'affiche correctement

### 7. Ajustement de la taille

Si votre logo ne s'affiche pas correctement, ajustez les valeurs `width` et `height` :

```typescript
logo: {
  url: "/assets/votre-logo.png",
  width: 100,  // ← Ajustez selon vos besoins
  height: 75,  // ← Ajustez selon vos besoins
  alt: "Logo GAMER STORE"
}
```

### 8. Formats supportés

- ✅ PNG (recommandé)
- ✅ JPG/JPEG
- ✅ SVG
- ✅ Base64
- ✅ URLs externes

### 9. Conseils

- **Qualité** : Utilisez un logo haute résolution pour un rendu net à l'impression
- **Contraste** : Assurez-vous que le logo est visible sur fond blanc
- **Taille** : Ne dépassez pas 150x100 pixels pour éviter les problèmes de mise en page
- **Format** : PNG avec fond transparent pour un meilleur rendu

### 10. Dépannage

**Le logo ne s'affiche pas :**
- Vérifiez le chemin du fichier
- Assurez-vous que le fichier existe
- Vérifiez les permissions du fichier

**Le logo est déformé :**
- Ajustez les valeurs `width` et `height`
- Respectez les proportions originales

**Le logo est trop grand/petit :**
- Modifiez les valeurs `width` et `height`
- Testez avec l'aperçu des factures

---

## Support

Pour toute question sur la configuration du logo, consultez ce fichier ou contactez le support technique. 