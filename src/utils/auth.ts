export const AUTH_STORAGE_KEYS = {
  USER: 'gamerstore_user',
  TOKEN: 'gamerstore_token',
} as const;

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Fonction pour valider un token (simulation)
export const validateToken = (token: string): boolean => {
  if (!token) return false;
  
  // Ici vous pourriez vérifier l'expiration du token, sa signature, etc.
  // Pour la démo, on considère les tokens de test comme valides
  const validDemoTokens = ['demo-admin-token', 'demo-member-token'];
  
  return validDemoTokens.includes(token) || token.length > 10;
};

// Fonction pour nettoyer les données d'authentification
export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
};

// Fonction pour sauvegarder les données d'authentification
export const saveAuthData = (user: User, token: string): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
};

// Fonction pour récupérer les données d'authentification
export const getAuthData = (): { user: User | null; token: string | null } => {
  try {
    const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    
    if (!userStr || !token) {
      return { user: null, token: null };
    }
    
    const user = JSON.parse(userStr) as User;
    
    // Valider le token avant de retourner les données
    if (!validateToken(token)) {
      clearAuthData();
      return { user: null, token: null };
    }
    
    return { user, token };
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'authentification:', error);
    clearAuthData();
    return { user: null, token: null };
  }
};

// Fonction pour simuler un appel API de connexion
export const loginAPI = async (email: string, password: string): Promise<AuthResponse> => {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Comptes de test
  if (email === 'admin@gamerstore.com' && password === 'admin123') {
    return {
      user: {
        id: '1',
        email: 'admin@gamerstore.com',
        role: 'admin',
        name: 'Administrateur',
      },
      token: 'demo-admin-token',
    };
  }
  
  if (email === 'membre@gamerstore.com' && password === 'membre123') {
    return {
      user: {
        id: '2',
        email: 'membre@gamerstore.com',
        role: 'member',
        name: 'Membre',
      },
      token: 'demo-member-token',
    };
  }
  
  throw new Error('Identifiants incorrects');
}; 