import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ComposantPC } from './useComposantsPC';

export interface PCGamerConfig {
  id: string;
  nom_config: string;
  description?: string;
  prix_vente: number;
  prix_coutant: number;
  code_barre?: string;
  image_url?: string;
  notes?: string;
  garantie: string;
  statut: 'Actif' | 'Inactif' | 'Archivé';
  stock_possible: number;
  date_ajout: string;
  derniere_modification: string;
  created_at: string;
  updated_at: string;
}

export interface PCGamerComposant {
  id: string;
  config_id: string;
  composant_id: string;
  quantite: number;
  type_composant: 'cpu' | 'gpu' | 'ram' | 'disc' | 'case' | 'mother_board' | 'power' | 'cooling';
  ordre_affichage: number;
  created_at: string;
  // Données du composant joint
  composant?: ComposantPC;
}

export interface NewPCGamerConfig {
  nom_config: string;
  description?: string;
  prix_vente: number;
  code_barre?: string;
  image_url?: string;
  notes?: string;
  garantie?: string;
  statut?: 'Actif' | 'Inactif' | 'Archivé';
}

export interface ConfigComposant {
  composant_id: string;
  quantite: number;
  type_composant: 'cpu' | 'gpu' | 'ram' | 'disc' | 'case' | 'mother_board' | 'power' | 'cooling';
}

export interface PCGamerInstance {
  id: string;
  config_id: string;
  numero_serie?: string;
  statut: 'Assemblé' | 'Testé' | 'Vendu' | 'SAV' | 'Retourné';
  date_assemblage: string;
  date_vente?: string;
  prix_vente_final?: number;
  client_id?: string;
  technicien?: string;
  notes_assemblage?: string;
  created_at: string;
  updated_at: string;
}

export interface StatsPCGamer {
  total_configs: number;
  configs_actives: number;
  configs_disponibles: number;
  configs_rupture: number;
  total_stock_possible: number;
  prix_moyen: number;
  cout_moyen: number;
  marge_moyenne: number;
}

