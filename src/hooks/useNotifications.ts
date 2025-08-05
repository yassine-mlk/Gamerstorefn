import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_completed' | 'task_updated' | 'general';
  data?: any;
  read: boolean;
  created_at: string;
}

export interface NewNotification {
  user_id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_completed' | 'task_updated' | 'general';
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les notifications existantes
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Jouer le son de notification
  const playNotificationSound = () => {
    try {
      console.log('playNotificationSound: Tentative de lecture du son');
      
      // Créer un nouvel élément audio à chaque fois pour éviter les problèmes de réutilisation
      const audio = new Audio('/sounds/notifs.mp3');
      audio.volume = 0.5;
      audio.preload = 'auto';
      
      // Essayer de jouer immédiatement
      audio.play().then(() => {
        console.log('playNotificationSound: Son joué avec succès');
      }).catch(error => {
        console.warn('playNotificationSound: Impossible de jouer le son immédiatement:', error);
        
        // Si l'audio n'est pas prêt, attendre qu'il soit prêt
        audio.addEventListener('canplaythrough', () => {
          console.log('playNotificationSound: Audio maintenant prêt, lecture...');
          audio.play().then(() => {
            console.log('playNotificationSound: Son joué après attente');
          }).catch(waitError => {
            console.error('playNotificationSound: Échec après attente:', waitError);
          });
        }, { once: true });
      });
      
    } catch (error) {
      console.warn('playNotificationSound: Erreur lors de la lecture du son:', error);
    }
  };

  // Créer une nouvelle notification
  const createNotification = async (notification: NewNotification): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => [data, ...prev]);
      if (!data.read) {
        setUnreadCount(prev => prev + 1);
        // Jouer le son pour les nouvelles notifications créées
        playNotificationSound();
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return false;
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return false;
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      return false;
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }
  };

  // Charger les notifications au montage et écouter les changements
  useEffect(() => {
    if (!user) {
      console.log('useNotifications: Pas d\'utilisateur connecté');
      return;
    }

    console.log('useNotifications: Configuration de l\'écoute en temps réel pour user:', user.id);

    // Charger les notifications existantes
    fetchNotifications();

    // Écouter les nouvelles notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('useNotifications: Nouvelle notification reçue:', payload);
          console.log('useNotifications: Type d\'événement:', payload.eventType);
          console.log('useNotifications: Données reçues:', payload.new);
          
          const newNotification = payload.new as Notification;
          console.log('useNotifications: Notification parsée:', newNotification);
          console.log('useNotifications: Notification lue?', newNotification.read);
          
          setNotifications(prev => [newNotification, ...prev]);
          if (!newNotification.read) {
            console.log('useNotifications: Notification non lue, mise à jour du compteur');
            setUnreadCount(prev => prev + 1);
            
            // Jouer le son pour TOUTES les nouvelles notifications
            console.log('useNotifications: Déclenchement du son pour notification reçue');
            playNotificationSound();
            
            // Afficher une toast pour les nouvelles notifications
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          } else {
            console.log('useNotifications: Notification déjà lue, pas de son ni de toast');
          }
        }
      )
      .subscribe((status) => {
        console.log('useNotifications: Statut de la souscription:', status);
      });

    return () => {
      console.log('useNotifications: Nettoyage du channel');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Note: Nous créons un nouvel élément audio à chaque appel de playNotificationSound
  // pour éviter les problèmes de réutilisation et de synchronisation

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    playNotificationSound,
    refreshNotifications: fetchNotifications
  };
} 