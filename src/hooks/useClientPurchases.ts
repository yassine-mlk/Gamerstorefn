import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ClientPurchase {
  id: string;
  numero_vente: string;
  date_vente: string;
  total_ttc: number;
  mode_paiement: string;
  type_vente: string;
  statut: string;
  articles: ClientPurchaseArticle[];
  notes?: string;
}

export interface ClientPurchaseArticle {
  id: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire_ttc: number;
  total_ttc: number;
  produit_type: string;
}

export function useClientPurchases(clientId?: string) {
  const [purchases, setPurchases] = useState<ClientPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Récupérer l'historique des achats d'un client
  const fetchClientPurchases = async (id: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Récupérer les ventes du client avec leurs articles
      const { data: ventesData, error: ventesError } = await supabase
        .from('ventes')
        .select(`
          id,
          numero_vente,
          date_vente,
          total_ttc,
          mode_paiement,
          type_vente,
          statut,
          notes,
          ventes_articles (
            id,
            nom_produit,
            quantite,
            prix_unitaire_ttc,
            total_ttc,
            produit_type
          )
        `)
        .eq('client_id', id)
        .order('date_vente', { ascending: false });

      if (ventesError) throw ventesError;

      // Transformer les données pour correspondre à notre interface
      const formattedPurchases: ClientPurchase[] = (ventesData || []).map(vente => ({
        id: vente.id,
        numero_vente: vente.numero_vente || '',
        date_vente: vente.date_vente || '',
        total_ttc: vente.total_ttc || 0,
        mode_paiement: vente.mode_paiement || '',
        type_vente: vente.type_vente || '',
        statut: vente.statut || '',
        notes: vente.notes,
        articles: (vente.ventes_articles || []).map((article: any) => ({
          id: article.id,
          nom_produit: article.nom_produit,
          quantite: article.quantite,
          prix_unitaire_ttc: article.prix_unitaire_ttc,
          total_ttc: article.total_ttc,
          produit_type: article.produit_type
        }))
      }));

      setPurchases(formattedPurchases);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'historique des achats';
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

  // Calculer les statistiques des achats
  const getPurchaseStats = () => {
    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.total_ttc, 0);
    const totalArticles = purchases.reduce((sum, purchase) => sum + purchase.articles.length, 0);
    
    const lastPurchase = purchases.length > 0 ? purchases[0] : null;
    
    const purchasesByStatus = purchases.reduce((acc, purchase) => {
      acc[purchase.statut] = (acc[purchase.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const purchasesByType = purchases.reduce((acc, purchase) => {
      acc[purchase.type_vente] = (acc[purchase.type_vente] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPurchases,
      totalAmount,
      totalArticles,
      lastPurchase,
      purchasesByStatus,
      purchasesByType
    };
  };

  // Charger automatiquement les achats quand le clientId change
  useEffect(() => {
    if (clientId) {
      fetchClientPurchases(clientId);
    } else {
      setPurchases([]);
      setError(null);
    }
  }, [clientId]);

  return {
    purchases,
    loading,
    error,
    fetchClientPurchases,
    getPurchaseStats,
    refreshPurchases: () => clientId && fetchClientPurchases(clientId)
  };
} 