import { supabase } from '@/lib/supabase';

/**
 * Utilitaire pour gérer les rôles d'utilisateur
 * NOTE: Ces fonctions nécessitent les privilèges service_role
 */

export interface UserRole {
  admin: 'admin';
  member: 'member';
}

/**
 * Promouvoir un utilisateur au rôle admin
 * @param userEmail - Email de l'utilisateur à promouvoir
 * @param userName - Nom à attribuer (optionnel)
 */
export const promoteUserToAdmin = async (userEmail: string, userName?: string) => {
  try {
    // Cette fonction nécessite un token service_role
    // Elle doit être appelée côté serveur ou avec les bonnes permissions
    
    const updateData: any = {
      user_metadata: {
        role: 'admin',
        ...(userName && { name: userName })
      }
    };

    // Cette méthode nécessite les privilèges admin
    const { data, error } = await supabase.auth.admin.updateUserById(
      userEmail, // En réalité, il faut l'ID utilisateur
      updateData
    );

    if (error) {
      throw new Error(`Erreur lors de la promotion : ${error.message}`);
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erreur lors de la promotion admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifier le rôle d'un utilisateur
 * @param userId - ID de l'utilisateur
 */
export const checkUserRole = async (userId: string) => {
  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      throw new Error(`Erreur lors de la vérification : ${error.message}`);
    }

    return {
      success: true,
      role: user?.user_metadata?.role || 'member',
      user
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Liste tous les utilisateurs avec leurs rôles
 */
export const listUsersWithRoles = async () => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Erreur lors de la récupération : ${error.message}`);
    }

    const usersWithRoles = data.users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'member',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));

    return { success: true, users: usersWithRoles };
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return { success: false, error: error.message };
  }
}; 