import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ProductAssignment {
  id: string;
  product_id: string;
  product_type: 'pc_portable' | 'pc_gamer' | 'moniteur' | 'chaise_gaming' | 'peripherique' | 'composant_pc';
  product_name: string;
  product_code?: string;
  assigned_to_id: string;
  assigned_to_name: string;
  assigned_by_id?: string;
  assigned_by_name?: string;
  task_title: string;
  task_description?: string;
  task_notes?: string;
  priority: 'basse' | 'moyenne' | 'haute' | 'urgente';
  status: 'en_attente' | 'en_cours' | 'terminee' | 'validee' | 'annulee';
  due_date?: string;
  assigned_date: string;
  started_date?: string;
  completed_date?: string;
  validated_date?: string;
  created_at: string;
  updated_at: string;
}

export interface NewProductAssignment {
  product_id: string;
  product_type: string;
  product_name: string;
  product_code?: string;
  assigned_to_id: string;
  assigned_to_name: string;
  task_title: string;
  task_description?: string;
  task_notes?: string;
  priority?: 'basse' | 'moyenne' | 'haute' | 'urgente';
  due_date?: string;
}

export interface AssignmentComment {
  id: string;
  assignment_id: string;
  author_id?: string;
  author_name: string;
  comment_text: string;
  comment_type: 'note' | 'update' | 'completion' | 'issue';
  created_at: string;
  updated_at: string;
}

export interface NewAssignmentComment {
  assignment_id: string;
  comment_text: string;
  comment_type?: 'note' | 'update' | 'completion' | 'issue';
}

export function useProductAssignments() {
  const [assignments, setAssignments] = useState<ProductAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger toutes les assignations
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des assignations';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les assignations d'un membre spécifique
  const fetchAssignmentsByMember = async (memberId: string): Promise<ProductAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('product_assignments')
        .select('*')
        .eq('assigned_to_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des assignations';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return [];
    }
  };

  // Créer une nouvelle assignation
  const createAssignment = async (newAssignment: NewProductAssignment): Promise<ProductAssignment | null> => {
    try {
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      const assignmentData = {
        ...newAssignment,
        assigned_by_id: user?.id,
        assigned_by_name: user?.user_metadata?.name || user?.email || 'Système',
        priority: newAssignment.priority || 'moyenne'
      };

      const { data, error } = await supabase
        .from('product_assignments')
        .insert([assignmentData])
        .select()
        .single();

      if (error) throw error;

      setAssignments(prev => [data, ...prev]);
      toast({
        title: "Assignation créée",
        description: `La tâche "${newAssignment.task_title}" a été assignée à ${newAssignment.assigned_to_name}`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de l\'assignation';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Mettre à jour le statut d'une assignation
  const updateAssignmentStatus = async (id: string, status: ProductAssignment['status']): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('product_assignments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAssignments(prev => prev.map(assignment => 
        assignment.id === id ? data : assignment
      ));
      
      toast({
        title: "Statut mis à jour",
        description: `Le statut de la tâche a été changé à "${getStatusText(status)}"`,
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Mettre à jour une assignation complète
  const updateAssignment = async (id: string, updates: Partial<ProductAssignment>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('product_assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAssignments(prev => prev.map(assignment => 
        assignment.id === id ? data : assignment
      ));
      
      toast({
        title: "Assignation mise à jour",
        description: "Les informations de l'assignation ont été mises à jour",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'assignation';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Supprimer une assignation
  const deleteAssignment = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('product_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
      toast({
        title: "Assignation supprimée",
        description: "L'assignation a été supprimée avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'assignation';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Ajouter un commentaire à une assignation
  const addComment = async (newComment: NewAssignmentComment): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const commentData = {
        ...newComment,
        author_id: user?.id,
        author_name: user?.user_metadata?.name || user?.email || 'Utilisateur',
        comment_type: newComment.comment_type || 'note'
      };

      const { error } = await supabase
        .from('assignment_comments')
        .insert([commentData]);

      if (error) throw error;

      toast({
        title: "Commentaire ajouté",
        description: "Le commentaire a été ajouté à l'assignation",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Charger les commentaires d'une assignation
  const fetchAssignmentComments = async (assignmentId: string): Promise<AssignmentComment[]> => {
    try {
      const { data, error } = await supabase
        .from('assignment_comments')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des commentaires';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return [];
    }
  };

  // Obtenir les statistiques des assignations
  const getAssignmentStats = () => {
    return {
      total: assignments.length,
      en_attente: assignments.filter(a => a.status === 'en_attente').length,
      en_cours: assignments.filter(a => a.status === 'en_cours').length,
      terminee: assignments.filter(a => a.status === 'terminee').length,
      validee: assignments.filter(a => a.status === 'validee').length,
      en_retard: assignments.filter(a => 
        a.due_date && 
        new Date(a.due_date) < new Date() && 
        !['terminee', 'validee'].includes(a.status)
      ).length
    };
  };

  // Fonctions utilitaires
  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'validee': return 'Validée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'basse': return 'Basse';
      case 'moyenne': return 'Moyenne';
      case 'haute': return 'Haute';
      case 'urgente': return 'Urgente';
      default: return priority;
    }
  };

  const getProductTypeText = (type: string) => {
    switch (type) {
      case 'pc_portable': return 'PC Portable';
      case 'pc_gamer': return 'PC Gamer';
      case 'moniteur': return 'Moniteur';
      case 'chaise_gaming': return 'Chaise Gaming';
      case 'peripherique': return 'Périphérique';
      case 'composant_pc': return 'Composant PC';
      default: return type;
    }
  };

  // Charger les assignations au montage du composant
  useEffect(() => {
    fetchAssignments();
  }, []);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateAssignmentStatus,
    updateAssignment,
    deleteAssignment,
    fetchAssignmentsByMember,
    addComment,
    fetchAssignmentComments,
    getAssignmentStats,
    getStatusText,
    getPriorityText,
    getProductTypeText,
    refreshAssignments: fetchAssignments
  };
} 