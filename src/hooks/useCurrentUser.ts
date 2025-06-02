import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'member' | 'manager' | 'vendeur' | 'livreur';
  status: 'actif' | 'inactif';
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger l'utilisateur actuel et son profil
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtenir l'utilisateur authentifié
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      setUser(authUser);

      if (authUser) {
        // Obtenir le profil de l'utilisateur
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = pas de résultat trouvé
          throw profileError;
        }

        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Créer le profil s'il n'existe pas
          await createUserProfile(authUser);
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'utilisateur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Créer un profil utilisateur
  const createUserProfile = async (authUser: any) => {
    try {
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email || 'Utilisateur',
          role: 'member',
          status: 'actif'
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(newProfile);
      
      toast({
        title: "Profil créé",
        description: "Votre profil a été créé automatiquement",
      });
    } catch (err) {
      console.error('Erreur lors de la création du profil:', err);
      toast({
        title: "Attention",
        description: "Votre profil n'a pas pu être créé automatiquement",
        variant: "destructive",
      });
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(updatedProfile);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
      return false;
    }
  };

  // S'assurer que le profil existe (utile pour les ventes)
  const ensureProfile = async (): Promise<UserProfile | null> => {
    if (profile) return profile;
    
    if (user) {
      await createUserProfile(user);
      return profile;
    }
    
    return null;
  };

  // Écouter les changements d'authentification
  useEffect(() => {
    fetchCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchCurrentUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    updateProfile,
    ensureProfile,
    refetch: fetchCurrentUser,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isVendeur: profile?.role === 'vendeur' || profile?.role === 'admin'
  };
} 