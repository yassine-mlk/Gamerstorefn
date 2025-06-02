import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface LivraisonArticle {
  id: string;
  livraison_id: string;
  vente_article_id?: string;
  produit_id: string;
  produit_type: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  statut_article: 'en_cours' | 'livre' | 'non_livre' | 'endommage' | 'retour';
  created_at: string;
}

export interface Livraison {
  id: string;
  vente_id: string;
  numero_livraison: string;
  client_nom: string;
  client_email?: string;
  client_telephone?: string;
  adresse_livraison: string;
  code_postal?: string;
  ville?: string;
  pays: string;
  statut: 'en_cours' | 'livre' | 'non_livre' | 'retour' | 'annule';
  date_creation: string;
  date_expedition?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  transporteur?: string;
  numero_suivi?: string;
  total_articles: number;
  poids_total?: number;
  valeur_totale: number;
  notes_livraison?: string;
  commentaire_client?: string;
  motif_retour?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  articles?: LivraisonArticle[];
}

export interface LivraisonFilters {
  search?: string;
  statut?: string;
  transporteur?: string;
  date_debut?: string;
  date_fin?: string;
  ville?: string;
}

export interface LivraisonStats {
  total_livraisons: number;
  en_cours: number;
  livrees: number;
  non_livrees: number;
  retours: number;
  annulees: number;
  valeur_totale: number;
  livraisons_par_transporteur: Record<string, number>;
  livraisons_par_ville: Record<string, number>;
  evolution_mensuelle: Array<{
    mois: string;
    total: number;
    nombre: number;
  }>;
}

