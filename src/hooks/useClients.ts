import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  date_inscription: string;
  total_achats: number;
  derniere_commande?: string;
  statut: 'Actif' | 'Inactif' | 'VIP';
  notes?: string;
  type_client: 'particulier' | 'societe';
  ice?: string;
  created_at: string;
  updated_at: string;
}

export interface NewClient {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  statut?: 'Actif' | 'Inactif' | 'VIP';
  notes?: string;
  type_client?: 'particulier' | 'societe';
  ice?: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des clients';
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

  // Ajouter un nouveau client
  const addClient = async (newClient: NewClient): Promise<Client | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [data, ...prev]);
      toast({
        title: "Client ajouté",
        description: `${newClient.prenom} ${newClient.nom} a été ajouté avec succès`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du client';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Modifier un client
  const updateClient = async (id: string, updates: Partial<NewClient>): Promise<Client | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ));
      
      toast({
        title: "Client modifié",
        description: "Les informations du client ont été mises à jour",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification du client';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Supprimer un client
  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du client';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Rechercher des clients
  const searchClients = async (searchTerm: string): Promise<Client[]> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
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

  // Charger les clients au montage du composant
  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    searchClients,
    refreshClients: fetchClients
  };
} 