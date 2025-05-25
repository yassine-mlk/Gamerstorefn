import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Moniteur {
  id: string;
  nom_produit: string;
  code_barre?: string;
  marque: string;
  taille: string;
  resolution: string;
  frequence_affichage: string;
  etat: 'Neuf' | 'Comme neuf' | 'Occasion';
  garantie?: '3 mois' | '6 mois' | '9 mois' | '12 mois';
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  image_url?: string;
  fournisseur_id?: string;
  statut: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  emplacement?: string;
  description?: string;
  notes?: string;
  date_ajout: string;
  derniere_modification: string;
  created_at: string;
  updated_at: string;
}

export interface NewMoniteur {
  nom_produit: string;
  code_barre?: string;
  marque: string;
  taille: string;
  resolution: string;
  frequence_affichage: string;
  etat?: 'Neuf' | 'Comme neuf' | 'Occasion';
  garantie?: '3 mois' | '6 mois' | '9 mois' | '12 mois';
  prix_achat?: number;
  prix_vente?: number;
  stock_actuel?: number;
  stock_minimum?: number;
  image_url?: string;
  fournisseur_id?: string;
  statut?: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  emplacement?: string;
  description?: string;
  notes?: string;
}

export interface MouvementStockMoniteur {
  id: string;
  moniteur_id: string;
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

export interface StatsStockMoniteurs {
  total_produits: number;
  produits_disponibles: number;
  produits_rupture: number;
  produits_stock_faible: number;
  stock_total: number;
  valeur_stock_total: number;
  prix_moyen: number;
}

export function useMoniteurs() {
  const [moniteurs, setMoniteurs] = useState<Moniteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les moniteurs
  const fetchMoniteurs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('moniteurs')
        .select(`
          *,
          fournisseurs(nom)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMoniteurs(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des moniteurs';
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

  // Ajouter un nouveau moniteur
  const addMoniteur = async (newMoniteur: NewMoniteur): Promise<Moniteur | null> => {
    try {
      const { data, error } = await supabase
        .from('moniteurs')
        .insert([newMoniteur])
        .select()
        .single();

      if (error) throw error;

      setMoniteurs(prev => [data, ...prev]);
      toast({
        title: "Moniteur ajouté",
        description: `${newMoniteur.nom_produit} a été ajouté avec succès`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du moniteur';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Modifier un moniteur
  const updateMoniteur = async (id: string, updates: Partial<NewMoniteur>): Promise<Moniteur | null> => {
    try {
      const { data, error } = await supabase
        .from('moniteurs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMoniteurs(prev => prev.map(moniteur => 
        moniteur.id === id ? data : moniteur
      ));
      
      toast({
        title: "Moniteur modifié",
        description: "Les informations du moniteur ont été mises à jour",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification du moniteur';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Supprimer un moniteur
  const deleteMoniteur = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('moniteurs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMoniteurs(prev => prev.filter(moniteur => moniteur.id !== id));
      toast({
        title: "Moniteur supprimé",
        description: "Le moniteur a été supprimé avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du moniteur';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Rechercher des moniteurs
  const searchMoniteurs = async (searchTerm: string): Promise<Moniteur[]> => {
    try {
      const { data, error } = await supabase
        .from('moniteurs')
        .select('*')
        .or(`nom_produit.ilike.%${searchTerm}%,marque.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%,taille.ilike.%${searchTerm}%,resolution.ilike.%${searchTerm}%`)
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
        .from('moniteurs')
        .update({ 
          stock_actuel: nouvelleQuantite,
          derniere_modification: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Recharger les données pour avoir les valeurs à jour
      await fetchMoniteurs();
      
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

  // Obtenir les mouvements de stock pour un moniteur
  const getMouvementsStock = async (moniteurId: string): Promise<MouvementStockMoniteur[]> => {
    try {
      const { data, error } = await supabase
        .from('mouvements_stock_moniteurs')
        .select('*')
        .eq('moniteur_id', moniteurId)
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
  const getStatsStock = async (): Promise<StatsStockMoniteurs | null> => {
    try {
      const { data, error } = await supabase
        .from('vue_stats_moniteurs')
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

  // Charger les moniteurs au montage du composant
  useEffect(() => {
    fetchMoniteurs();
  }, []);

  return {
    moniteurs,
    loading,
    error,
    addMoniteur,
    updateMoniteur,
    deleteMoniteur,
    searchMoniteurs,
    updateStock,
    getMouvementsStock,
    getStatsStock,
    refreshMoniteurs: fetchMoniteurs
  };
} 