// Configuration de l'entreprise GAMER STORE SARL
export const COMPANY_CONFIG = {
  nom: "GAMER STORE SARL",
  telephone: "+212613093858",
  adresse: "10 RUE AMRAH CHLOUH QUARTIER VIELLE MONTAGNE, Tanger",
  rc: "127475",
  if: "52468578",
  ice: "003040101000031",
  
  // Zone pour le logo - remplacez cette URL par votre logo
  logo: {
    // Collez ici l'URL de votre logo ou le chemin vers le fichier
    // Exemple: "/assets/logo-gamer-store.png" ou "data:image/png;base64,..."
    url: "/logo-gamer-store.jpg", // Logo GAMER STORE - Fichier JPG dans public/
    width: 80,
    height: 60,
    alt: "Logo GAMER STORE"
  },
  
  // Logo de fallback (actuel)
  logoFallback: {
    text: "GS",
    subtext: "GAMER\nSTORE",
    backgroundColor: "#000",
    color: "#fff"
  }
};

// Fonction pour convertir l'image en base64
export const convertImageToBase64 = async (imagePath: string): Promise<string> => {
  try {
    // Si c'est déjà une data URL, la retourner directement
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }

    // Créer un canvas pour convertir l'image
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Définir un fond blanc transparent pour éviter le fond noir
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, 0, 0);
          // Utiliser JPEG pour les images JPG, PNG pour les autres
          const imageFormat = imagePath.toLowerCase().includes('.jpg') || imagePath.toLowerCase().includes('.jpeg') ? 'image/jpeg' : 'image/png';
          const dataURL = canvas.toDataURL(imageFormat, 0.9);
          resolve(dataURL);
        } else {
          reject(new Error('Unable to get canvas context'));
        }
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${imagePath}`));
      };
      
      // Construire l'URL complète si c'est un chemin relatif
      const fullPath = imagePath.startsWith('/') ? window.location.origin + imagePath : imagePath;
      img.src = fullPath;
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
};

// Fonction pour obtenir le logo à utiliser
export const getCompanyLogo = () => {
  if (COMPANY_CONFIG.logo.url && COMPANY_CONFIG.logo.url.trim() !== "") {
    return {
      type: "image" as const,
      ...COMPANY_CONFIG.logo
    };
  }
  
  return {
    type: "fallback" as const,
    ...COMPANY_CONFIG.logoFallback
  };
};

// Fonction pour obtenir le logo en base64 pour le téléchargement
export const getCompanyLogoBase64 = async () => {
  const logo = getCompanyLogo();
  
  if (logo.type === "image") {
    try {
      // Utiliser une approche plus simple et fiable
      const base64Logo = await convertImageToBase64(logo.url);
      console.log('Logo base64 généré avec succès, longueur:', base64Logo.length);
      return {
        ...logo,
        url: base64Logo
      };
    } catch (error) {
      console.error('Error converting logo to base64:', error);
      // Fallback au logo textuel en cas d'erreur
      return {
        type: "fallback" as const,
        ...COMPANY_CONFIG.logoFallback
      };
    }
  }
  
  return logo;
}; 