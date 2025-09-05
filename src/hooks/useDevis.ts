import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface DevisArticle {
  id: string;
  devis_id: string;
  produit_id: string;
  produit_type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  nom_produit: string;
  marque?: string;
  quantite: number;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  total_ht: number;
  total_ttc: number;
  created_at: string;
}

export interface Devis {
  id: string;
  numero_devis: string;
  client_id?: string;
  date_creation: string;
  date_expiration?: string;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'expire';
  sous_total: number;
  tva: number;
  remise: number;
  total_ht: number;
  total_ttc: number;
  vendeur_id?: string;
  notes?: string;
  conditions_particulieres?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  client?: {
    id: string;
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
    adresse?: string;
  };
  articles?: DevisArticle[];
}

export interface NewDevis {
  client_id?: string;
  date_expiration?: string;
  sous_total: number;
  tva: number;
  remise?: number;
  total_ht: number;
  total_ttc: number;
  vendeur_id?: string;
  notes?: string;
  conditions_particulieres?: string;
  articles: Omit<DevisArticle, 'id' | 'devis_id' | 'created_at'>[];
}

export const useDevis = () => {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les devis
  const fetchDevis = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('devis')
        .select(`
          *,
          client:clients(
            id,
            nom,
            prenom,
            email,
            telephone,
            adresse
          ),
          articles:devis_articles(*)
        `)
        .order('date_creation', { ascending: false });

      if (error) throw error;

      setDevis(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des devis:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau devis
  const createDevis = async (newDevis: NewDevis): Promise<string | null> => {
    try {
      setError(null);

      // Créer le devis principal
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .insert({
          client_id: newDevis.client_id,
          date_expiration: newDevis.date_expiration,
          sous_total: newDevis.sous_total,
          tva: newDevis.tva,
          remise: newDevis.remise || 0,
          total_ht: newDevis.total_ht,
          total_ttc: newDevis.total_ttc,
          vendeur_id: newDevis.vendeur_id,
          notes: newDevis.notes,
          conditions_particulieres: newDevis.conditions_particulieres,
        })
        .select()
        .single();

      if (devisError) throw devisError;

      // Ajouter les articles du devis
      if (newDevis.articles.length > 0) {
        const articlesWithDevisId = newDevis.articles.map(article => ({
          ...article,
          devis_id: devisData.id,
        }));

        const { error: articlesError } = await supabase
          .from('devis_articles')
          .insert(articlesWithDevisId);

        if (articlesError) throw articlesError;
      }

      toast({
        title: "Succès",
        description: `Devis ${devisData.numero_devis} créé avec succès`,
      });

      // Recharger les devis
      await fetchDevis();

      return devisData.id;
    } catch (err: any) {
      console.error('Erreur lors de la création du devis:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis",
        variant: "destructive",
      });
      return null;
    }
  };

  // Mettre à jour le statut d'un devis
  const updateDevisStatut = async (devisId: string, statut: Devis['statut']) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('devis')
        .update({ statut })
        .eq('id', devisId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut du devis mis à jour",
      });

      // Recharger les devis
      await fetchDevis();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Supprimer un devis
  const deleteDevis = async (devisId: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('devis')
        .delete()
        .eq('id', devisId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Devis supprimé avec succès",
      });

      // Recharger les devis
      await fetchDevis();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du devis:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le devis",
        variant: "destructive",
      });
    }
  };

  // Obtenir un devis par ID
  const getDevisById = async (devisId: string): Promise<Devis | null> => {
    try {
      const { data, error } = await supabase
        .from('devis')
        .select(`
          *,
          client:clients(
            id,
            nom,
            prenom,
            email,
            telephone,
            adresse
          ),
          articles:devis_articles(*)
        `)
        .eq('id', devisId)
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error('Erreur lors de la récupération du devis:', err);
      setError(err.message);
      return null;
    }
  };

  // Convertir un devis en vente
  const convertDevisToVente = async (devisId: string) => {
    try {
      setError(null);

      const devis = await getDevisById(devisId);
      if (!devis) throw new Error('Devis introuvable');

      // Ici, vous pouvez ajouter la logique pour créer une vente
      // basée sur les données du devis
      
      toast({
        title: "Succès",
        description: "Devis converti en vente",
      });

      // Mettre à jour le statut du devis
      await updateDevisStatut(devisId, 'accepte');
    } catch (err: any) {
      console.error('Erreur lors de la conversion:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de convertir le devis",
        variant: "destructive",
      });
    }
  };

  // Statistiques des devis
  const getDevisStats = () => {
    const total = devis.length;
    const enAttente = devis.filter(d => d.statut === 'en_attente').length;
    const acceptes = devis.filter(d => d.statut === 'accepte').length;
    const refuses = devis.filter(d => d.statut === 'refuse').length;
    const expires = devis.filter(d => d.statut === 'expire').length;
    
    const montantTotal = devis.reduce((sum, d) => sum + d.total_ttc, 0);
    const montantAcceptes = devis
      .filter(d => d.statut === 'accepte')
      .reduce((sum, d) => sum + d.total_ttc, 0);

    return {
      total,
      enAttente,
      acceptes,
      refuses,
      expires,
      montantTotal,
      montantAcceptes,
      tauxAcceptation: total > 0 ? (acceptes / total) * 100 : 0,
    };
  };

  useEffect(() => {
    fetchDevis();
  }, []);

  return {
    devis,
    loading,
    error,
    fetchDevis,
    createDevis,
    updateDevisStatut,
    deleteDevis,
    getDevisById,
    convertDevisToVente,
    getDevisStats,
  };
};