export function usePCGamer() {
  const [pcGamerConfigs, setPCGamerConfigs] = useState<PCGamerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger toutes les configurations PC Gamer
  const fetchPCGamerConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pc_gamer_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPCGamerConfigs(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des configurations PC Gamer';
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

  // Ajouter une nouvelle configuration PC Gamer
  const addPCGamerConfig = async (
    newConfig: NewPCGamerConfig,
    composants: ConfigComposant[]
  ): Promise<PCGamerConfig | null> => {
    try {
      // Vérifier qu'au moins un composant est présent
      if (composants.length === 0) {
        throw new Error('Veuillez ajouter au moins un composant à la configuration');
      }

      // Vérifier que les composants obligatoires sont présents (validation simplifiée pour le test)
      const typesPresents = composants.map(c => c.type_composant);
      const typesObligatoires = ['cpu', 'mother_board', 'power', 'case'];
      
      const typesManquants = typesObligatoires.filter(type => !typesPresents.includes(type as any));
      if (typesManquants.length > 0) {
        const labels = {
          'cpu': 'Processeur',
          'mother_board': 'Carte mère', 
          'power': 'Alimentation',
          'case': 'Boîtier'
        };
        const labelsManquants = typesManquants.map(type => labels[type as keyof typeof labels]).join(', ');
        throw new Error(`Composants obligatoires manquants: ${labelsManquants}`);
      }

      // Créer la configuration
      const { data: configData, error: configError } = await supabase
        .from('pc_gamer_configs')
        .insert([{
          ...newConfig,
          code_barre: newConfig.code_barre || `PCG${Date.now()}`
        }])
        .select()
        .single();

      if (configError) throw configError;

      // Ajouter les composants
      const composantsToInsert = composants.map((comp, index) => ({
        config_id: configData.id,
        composant_id: comp.composant_id,
        quantite: comp.quantite,
        type_composant: comp.type_composant,
        ordre_affichage: index
      }));

      const { error: composantsError } = await supabase
        .from('pc_gamer_composants')
        .insert(composantsToInsert);

      if (composantsError) throw composantsError;

      // Recharger les configurations pour avoir les données à jour
      await fetchPCGamerConfigs();
      
      toast({
        title: "Configuration PC Gamer créée",
        description: `${newConfig.nom_config} a été créée avec succès`,
      });
      
      return configData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la configuration';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Modifier une configuration PC Gamer
  const updatePCGamerConfig = async (
    id: string,
    updates: Partial<NewPCGamerConfig>,
    composants?: ConfigComposant[]
  ): Promise<PCGamerConfig | null> => {
    try {
      // Mettre à jour la configuration
      const { data, error } = await supabase
        .from('pc_gamer_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Si des composants sont fournis, les mettre à jour
      if (composants) {
        // Supprimer les anciens composants
        const { error: deleteError } = await supabase
          .from('pc_gamer_composants')
          .delete()
          .eq('config_id', id);

        if (deleteError) throw deleteError;

        // Ajouter les nouveaux composants
        const composantsToInsert = composants.map((comp, index) => ({
          config_id: id,
          composant_id: comp.composant_id,
          quantite: comp.quantite,
          type_composant: comp.type_composant,
          ordre_affichage: index
        }));

        const { error: insertError } = await supabase
          .from('pc_gamer_composants')
          .insert(composantsToInsert);

        if (insertError) throw insertError;
      }

      // Recharger les configurations
      await fetchPCGamerConfigs();
      
      toast({
        title: "Configuration PC Gamer modifiée",
        description: "La configuration a été mise à jour avec succès",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Supprimer une configuration PC Gamer
  const deletePCGamerConfig = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pc_gamer_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPCGamerConfigs(prev => prev.filter(config => config.id !== id));
      toast({
        title: "Configuration PC Gamer supprimée",
        description: "La configuration a été supprimée avec succès",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Obtenir les composants d'une configuration
  const getConfigComposants = async (configId: string): Promise<PCGamerComposant[]> => {
    try {
      const { data, error } = await supabase
        .from('pc_gamer_composants')
        .select(`
          *,
          composant:composants_pc(*)
        `)
        .eq('config_id', configId)
        .order('ordre_affichage');

      if (error) throw error;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des composants';
      setError(message);
      return [];
    }
  };

  // Calculer le stock possible d'une configuration
  const calculateStockPossible = async (composants: ConfigComposant[]): Promise<number> => {
    try {
      if (composants.length === 0) return 0;

      const composantIds = composants.map(c => c.composant_id);
      const { data: composantsData, error } = await supabase
        .from('composants_pc')
        .select('id, stock_actuel')
        .in('id', composantIds);

      if (error) throw error;

      let minStock = Infinity;
      for (const configComp of composants) {
        const stockData = composantsData?.find(c => c.id === configComp.composant_id);
        if (stockData) {
          const stockPossible = Math.floor(stockData.stock_actuel / configComp.quantite);
          minStock = Math.min(minStock, stockPossible);
        } else {
          return 0; // Si un composant n'existe pas
        }
      }

      return minStock === Infinity ? 0 : minStock;
    } catch (err) {
      console.error('Erreur calcul stock:', err);
      return 0;
    }
  };

  // Obtenir les statistiques des PC Gamer
  const getStatsPCGamer = async (): Promise<StatsPCGamer | null> => {
    try {
      const { data, error } = await supabase
        .from('vue_stats_pc_gamer')
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

  // Rechercher des configurations
  const searchPCGamerConfigs = async (searchTerm: string): Promise<PCGamerConfig[]> => {
    try {
      const { data, error } = await supabase
        .from('pc_gamer_configs')
        .select('*')
        .or(`nom_config.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%`)
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

  // Créer une instance de PC assemblé
  const createPCInstance = async (
    configId: string,
    instanceData: Partial<PCGamerInstance>
  ): Promise<PCGamerInstance | null> => {
    try {
      const { data, error } = await supabase
        .from('pc_gamer_instances')
        .insert([{
          config_id: configId,
          numero_serie: instanceData.numero_serie || `PC${Date.now()}`,
          ...instanceData
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "PC assemblé créé",
        description: "L'instance de PC a été créée avec succès",
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de l\'instance';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Charger les configurations au montage
  useEffect(() => {
    fetchPCGamerConfigs();
  }, []);

  return {
    pcGamerConfigs,
    loading,
    error,
    addPCGamerConfig,
    updatePCGamerConfig,
    deletePCGamerConfig,
    getConfigComposants,
    calculateStockPossible,
    getStatsPCGamer,
    searchPCGamerConfigs,
    createPCInstance,
    refreshPCGamerConfigs: fetchPCGamerConfigs
  };
} 