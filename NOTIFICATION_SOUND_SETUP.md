# 🔊 Configuration du Son de Notification

## 📁 Emplacement du fichier audio

Le fichier de son de notification doit être placé dans :
```
public/sounds/notification.mp3
```

## 🎵 Format recommandé

- **Format** : MP3
- **Durée** : 1-3 secondes
- **Volume** : Modéré (pas trop fort)
- **Fréquence** : 44.1 kHz
- **Bitrate** : 128 kbps minimum

## 📥 Comment ajouter le son

### Option 1 : Télécharger un son existant
1. Téléchargez un fichier MP3 de notification
2. Renommez-le en `notification.mp3`
3. Placez-le dans le dossier `public/sounds/`

### Option 2 : Créer un son personnalisé
Vous pouvez utiliser des outils en ligne comme :
- [Online Tone Generator](https://www.szynalski.com/tone-generator/)
- [Bfxr](https://www.bfxr.net/) (pour les sons 8-bit)
- [Audacity](https://www.audacityteam.org/) (pour l'édition audio)

### Option 3 : Utiliser un son système
Vous pouvez copier un son système de votre OS :
- **macOS** : `/System/Library/Sounds/`
- **Windows** : `C:\Windows\Media\`
- **Linux** : `/usr/share/sounds/`

## 🔧 Configuration dans le code

Le son est configuré dans `src/hooks/useNotifications.ts` :

```typescript
// Créer l'élément audio pour les sons de notification
useEffect(() => {
  audioRef.current = new Audio('/sounds/notification.mp3');
  audioRef.current.volume = 0.5; // Volume à 50%
  audioRef.current.preload = 'auto';
}, []);
```

## ⚙️ Personnalisation

### Changer le volume
Modifiez la ligne `volume` dans le hook :
```typescript
audioRef.current.volume = 0.3; // Volume à 30%
```

### Changer le fichier audio
1. Remplacez le fichier `notification.mp3`
2. Ou modifiez le chemin dans le code :
```typescript
audioRef.current = new Audio('/sounds/votre-son.mp3');
```

### Désactiver le son
Commentez la ligne de lecture dans `playNotificationSound()` :
```typescript
const playNotificationSound = () => {
  // audioRef.current?.play(); // Désactivé
};
```

## 🧪 Test du son

1. Assurez-vous que le fichier `notification.mp3` existe dans `public/sounds/`
2. Ouvrez la console du navigateur
3. Testez manuellement :
```javascript
const audio = new Audio('/sounds/notification.mp3');
audio.play();
```

## 📱 Compatibilité navigateur

- ✅ **Chrome/Edge** : Support complet
- ✅ **Firefox** : Support complet
- ✅ **Safari** : Support complet (peut nécessiter une interaction utilisateur)
- ⚠️ **Mobile** : Certains navigateurs mobiles peuvent bloquer l'audio automatique

## 🔒 Permissions

Pour que le son fonctionne correctement :
1. L'utilisateur doit avoir interagi avec la page au moins une fois
2. Le navigateur doit autoriser l'audio
3. Le volume du système ne doit pas être coupé

## 🎯 Sons recommandés

Voici quelques suggestions de sons appropriés :
- Son de cloche doux
- Bip court et professionnel
- Notification discrète
- Son de type "ping"

## 🚨 Dépannage

### Le son ne joue pas
1. Vérifiez que le fichier existe dans `public/sounds/`
2. Vérifiez la console pour les erreurs
3. Testez avec un autre fichier audio
4. Vérifiez les permissions du navigateur

### Le son est trop fort/faible
1. Modifiez le volume dans le code
2. Éditez le fichier audio pour ajuster le volume
3. Vérifiez le volume du système

### Erreur de CORS
1. Assurez-vous que le fichier est dans le dossier `public/`
2. Vérifiez que le serveur sert correctement les fichiers statiques 