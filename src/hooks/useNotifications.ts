import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Jouer le son de notification
  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.warn('Impossible de jouer le son de notification:', error);
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la lecture du son:', error);
    }
  };

  // Créer une notification pour une nouvelle tâche assignée
  const notifyTaskAssigned = async (taskData: any) => {
    const notification: NewNotification = {
      user_id: taskData.assigned_to_id,
      title: 'Nouvelle tâche assignée',
      message: `Vous avez une nouvelle tâche : "${taskData.task_title}"`,
      type: 'task_assigned',
      data: taskData
    };

    const success = await createNotification(notification);
    if (success) {
      // Jouer le son de notification
      playNotificationSound();
      
      // Afficher une toast si l'utilisateur est connecté
      if (user && user.id === taskData.assigned_to_id) {
        toast({
          title: 'Nouvelle tâche assignée',
          description: taskData.task_title,
        });
      }
    }
  };

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!user) return;

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
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          if (!newNotification.read) {
            setUnreadCount(prev => prev + 1);
            playNotificationSound();
            
            // Afficher une toast pour les nouvelles notifications
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Créer l'élément audio pour les sons de notification
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
    audioRef.current.preload = 'auto';
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    notifyTaskAssigned,
    playNotificationSound,
    refreshNotifications: fetchNotifications
  };
} 