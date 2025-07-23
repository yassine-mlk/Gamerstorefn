import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'manager' | 'vendeur' | 'livreur' | 'monteur';
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, userData: { name: string; role?: 'admin' | 'member' | 'manager' | 'vendeur' | 'livreur' | 'monteur' }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Fonctions de tracking simplifiées (sans hook)
const getPublicIP = async (): Promise<string | null> => {
  try {
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://httpbin.org/ip'
    ];

    for (const service of services) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(service, { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.ip) return data.ip;
        if (data.origin) return data.origin;
        
      } catch (serviceError) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur IP:', error);
    return null;
  }
};

const createSessionRecord = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Vérifier si la table existe
    const { error: checkError } = await supabase
      .from('member_sessions')
      .select('id')
      .limit(1);

    if (checkError) {
      console.warn('Table member_sessions non disponible');
      return;
    }

    // D'abord, fermer toutes les sessions actives de cet utilisateur
    await supabase
      .from('member_sessions')
      .update({ 
        logout_time: new Date().toISOString(),
        is_active: false 
      })
      .eq('user_id', user.id)
      .eq('is_active', true);

    const userAgent = navigator.userAgent;
    const ip = await getPublicIP();
    
    // Détection basique
    const detectOS = (ua: string) => {
      if (ua.includes('Windows')) return 'Windows';
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
      if (ua.includes('Android')) return 'Android';
      return 'Unknown';
    };

    const detectBrowser = (ua: string) => {
      if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Edg')) return 'Edge';
      return 'Unknown';
    };

    const detectDevice = (ua: string) => {
      if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
        if (/iPad/i.test(ua)) return 'tablet';
        return 'mobile';
      }
      return 'desktop';
    };

    const sessionData = {
      user_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
      operating_system: detectOS(userAgent),
      browser: detectBrowser(userAgent),
      device_type: detectDevice(userAgent),
      is_active: true
    };

    const { error } = await supabase.from('member_sessions').insert(sessionData);
    
    if (error) {
      console.error('Erreur création session:', error);
    } else {
      console.log('Session créée avec succès');
    }
  } catch (error) {
    console.error('Erreur session:', error);
  }
};

const endSessionRecord = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('member_sessions')
      .update({ 
        logout_time: new Date().toISOString(),
        is_active: false 
      })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Erreur fin session:', error);
    } else {
      console.log('Session fermée avec succès');
    }
  } catch (error) {
    console.error('Erreur fin session:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour convertir un utilisateur Supabase en User local
  const transformSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: supabaseUser.user_metadata?.role || 'member',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
    };
  };

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        }
        
        if (session?.user) {
          const transformedUser = transformSupabaseUser(session.user);
          setUser(transformedUser);
          // Créer une session de tracking
          createSessionRecord();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const transformedUser = transformSupabaseUser(session.user);
        setUser(transformedUser);
        // Créer une session de tracking
        createSessionRecord();
      } else if (event === 'SIGNED_OUT') {
        // Terminer la session de tracking
        endSessionRecord();
        setUser(null);
      }
      setIsLoading(false);
    });

    // Gérer la fermeture de page/onglet
    const handleBeforeUnload = () => {
      endSessionRecord();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Pas de dépendances pour éviter les boucles

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const transformedUser = transformSupabaseUser(data.user);
        setUser(transformedUser);
        
        // Créer une session de tracking
        createSessionRecord();
        
        // Nettoyer les données de navigation potentiellement corrompues
        localStorage.removeItem('lastVisitedPath');
        sessionStorage.removeItem('redirectTo');
        sessionStorage.removeItem('lastRoute');
        
        // Forcer la redirection vers la page d'accueil
        if (window.location.pathname !== '/' && 
            window.location.pathname !== '/dashboard' && 
            window.location.pathname !== '/member-dashboard') {
          window.history.replaceState(null, '', '/');
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role?: 'admin' | 'member' | 'manager' | 'vendeur' | 'livreur' | 'monteur' }): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'member',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // L'utilisateur devra confirmer son email avant de pouvoir se connecter
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Terminer la session de tracking avant la déconnexion
      endSessionRecord();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}; 