export function useLivraisons() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger toutes les livraisons
  const fetchLivraisons = async (filters?: LivraisonFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('livraisons')
        .select(`
          *,
          articles:livraisons_articles(*)
        `)
        .order('date_creation', { ascending: false });

      // Appliquer les filtres
      if (filters?.search) {
        query = query.or(`client_nom.ilike.%${filters.search}%,numero_livraison.ilike.%${filters.search}%,numero_suivi.ilike.%${filters.search}%`);
      }
      if (filters?.statut && filters.statut !== 'tous') {
        query = query.eq('statut', filters.statut);
      }
      if (filters?.transporteur && filters.transporteur !== 'tous') {
        query = query.eq('transporteur', filters.transporteur);
      }
      if (filters?.ville && filters.ville !== 'tous') {
        query = query.eq('ville', filters.ville);
      }
      if (filters?.date_debut) {
        query = query.gte('date_creation', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date_creation', filters.date_fin);
      }

      const { data, error } = await query;

      if (error) {
        // Si erreur de relation, essayer sans les relations
        console.warn('Problème de relation détecté, chargement des livraisons sans relations:', error);
        
        let simpleQuery = supabase
          .from('livraisons')
          .select('*')
          .order('date_creation', { ascending: false });

        // Réappliquer les filtres
        if (filters?.search) {
          simpleQuery = simpleQuery.or(`client_nom.ilike.%${filters.search}%,numero_livraison.ilike.%${filters.search}%,numero_suivi.ilike.%${filters.search}%`);
        }
        if (filters?.statut && filters.statut !== 'tous') {
          simpleQuery = simpleQuery.eq('statut', filters.statut);
        }
        if (filters?.transporteur && filters.transporteur !== 'tous') {
          simpleQuery = simpleQuery.eq('transporteur', filters.transporteur);
        }
        if (filters?.ville && filters.ville !== 'tous') {
          simpleQuery = simpleQuery.eq('ville', filters.ville);
        }
        if (filters?.date_debut) {
          simpleQuery = simpleQuery.gte('date_creation', filters.date_debut);
        }
        if (filters?.date_fin) {
          simpleQuery = simpleQuery.lte('date_creation', filters.date_fin);
        }

        const { data: simpleData, error: simpleError } = await simpleQuery;
        
        if (simpleError) throw simpleError;

        // Charger manuellement les articles pour chaque livraison
        const livraisonsWithArticles = await Promise.all(
          (simpleData || []).map(async (livraison) => {
            const { data: articles } = await supabase
              .from('livraisons_articles')
              .select('*')
              .eq('livraison_id', livraison.id);

            return {
              ...livraison,
              articles: articles || []
            };
          })
        );

        setLivraisons(livraisonsWithArticles);
        console.log("Livraisons chargées en mode de compatibilité");
      } else {
        setLivraisons(data || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des livraisons:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de charger les livraisons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle livraison
  const createLivraison = async (
    livraisonData: Omit<Livraison, 'id' | 'numero_livraison' | 'created_at' | 'updated_at' | 'articles'>
  ): Promise<string | null> => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: livraison, error } = await supabase
        .from('livraisons')
        .insert({
          ...livraisonData,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Livraison créée",
        description: `Livraison ${livraison.numero_livraison} créée avec succès`,
      });

      await fetchLivraisons();
      return livraison.id;
    } catch (err) {
      console.error('Erreur lors de la création de la livraison:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de créer la livraison",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une livraison
  const updateLivraisonStatut = async (
    id: string, 
    nouveauStatut: Livraison['statut'],
    updates?: Partial<Livraison>
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      const updateData: any = {
        statut: nouveauStatut,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
        ...updates
      };

      // Ajouter les dates selon le statut
      if (nouveauStatut === 'livre' && !updates?.date_livraison_reelle) {
        updateData.date_livraison_reelle = new Date().toISOString();
      }
      if (nouveauStatut === 'en_cours' && !updates?.date_expedition) {
        updateData.date_expedition = new Date().toISOString();
      }

      const { error } = await supabase
        .from('livraisons')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Livraison marquée comme ${nouveauStatut}`,
      });

      await fetchLivraisons();
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une livraison
  const updateLivraison = async (id: string, updates: Partial<Livraison>): Promise<boolean> => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('livraisons')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Livraison mise à jour",
        description: "La livraison a été mise à jour avec succès",
      });

      await fetchLivraisons();
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la livraison:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la livraison",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une livraison
  const deleteLivraison = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('livraisons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Livraison supprimée",
        description: "La livraison a été supprimée avec succès",
      });

      await fetchLivraisons();
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la livraison:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la livraison",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les statistiques des livraisons
  const getLivraisonsStats = async (filters?: LivraisonFilters): Promise<LivraisonStats | null> => {
    try {
      let query = supabase
        .from('livraisons')
        .select('*');

      // Appliquer les mêmes filtres que pour les livraisons
      if (filters?.statut && filters.statut !== 'tous') {
        query = query.eq('statut', filters.statut);
      }
      if (filters?.transporteur && filters.transporteur !== 'tous') {
        query = query.eq('transporteur', filters.transporteur);
      }
      if (filters?.ville && filters.ville !== 'tous') {
        query = query.eq('ville', filters.ville);
      }
      if (filters?.date_debut) {
        query = query.gte('date_creation', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date_creation', filters.date_fin);
      }

      const { data, error } = await query;

      if (error) throw error;

      const livraisons = data || [];
      
      // Calculer les statistiques
      const total_livraisons = livraisons.length;
      const en_cours = livraisons.filter(l => l.statut === 'en_cours').length;
      const livrees = livraisons.filter(l => l.statut === 'livre').length;
      const non_livrees = livraisons.filter(l => l.statut === 'non_livre').length;
      const retours = livraisons.filter(l => l.statut === 'retour').length;
      const annulees = livraisons.filter(l => l.statut === 'annule').length;
      const valeur_totale = livraisons.reduce((sum, l) => sum + l.valeur_totale, 0);

      // Grouper par transporteur
      const livraisons_par_transporteur = livraisons.reduce((acc, l) => {
        const transporteur = l.transporteur || 'Non défini';
        acc[transporteur] = (acc[transporteur] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Grouper par ville
      const livraisons_par_ville = livraisons.reduce((acc, l) => {
        const ville = l.ville || 'Non définie';
        acc[ville] = (acc[ville] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Évolution mensuelle (derniers 12 mois)
      const evolution_mensuelle = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const mois = date.toISOString().slice(0, 7); // YYYY-MM
        
        const livraisonsDuMois = livraisons.filter(l => 
          l.date_creation?.slice(0, 7) === mois
        );
        
        evolution_mensuelle.push({
          mois: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          total: livraisonsDuMois.reduce((sum, l) => sum + l.valeur_totale, 0),
          nombre: livraisonsDuMois.length
        });
      }

      return {
        total_livraisons,
        en_cours,
        livrees,
        non_livrees,
        retours,
        annulees,
        valeur_totale,
        livraisons_par_transporteur,
        livraisons_par_ville,
        evolution_mensuelle
      };
    } catch (err) {
      console.error('Erreur lors du calcul des statistiques:', err);
      return null;
    }
  };

  // Récupérer les livraisons depuis les ventes en ligne
  const syncLivraisonsFromVentes = async (): Promise<boolean> => {
    try {
      setLoading(true);

      // D'abord récupérer toutes les livraisons existantes pour obtenir les vente_id
      const { data: livraisonsExistantes, error: livraisonsError } = await supabase
        .from('livraisons')
        .select('vente_id');

      if (livraisonsError) throw livraisonsError;

      // Extraire les IDs des ventes qui ont déjà une livraison
      const ventesAvecLivraison = (livraisonsExistantes || []).map(l => l.vente_id);

      // Récupérer toutes les ventes de type "commande (livraison)"
      const { data: toutesVentesLivraison, error: ventesError } = await supabase
        .from('ventes')
        .select('*')
        .eq('type_vente', 'commande (livraison)');

      if (ventesError) throw ventesError;

      // Filtrer les ventes qui n'ont pas encore de livraison
      const ventesLivraison = (toutesVentesLivraison || []).filter(
        vente => !ventesAvecLivraison.includes(vente.id)
      );

      if (ventesLivraison.length === 0) {
        toast({
          title: "Synchronisation terminée",
          description: "Aucune nouvelle commande de livraison à synchroniser",
        });
        return true;
      }

      // Créer les livraisons pour chaque vente de type commande (livraison)
      let successCount = 0;
      let errorCount = 0;

      for (const vente of ventesLivraison) {
        try {
          const livraisonData = {
            vente_id: vente.id,
            client_nom: vente.client_nom,
            client_email: vente.client_email,
            adresse_livraison: vente.adresse_livraison || 'Adresse à définir',
            pays: 'Maroc',
            statut: 'en_cours' as const,
            total_articles: 0,
            valeur_totale: vente.total_ttc,
            date_creation: vente.date_vente
          };

          const { data: { user } } = await supabase.auth.getUser();

          const { error: insertError } = await supabase
            .from('livraisons')
            .insert({
              ...livraisonData,
              created_by: user?.id,
              updated_by: user?.id
            });

          if (insertError) {
            console.error(`Erreur lors de la création de livraison pour vente ${vente.numero_vente}:`, insertError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Erreur lors de la création de livraison pour vente ${vente.numero_vente}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Synchronisation réussie",
          description: `${successCount} nouvelle(s) livraison(s) créée(s)${errorCount > 0 ? ` (${errorCount} erreur(s))` : ''}`,
        });
        
        // Recharger les livraisons
        await fetchLivraisons();
      } else {
        toast({
          title: "Erreur de synchronisation",
          description: "Aucune livraison n'a pu être créée",
          variant: "destructive",
        });
      }

      return successCount > 0;
    } catch (err) {
      console.error('Erreur lors de la synchronisation:', err);
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser les livraisons",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Charger les livraisons au montage du composant
  useEffect(() => {
    fetchLivraisons();
  }, []);

  return {
    livraisons,
    loading,
    error,
    fetchLivraisons,
    createLivraison,
    updateLivraison,
    updateLivraisonStatut,
    deleteLivraison,
    getLivraisonsStats,
    syncLivraisonsFromVentes,
    refetch: fetchLivraisons
  };
} 