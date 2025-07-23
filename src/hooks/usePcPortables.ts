import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface PcPortable {
  id: string;
  nom_produit: string;
  code_barre?: string;
  marque: string;
  modele?: string;
  processeur: string;
  ram: string;
  vitesse_ram?: string;
  carte_graphique?: string;
  vram_carte_graphique?: string;
  stockage: string;
  ecran?: string;
  taille_ecran?: string;
  resolution_ecran?: string;
  taux_rafraichissement?: string;
  etat: 'Neuf' | 'Comme neuf' | 'Occasion';
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  image_url?: string;
  fournisseur_id?: string;
  statut: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  garantie?: string;
  depot: 'magasin principal' | 'depot';
  date_ajout: string;
  derniere_modification: string;
  created_at: string;
  updated_at: string;
}

export interface NewPcPortable {
  nom_produit: string;
  code_barre?: string;
  marque: string;
  modele?: string;
  processeur: string;
  ram: string;
  vitesse_ram?: string;
  carte_graphique?: string;
  vram_carte_graphique?: string;
  stockage: string;
  ecran?: string;
  taille_ecran?: string;
  resolution_ecran?: string;
  taux_rafraichissement?: string;
  etat?: 'Neuf' | 'Comme neuf' | 'Occasion';
  prix_achat?: number;
  prix_vente?: number;
  stock_actuel?: number;
  stock_minimum?: number;
  image_url?: string;
  fournisseur_id?: string;
  statut?: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  garantie?: string;
  depot?: 'magasin principal' | 'depot';
}

export interface MouvementStock {
  id: string;
  pc_portable_id: string;
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

export interface StatsStock {
  total_produits: number;
  produits_disponibles: number;
  produits_rupture: number;
  produits_stock_faible: number;
  stock_total: number;
  valeur_stock_total: number;
  prix_moyen: number;
}

export function usePcPortables() {
  const [pcPortables, setPcPortables] = useState<PcPortable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les PC portables
  const fetchPcPortables = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pc_portables')
        .select(`
          *,
          fournisseurs(nom)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPcPortables(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des PC portables';
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

  // Ajouter un nouveau PC portable
  const addPcPortable = async (newPcPortable: NewPcPortable): Promise<PcPortable | null> => {
    try {
      const { data, error } = await supabase
        .from('pc_portables')
        .insert([newPcPortable])
        .select()
        .single();

      if (error) throw error;

      setPcPortables(prev => [data, ...prev]);
      toast({
        title: "PC portable ajouté",
        description: `${newPcPortable.nom_produit} a été ajouté avec succès`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du PC portable';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Modifier un PC portable
  const updatePcPortable = async (id: string, updates: Partial<NewPcPortable>): Promise<PcPortable | null> => {
    try {
      const { data, error } = await supabase
        .from('pc_portables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPcPortables(prev => prev.map(pc => 
        pc.id === id ? data : pc
      ));
      
      toast({
        title: "PC portable modifié",
        description: "Les informations du PC portable ont été mises à jour",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification du PC portable';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Supprimer un PC portable
  const deletePcPortable = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pc_portables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPcPortables(prev => prev.filter(pc => pc.id !== id));
      toast({
        title: "PC portable supprimé",
        description: "Le PC portable a été supprimé avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du PC portable';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Rechercher des PC portables
  const searchPcPortables = async (searchTerm: string): Promise<PcPortable[]> => {
    try {
      const { data, error } = await supabase
        .from('pc_portables')
        .select('*')
        .or(`nom_produit.ilike.%${searchTerm}%,marque.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%,processeur.ilike.%${searchTerm}%`)
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
        .from('pc_portables')
        .update({ 
          stock_actuel: nouvelleQuantite,
          derniere_modification: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Recharger les données pour avoir les valeurs à jour
      await fetchPcPortables();
      
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

  // Obtenir les mouvements de stock pour un PC portable
  const getMouvementsStock = async (pcPortableId: string): Promise<MouvementStock[]> => {
    try {
      const { data, error } = await supabase
        .from('mouvements_stock_pc_portables')
        .select('*')
        .eq('pc_portable_id', pcPortableId)
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
  const getStatsStock = async (): Promise<StatsStock | null> => {
    try {
      const { data, error } = await supabase
        .from('vue_stats_pc_portables')
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

  // Charger les PC portables au montage du composant
  useEffect(() => {
    fetchPcPortables();
  }, []);

  return {
    pcPortables,
    loading,
    error,
    addPcPortable,
    updatePcPortable,
    deletePcPortable,
    searchPcPortables,
    updateStock,
    getMouvementsStock,
    getStatsStock,
    refreshPcPortables: fetchPcPortables
  };
} 