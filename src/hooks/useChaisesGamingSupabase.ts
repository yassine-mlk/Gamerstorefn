import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ChaiseGamingSupabase {
  id: string;
  nom_produit: string;
  code_barre?: string;
  marque: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  image_url?: string;
  fournisseur_id?: string;
  garantie?: string;
  statut: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  created_at: string;
  updated_at: string;
}

export interface NewChaiseGamingSupabase {
  nom_produit: string;
  code_barre?: string;
  marque: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  image_url?: string;
  fournisseur_id?: string;
  garantie?: string;
}

// Fonction pour générer un UUID valide
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useChaisesGamingSupabase = () => {
  const [chaisesGaming, setChaisesGaming] = useState<ChaiseGamingSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les chaises gaming depuis Supabase
  const loadChaisesGaming = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chaises_gaming')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des chaises gaming:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les chaises gaming: " + error.message,
          variant: "destructive",
        });
        return;
      }

      setChaisesGaming(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des chaises gaming:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les chaises gaming",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChaisesGaming();
  }, []);

  const addChaiseGaming = async (newChaise: NewChaiseGamingSupabase): Promise<boolean> => {
    try {
      // Générer un UUID valide
      const generatedId = generateUUID();
      
      // Préparer les données pour l'insertion
      const chaiseData: Record<string, any> = {
        id: generatedId,
        nom_produit: newChaise.nom_produit,
        marque: newChaise.marque,
        prix_achat: newChaise.prix_achat,
        prix_vente: newChaise.prix_vente,
        stock_actuel: newChaise.stock_actuel,
        stock_minimum: newChaise.stock_minimum,
      };

      // Ajouter les champs optionnels
      if (newChaise.code_barre && newChaise.code_barre.trim() !== '') {
        chaiseData.code_barre = newChaise.code_barre.trim();
      }

      if (newChaise.image_url && newChaise.image_url.trim() !== '') {
        chaiseData.image_url = newChaise.image_url.trim();
      }

      if (newChaise.fournisseur_id && newChaise.fournisseur_id.trim() !== '') {
        chaiseData.fournisseur_id = newChaise.fournisseur_id.trim();
      }

      if (newChaise.garantie && newChaise.garantie.trim() !== '') {
        chaiseData.garantie = newChaise.garantie.trim();
      }

      console.log('Données à insérer avec ID simple:', chaiseData);

      const { data, error } = await supabase
        .from('chaises_gaming')
        .insert([chaiseData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout de la chaise gaming:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la chaise gaming: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      // Ajouter la nouvelle chaise à la liste locale
      setChaisesGaming(prev => [data, ...prev]);
      
      toast({
        title: "Chaise gaming ajoutée",
        description: `${data.nom_produit} a été ajoutée au stock`,
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la chaise gaming:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la chaise gaming",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateChaiseGaming = async (id: string, updates: Partial<NewChaiseGamingSupabase>): Promise<boolean> => {
    try {
      // Préparer les données de mise à jour
      const updateData: Record<string, any> = {};

      // Ajouter seulement les champs qui ont des valeurs
      if (updates.nom_produit !== undefined) {
        updateData.nom_produit = updates.nom_produit;
      }
      if (updates.marque !== undefined) {
        updateData.marque = updates.marque;
      }
      if (updates.prix_achat !== undefined) {
        updateData.prix_achat = updates.prix_achat;
      }
      if (updates.prix_vente !== undefined) {
        updateData.prix_vente = updates.prix_vente;
      }
      if (updates.stock_actuel !== undefined) {
        updateData.stock_actuel = updates.stock_actuel;
      }
      if (updates.stock_minimum !== undefined) {
        updateData.stock_minimum = updates.stock_minimum;
      }
      if (updates.code_barre !== undefined) {
        updateData.code_barre = updates.code_barre?.trim() || null;
      }
      if (updates.image_url !== undefined) {
        updateData.image_url = updates.image_url?.trim() || null;
      }
      if (updates.fournisseur_id !== undefined) {
        updateData.fournisseur_id = updates.fournisseur_id?.trim() || null;
      }
      if (updates.garantie !== undefined) {
        updateData.garantie = updates.garantie?.trim() || null;
      }

      const { data, error } = await supabase
        .from('chaises_gaming')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la modification de la chaise gaming:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier la chaise gaming: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      // Mettre à jour la liste locale
      setChaisesGaming(prev => prev.map(chaise => 
        chaise.id === id ? data : chaise
      ));
      
      toast({
        title: "Chaise gaming modifiée",
        description: "Les informations ont été mises à jour",
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la modification de la chaise gaming:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la chaise gaming",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteChaiseGaming = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('chaises_gaming')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la chaise gaming:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la chaise gaming: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      // Supprimer de la liste locale
      setChaisesGaming(prev => prev.filter(chaise => chaise.id !== id));
      
      toast({
        title: "Chaise gaming supprimée",
        description: "La chaise a été supprimée du stock",
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la chaise gaming:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la chaise gaming",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    chaisesGaming,
    loading,
    addChaiseGaming,
    updateChaiseGaming,
    deleteChaiseGaming,
    refreshChaisesGaming: loadChaisesGaming
  };
}; 