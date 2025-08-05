import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  nom: string;
  contact_principal: string;
  email: string;
  telephone?: string;
  adresse?: string;
  specialite?: string;
  date_partenariat: string;
  total_commandes: number;
  derniere_commande?: string;
  statut: 'Actif' | 'Inactif' | 'Privilégié';
  conditions_paiement?: string;
  delai_livraison_moyen?: number;
  notes?: string;
  type_fournisseur?: 'particulier' | 'entreprise';
  ice?: string;
  created_at: string;
  updated_at: string;
}

export interface NewSupplier {
  nom: string;
  contact_principal: string;
  email: string;
  telephone?: string;
  adresse?: string;
  specialite?: string;
  statut?: 'Actif' | 'Inactif' | 'Privilégié';
  conditions_paiement?: string;
  delai_livraison_moyen?: number;
  notes?: string;
  type_fournisseur?: 'particulier' | 'entreprise';
  ice?: string;
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les fournisseurs
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fournisseurs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des fournisseurs';
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

  // Ajouter un nouveau fournisseur
  const addSupplier = async (newSupplier: NewSupplier): Promise<Supplier | null> => {
    try {
      const { data, error } = await supabase
        .from('fournisseurs')
        .insert([newSupplier])
        .select()
        .single();

      if (error) throw error;

      setSuppliers(prev => [data, ...prev]);
      toast({
        title: "Fournisseur ajouté",
        description: `${newSupplier.nom} a été ajouté avec succès`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du fournisseur';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Modifier un fournisseur
  const updateSupplier = async (id: string, updates: Partial<NewSupplier>): Promise<Supplier | null> => {
    try {
      const { data, error } = await supabase
        .from('fournisseurs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? data : supplier
      ));
      
      toast({
        title: "Fournisseur modifié",
        description: "Les informations du fournisseur ont été mises à jour",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification du fournisseur';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Supprimer un fournisseur
  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('fournisseurs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      toast({
        title: "Fournisseur supprimé",
        description: "Le fournisseur a été supprimé avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du fournisseur';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Rechercher des fournisseurs
  const searchSuppliers = async (searchTerm: string): Promise<Supplier[]> => {
    try {
      const { data, error } = await supabase
        .from('fournisseurs')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,contact_principal.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,specialite.ilike.%${searchTerm}%`)
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

  // Charger les fournisseurs au montage du composant
  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    refreshSuppliers: fetchSuppliers
  };
} 