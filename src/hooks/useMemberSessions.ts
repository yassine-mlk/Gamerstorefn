import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MemberSession {
  id: string;
  user_id: string;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  user_agent?: string;
  operating_system?: string;
  browser?: string;
  device_type?: string;
  location_country?: string;
  location_city?: string;
  is_active: boolean;
  session_duration?: string;
}

export interface MemberLastSession {
  user_id: string;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  operating_system?: string;
  browser?: string;
  device_type?: string;
  location_country?: string;
  location_city?: string;
  is_active: boolean;
}

// Variable pour vérifier si la table existe
let tableExists: boolean | null = null;

// Fonction pour vérifier si la table member_sessions existe
const checkTableExists = async (): Promise<boolean> => {
  if (tableExists !== null) return tableExists;
  
  try {
    const { error } = await supabase
      .from('member_sessions')
      .select('id')
      .limit(1);
    
    tableExists = !error;
    return tableExists;
  } catch (error) {
    console.warn('Table member_sessions non trouvée. Le tracking des sessions est désactivé.');
    tableExists = false;
    return false;
  }
};

// Fonction pour détecter l'OS depuis le user agent
const detectOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Android')) return 'Android';
  return 'Unknown';
};

// Fonction pour détecter le navigateur
const detectBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

// Fonction pour détecter le type d'appareil
const detectDeviceType = (userAgent: string): string => {
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad/i.test(userAgent)) return 'tablet';
    return 'mobile';
  }
  return 'desktop';
};

// Fonction pour obtenir l'IP publique - Version améliorée
const getPublicIP = async (): Promise<string | null> => {
  try {
    // Essayer plusieurs services d'IP pour plus de fiabilité
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://httpbin.org/ip'
    ];

    for (const service of services) {
      try {
        // Utiliser AbortController pour le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(service, { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        // Gérer les différents formats de réponse
        if (data.ip) return data.ip;
        if (data.origin) return data.origin; // httpbin format
        
      } catch (serviceError) {
        console.warn(`Service IP ${service} failed:`, serviceError);
        continue;
      }
    }
    
    console.warn('Tous les services d\'IP ont échoué');
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'IP:', error);
    return null;
  }
};

export const useMemberSessions = () => {
  const [sessions, setSessions] = useState<MemberSession[]>([]);
  const [lastSessions, setLastSessions] = useState<MemberLastSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Créer une nouvelle session lors de la connexion
  const createSession = async (): Promise<boolean> => {
    try {
      // Vérifier si la table existe
      const exists = await checkTableExists();
      if (!exists) {
        console.warn('Table member_sessions non disponible. Session non trackée.');
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

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
      
      const sessionData = {
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
        operating_system: detectOS(userAgent),
        browser: detectBrowser(userAgent),
        device_type: detectDeviceType(userAgent),
        is_active: true
      };

      const { error } = await supabase
        .from('member_sessions')
        .insert(sessionData);

      if (error) {
        console.error('Erreur lors de la création de session:', error);
        return false;
      }

      console.log('Session créée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la création de session:', error);
      return false;
    }
  };

  // Terminer une session lors de la déconnexion
  const endSession = async (): Promise<boolean> => {
    try {
      // Vérifier si la table existe
      const exists = await checkTableExists();
      if (!exists) {
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('member_sessions')
        .update({ 
          logout_time: new Date().toISOString(),
          is_active: false 
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Erreur lors de la fin de session:', error);
        return false;
      }

      console.log('Session fermée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la fin de session:', error);
      return false;
    }
  };

  // Nettoyer les sessions zombies (sessions actives depuis plus de 24h)
  const cleanZombieSessions = async () => {
    try {
      const exists = await checkTableExists();
      if (!exists) return;

      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      await supabase
        .from('member_sessions')
        .update({ 
          logout_time: new Date().toISOString(),
          is_active: false 
        })
        .eq('is_active', true)
        .lt('login_time', yesterday.toISOString());

      console.log('Sessions zombies nettoyées');
    } catch (error) {
      console.error('Erreur lors du nettoyage des sessions zombies:', error);
    }
  };

  // Récupérer toutes les sessions (admin seulement)
  const fetchAllSessions = async () => {
    try {
      const exists = await checkTableExists();
      if (!exists) {
        setSessions([]);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('member_sessions')
        .select('*')
        .order('login_time', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les dernières sessions par utilisateur (admin seulement)
  const fetchLastSessions = async () => {
    try {
      const exists = await checkTableExists();
      if (!exists) {
        setLastSessions([]);
        return;
      }

      setIsLoading(true);
      
      // Nettoyer d'abord les sessions zombies
      await cleanZombieSessions();

      const { data, error } = await supabase
        .from('member_last_sessions')
        .select('*');

      if (error) {
        console.error('Erreur vue member_last_sessions:', error);
        // Fallback : requête directe
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('member_sessions')
          .select('user_id, login_time, logout_time, ip_address, operating_system, browser, device_type, location_country, location_city, is_active')
          .order('user_id, login_time', { ascending: false });

        if (fallbackError) throw fallbackError;

        // Grouper par user_id et prendre le plus récent
        const groupedSessions = new Map();
        fallbackData?.forEach(session => {
          if (!groupedSessions.has(session.user_id)) {
            groupedSessions.set(session.user_id, session);
          }
        });

        setLastSessions(Array.from(groupedSessions.values()));
        return;
      }

      setLastSessions(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des dernières sessions:', error);
      setLastSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les sessions d'un utilisateur spécifique
  const fetchUserSessions = async (userId: string) => {
    try {
      const exists = await checkTableExists();
      if (!exists) {
        setSessions([]);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('member_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('login_time', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions utilisateur:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Nettoyer les anciennes sessions (admin seulement)
  const cleanOldSessions = async (daysOld: number = 30): Promise<boolean> => {
    try {
      const exists = await checkTableExists();
      if (!exists) {
        return false;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('member_sessions')
        .delete()
        .lt('login_time', cutoffDate.toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du nettoyage des sessions:', error);
      return false;
    }
  };

  // Formater la durée de session
  const formatSessionDuration = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  // Formater la date de connexion
  const formatLoginTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    sessions,
    lastSessions,
    isLoading,
    createSession,
    endSession,
    fetchAllSessions,
    fetchLastSessions,
    fetchUserSessions,
    cleanOldSessions,
    cleanZombieSessions,
    formatSessionDuration,
    formatLoginTime
  };
}; 