import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ComposantPC {
  id: string;
  nom_produit: string;
  categorie: 'cpu' | 'gpu' | 'ram' | 'disc' | 'case' | 'mother_board' | 'power' | 'cooling';
  code_barre?: string;
  stock_actuel: number;
  stock_minimum: number;
  prix_achat: number;
  prix_vente: number;
  fournisseur_id?: string;
  etat: 'Neuf' | 'Comme neuf' | 'Occasion';
  garantie: string;
  image_url?: string;
  notes?: string;
  statut: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  date_ajout: string;
  derniere_modification: string;
  created_at: string;
  updated_at: string;
}

export interface NewComposantPC {
  nom_produit: string;
  categorie: 'cpu' | 'gpu' | 'ram' | 'disc' | 'case' | 'mother_board' | 'power' | 'cooling';
  code_barre?: string;
  stock_actuel?: number;
  stock_minimum?: number;
  prix_achat?: number;
  prix_vente?: number;
  fournisseur_id?: string;
  etat?: 'Neuf' | 'Comme neuf' | 'Occasion';
  garantie?: string;
  image_url?: string;
  notes?: string;
  statut?: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
}

export interface MouvementStockComposant {
  id: string;
  composant_pc_id: string;
  type_mouvement: 'Entrée' | 'Sortie' | 'Correction' | 'Retour';
  quantite: number;
  stock_avant: number;
  stock_apres: number;
  prix_unitaire?: number;
  motif?: string;
  reference_externe?: string;
  utilisateur?: string;
  date_mouvement: string;
  notes?: string;
  created_at: string;
}

export interface StatsStockComposants {
  total_produits: number;
  produits_disponibles: number;
  produits_rupture: number;
  produits_stock_faible: number;
  stock_total: number;
  valeur_stock_total: number;
  prix_moyen: number;
}

export function useComposantsPC() {
  const [composantsPC, setComposantsPC] = useState<ComposantPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les composants PC
  const fetchComposantsPC = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('composants_pc')
        .select(`
          *,
          fournisseurs(nom)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComposantsPC(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des composants PC';
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

  // Ajouter un nouveau composant PC
  const addComposantPC = async (newComposant: NewComposantPC): Promise<ComposantPC | null> => {
    try {
      const { data, error } = await supabase
        .from('composants_pc')
        .insert([newComposant])
        .select()
        .single();

      if (error) throw error;

      setComposantsPC(prev => [data, ...prev]);
      toast({
        title: "Composant PC ajouté",
        description: `${newComposant.nom_produit} a été ajouté avec succès`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du composant PC';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Modifier un composant PC
  const updateComposantPC = async (id: string, updates: Partial<NewComposantPC>): Promise<ComposantPC | null> => {
    try {
      const { data, error } = await supabase
        .from('composants_pc')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setComposantsPC(prev => prev.map(composant => 
        composant.id === id ? data : composant
      ));
      
      toast({
        title: "Composant PC modifié",
        description: "Les informations du composant PC ont été mises à jour",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification du composant PC';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Supprimer un composant PC
  const deleteComposantPC = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('composants_pc')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComposantsPC(prev => prev.filter(composant => composant.id !== id));
      toast({
        title: "Composant PC supprimé",
        description: "Le composant PC a été supprimé avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du composant PC';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Rechercher des composants PC
  const searchComposantsPC = async (searchTerm: string): Promise<ComposantPC[]> => {
    try {
      const { data, error } = await supabase
        .from('composants_pc')
        .select('*')
        .or(`nom_produit.ilike.%${searchTerm}%,categorie.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return [];
    }
  };

  // Mettre à jour le stock
  const updateStock = async (id: string, nouvelleQuantite: number, motif?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('composants_pc')
        .update({ 
          stock_actuel: nouvelleQuantite,
          derniere_modification: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Recharger les données pour avoir les valeurs à jour
      await fetchComposantsPC();
      
      toast({
        title: "Stock mis à jour",
        description: `Le stock a été mis à jour avec succès`,
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du stock';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Obtenir les mouvements de stock pour un composant PC
  const getMouvementsStock = async (composantId: string): Promise<MouvementStockComposant[]> => {
    try {
      const { data, error } = await supabase
        .from('mouvements_stock_composants_pc')
        .select('*')
        .eq('composant_pc_id', composantId)
        .order('date_mouvement', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des mouvements';
      setError(message);
      return [];
    }
  };

  // Obtenir les statistiques de stock
  const getStatsStock = async (): Promise<StatsStockComposants | null> => {
    try {
      const { data, error } = await supabase
        .from('vue_stats_composants_pc')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      setError(message);
      return null;
    }
  };

  // Charger les composants PC au montage du composant
  useEffect(() => {
    fetchComposantsPC();
  }, []);

  return {
    composantsPC,
    loading,
    error,
    addComposantPC,
    updateComposantPC,
    deleteComposantPC,
    searchComposantsPC,
    updateStock,
    getMouvementsStock,
    getStatsStock,
    refreshComposantsPC: fetchComposantsPC
  };
} 