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