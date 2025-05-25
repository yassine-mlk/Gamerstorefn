import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Peripherique {
  id: string;
  nom_produit: string;
  code_barre?: string;
  prix_achat: number;
  prix_vente: number;
  image_url?: string;
  categorie: 'claviers' | 'casque' | 'sac_a_dos' | 'souris' | 'tapis_de_souris' | 'stockage' | 'webcam';
  fournisseur_id?: string;
  marque?: string;
  modele?: string;
  reference?: string;
  etat: 'Neuf' | 'Comme neuf' | 'Occasion';
  garantie?: string;
  stock_actuel: number;
  stock_minimum: number;
  statut: 'disponible' | 'rupture' | 'commande';
  emplacement?: string;
  description?: string;
  notes?: string;
  date_creation: string;
  date_modification: string;
}

export interface NewPeripherique {
  nom_produit: string;
  code_barre?: string;
  prix_achat?: number;
  prix_vente?: number;
  image_url?: string;
  categorie: 'claviers' | 'casque' | 'sac_a_dos' | 'souris' | 'tapis_de_souris' | 'stockage' | 'webcam';
  fournisseur_id?: string;
  marque?: string;
  modele?: string;
  reference?: string;
  etat?: 'Neuf' | 'Comme neuf' | 'Occasion';
  garantie?: string;
  stock_actuel?: number;
  stock_minimum?: number;
  emplacement?: string;
  description?: string;
  notes?: string;
}

export interface MouvementStockPeripherique {
  id: string;
  peripherique_id: string;
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

export interface StatsStockPeripheriques {
  total_produits: number;
  produits_disponibles: number;
  produits_rupture: number;
  produits_commande: number;
  stock_total: number;
  valeur_stock_total: number;
  prix_moyen: number;
  par_categorie: {
    categorie: string;
    count: number;
    stock_total: number;
    valeur: number;
  }[];
}

export function usePeripheriques() {
  const [peripheriques, setPeripheriques] = useState<Peripherique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les périphériques
  const fetchPeripheriques = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('peripheriques')
        .select(`
          *,
          fournisseurs(nom)
        `)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      setPeripheriques(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des périphériques';
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

  // Ajouter un nouveau périphérique
  const addPeripherique = async (newPeripherique: NewPeripherique): Promise<Peripherique | null> => {
    try {
      const { data, error } = await supabase
        .from('peripheriques')
        .insert([newPeripherique])
        .select()
        .single();

      if (error) throw error;

      setPeripheriques(prev => [data, ...prev]);
      toast({
        title: "Périphérique ajouté",
        description: `${newPeripherique.nom_produit} a été ajouté avec succès`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du périphérique';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Modifier un périphérique
  const updatePeripherique = async (id: string, updates: Partial<NewPeripherique>): Promise<Peripherique | null> => {
    try {
      const { data, error } = await supabase
        .from('peripheriques')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPeripheriques(prev => prev.map(peripherique => 
        peripherique.id === id ? data : peripherique
      ));
      
      toast({
        title: "Périphérique modifié",
        description: "Les informations du périphérique ont été mises à jour",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification du périphérique';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Supprimer un périphérique
  const deletePeripherique = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('peripheriques')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPeripheriques(prev => prev.filter(peripherique => peripherique.id !== id));
      toast({
        title: "Périphérique supprimé",
        description: "Le périphérique a été supprimé avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du périphérique';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Rechercher des périphériques
  const searchPeripheriques = async (searchTerm: string): Promise<Peripherique[]> => {
    try {
      const { data, error } = await supabase
        .from('peripheriques')
        .select('*')
        .or(`nom_produit.ilike.%${searchTerm}%,marque.ilike.%${searchTerm}%,modele.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%`)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      return [];
    }
  };

  // Mettre à jour le stock
  const updateStock = async (id: string, nouvelleQuantite: number, motif?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('peripheriques')
        .update({ stock_actuel: nouvelleQuantite })
        .eq('id', id);

      if (error) throw error;

      setPeripheriques(prev => prev.map(peripherique => 
        peripherique.id === id 
          ? { ...peripherique, stock_actuel: nouvelleQuantite }
          : peripherique
      ));

      toast({
        title: "Stock mis à jour",
        description: `Stock mis à jour: ${nouvelleQuantite} unités`,
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

  // Obtenir les statistiques de stock
  const getStatsStock = async (): Promise<StatsStockPeripheriques | null> => {
    try {
      const { data, error } = await supabase
        .from('peripheriques')
        .select('*');

      if (error) throw error;

      const stats: StatsStockPeripheriques = {
        total_produits: data.length,
        produits_disponibles: data.filter(p => p.statut === 'disponible').length,
        produits_rupture: data.filter(p => p.statut === 'rupture').length,
        produits_commande: data.filter(p => p.statut === 'commande').length,
        stock_total: data.reduce((acc, p) => acc + p.stock_actuel, 0),
        valeur_stock_total: data.reduce((acc, p) => acc + (p.stock_actuel * p.prix_achat), 0),
        prix_moyen: data.length > 0 ? data.reduce((acc, p) => acc + p.prix_vente, 0) / data.length : 0,
        par_categorie: []
      };

      // Calculer les stats par catégorie
      const categories = ['claviers', 'casque', 'sac_a_dos', 'souris', 'tapis_de_souris', 'stockage', 'webcam'];
      stats.par_categorie = categories.map(cat => {
        const produits = data.filter(p => p.categorie === cat);
        return {
          categorie: cat,
          count: produits.length,
          stock_total: produits.reduce((acc, p) => acc + p.stock_actuel, 0),
          valeur: produits.reduce((acc, p) => acc + (p.stock_actuel * p.prix_achat), 0)
        };
      });

      return stats;
    } catch (err) {
      console.error('Erreur lors du calcul des stats:', err);
      return null;
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchPeripheriques();
  }, []);

  return {
    peripheriques,
    loading,
    error,
    fetchPeripheriques,
    addPeripherique,
    updatePeripherique,
    deletePeripherique,
    searchPeripheriques,
    updateStock,
    getStatsStock,
  };
} 