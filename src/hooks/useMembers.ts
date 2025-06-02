import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Member {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'designer' | 'developper' | 'monteur' | 'vendeur';
  status: 'actif' | 'inactif';
  created_at: string;
  last_sign_in_at?: string;
}

export interface CreateMemberData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'designer' | 'developper' | 'monteur' | 'vendeur';
}

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all members from profiles table
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Gestion spécifique de l'erreur de récursion infinie
        if (error.code === '42P17' && error.message.includes('infinite recursion')) {
          toast({
            title: "Erreur de configuration",
            description: "Récursion infinie détectée dans les politiques RLS. Exécutez le script fix-rls-infinite-recursion.sql dans Supabase SQL Editor.",
            variant: "destructive",
          });
          throw new Error('RLS_INFINITE_RECURSION');
        }
        throw error;
      }

      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      
      if (error.message === 'RLS_INFINITE_RECURSION') {
        // L'erreur a déjà été gérée, ne pas afficher un toast supplémentaire
        return;
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new member with Supabase Auth Admin API
  const createMember = async (memberData: CreateMemberData): Promise<boolean> => {
    try {
      let authData: any = null;

      // Vérifier si le client admin est disponible
      if (!supabaseAdmin) {
        // Fallback : utiliser la méthode normale mais déconnecter après
        console.warn('Clé SERVICE_ROLE non configurée, utilisation de la méthode normale');
        
        const currentSession = await supabase.auth.getSession();
        
        const signUpResult = await supabase.auth.signUp({
          email: memberData.email,
          password: memberData.password,
          options: {
            data: {
              name: memberData.name,
              role: memberData.role,
            }
          }
        });

        if (signUpResult.error) {
          throw new Error(`Erreur de création d'utilisateur: ${signUpResult.error.message}`);
        }

        authData = signUpResult.data;

        // Restaurer la session précédente
        if (currentSession.data.session) {
          await supabase.auth.setSession(currentSession.data.session);
        }
      } else {
        // Utiliser l'API admin pour créer l'utilisateur sans affecter la session courante
        console.log('Utilisation de la clé SERVICE_ROLE pour la création sécurisée');
        
        const adminResult = await supabaseAdmin.auth.admin.createUser({
          email: memberData.email,
          password: memberData.password,
          email_confirm: true, // Auto-confirmer l'email
          user_metadata: {
            name: memberData.name,
            role: memberData.role,
          }
        });

        if (adminResult.error) {
          throw new Error(`Erreur de création d'utilisateur: ${adminResult.error.message}`);
        }

        authData = adminResult.data;
      }

      if (!authData?.user) {
        throw new Error('Aucun utilisateur créé');
      }

      // Créer le profil manuellement (sans compter sur le trigger)
      console.log('Création du profil utilisateur...');
      
      // Attendre un petit délai pour s'assurer que l'utilisateur auth est bien créé
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: memberData.email,
          name: memberData.name,
          role: memberData.role,
          status: 'actif'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Si c'est une erreur de duplication, essayer de mettre à jour
        if (profileError.message.includes('duplicate') || profileError.code === '23505') {
          console.log('Profil existe déjà, mise à jour...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email: memberData.email,
              name: memberData.name,
              role: memberData.role,
              status: 'actif',
              updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('Profile update error:', updateError);
            // Ne pas faire échouer la création pour ça
          }
        } else {
          // Pour les autres erreurs, log mais ne pas faire échouer
          console.warn('Impossible de créer le profil:', profileError.message);
          
          // Essayer une approche alternative avec moins de champs
          try {
            const { error: simpleProfileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: memberData.email,
                name: memberData.name,
                role: memberData.role
              });
            
            if (simpleProfileError) {
              console.error('Simple profile creation also failed:', simpleProfileError);
            } else {
              console.log('Profile créé avec approche simplifiée');
            }
          } catch (fallbackError) {
            console.error('Fallback profile creation failed:', fallbackError);
          }
        }
      } else {
        console.log('Profil créé avec succès');
      }

      toast({
        title: "Succès",
        description: `Membre ${memberData.name} créé avec succès`,
      });

      // Refresh the members list
      await fetchMembers();
      return true;
      
    } catch (error: any) {
      console.error('Error creating member:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = "Erreur lors de la création du membre";
      
      if (error.message.includes('Email address') && error.message.includes('invalid')) {
        errorMessage = "Format d'email invalide. Utilisez un email valide (ex: nom@domaine.com)";
      } else if (error.message.includes('User already registered')) {
        errorMessage = "Un utilisateur avec cet email existe déjà";
      } else if (error.message.includes('Password')) {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
      } else if (error.message.includes('signup')) {
        errorMessage = "L'inscription est temporairement désactivée. Contactez l'administrateur.";
      } else if (error.message.includes('Database error saving new user')) {
        errorMessage = "Erreur de base de données. Exécutez le script fix-database-user-creation.sql dans Supabase SQL Editor.";
      } else if (error.message.includes('relation "public.profiles" does not exist')) {
        errorMessage = "La table 'profiles' n'existe pas. Exécutez le script create-profiles-table.sql dans Supabase.";
      } else if (error.message.includes('SERVICE_ROLE')) {
        errorMessage = "Clé SERVICE_ROLE manquante. Ajoutez VITE_SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env";
      } else if (error.message.includes('unexpected_failure')) {
        errorMessage = "Erreur inattendue de la base de données. Vérifiez la configuration de la table profiles et exécutez fix-database-user-creation.sql";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Update member profile
  const updateMember = async (memberId: string, updates: Partial<Member>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Membre mis à jour avec succès",
      });

      await fetchMembers();
      return true;
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete member (Admin only - requires RLS policy)
  const deleteMember = async (memberId: string): Promise<boolean> => {
    try {
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (profileError) throw profileError;

      // Then delete the auth user (this requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(memberId);
      
      if (authError) {
        // If we can't delete the auth user, at least the profile is deleted
        console.error('Could not delete auth user:', authError);
      }

      toast({
        title: "Succès",
        description: "Membre supprimé avec succès",
      });

      await fetchMembers();
      return true;
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle member status
  const toggleMemberStatus = async (memberId: string, currentStatus: string): Promise<boolean> => {
    const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    return await updateMember(memberId, { status: newStatus });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    isLoading,
    createMember,
    updateMember,
    deleteMember,
    toggleMemberStatus,
    refetchMembers: fetchMembers,
  };
}; 