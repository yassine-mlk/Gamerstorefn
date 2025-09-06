import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SupplierPurchase {
  id: string;
  fournisseur_id: string;
  numero_facture?: string;
  date_achat: string;
  montant_total: number;
  montant_paye: number;
  montant_restant: number;
  statut_paiement: 'en_attente' | 'partiel' | 'paye';
  mode_paiement?: 'especes' | 'virement' | 'cheque';
  description?: string;
  articles: SupplierPurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface SupplierPurchaseItem {
  id: string;
  achat_fournisseur_id: string;
  nom_article: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

export interface NewSupplierPurchase {
  fournisseur_id: string;
  numero_facture?: string;
  date_achat: string;
  montant_total: number;
  montant_paye?: number;
  mode_paiement?: 'especes' | 'virement' | 'cheque';
  description?: string;
  articles: Omit<SupplierPurchaseItem, 'id' | 'achat_fournisseur_id'>[];
}

export interface SupplierPayment {
  id: string;
  fournisseur_id: string;
  achat_fournisseur_id?: string;
  montant: number;
  mode_paiement: 'especes' | 'virement' | 'cheque';
  compte_bancaire_id?: string;
  date_paiement: string;
  description?: string;
  created_at: string;
}

export interface NewSupplierPayment {
  fournisseur_id: string;
  achat_fournisseur_id?: string;
  montant: number;
  mode_paiement: 'especes' | 'virement' | 'cheque';
  compte_bancaire_id?: string;
  date_paiement: string;
  description?: string;
}

export interface SupplierBalance {
  fournisseur_id: string;
  total_achats: number;
  total_paye: number;
  solde_restant: number;
  derniere_transaction: string;
}

export function useSupplierPurchases() {
  const [purchases, setPurchases] = useState<SupplierPurchase[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [balances, setBalances] = useState<SupplierBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les achats fournisseurs
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('achats_fournisseurs')
        .select(`
          *,
          articles_achats_fournisseurs(*)
        `)
        .order('date_achat', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des achats';
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

  // Charger les paiements fournisseurs
  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('paiements_fournisseurs')
        .select('*')
        .order('date_paiement', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des paiements';
      setError(message);
    }
  };

  // Calculer les soldes par fournisseur
  const calculateBalances = async () => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_supplier_balances');

      if (error) throw error;
      setBalances(data || []);
    } catch (err) {
      console.error('Erreur lors du calcul des soldes:', err);
    }
  };

  // Ajouter un nouvel achat
  const addPurchase = async (newPurchase: NewSupplierPurchase): Promise<SupplierPurchase | null> => {
    try {
      const montant_paye = newPurchase.montant_paye || 0;
      const montant_restant = newPurchase.montant_total - montant_paye;
      let statut_paiement: 'en_attente' | 'partiel' | 'paye' = 'en_attente';
      
      if (montant_paye >= newPurchase.montant_total) {
        statut_paiement = 'paye';
      } else if (montant_paye > 0) {
        statut_paiement = 'partiel';
      }

      const { data: purchaseData, error: purchaseError } = await supabase
        .from('achats_fournisseurs')
        .insert([{
          ...newPurchase,
          montant_paye,
          montant_restant,
          statut_paiement
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Ajouter les articles
      if (newPurchase.articles.length > 0) {
        const articlesWithPurchaseId = newPurchase.articles.map(article => ({
          ...article,
          achat_fournisseur_id: purchaseData.id
        }));

        const { error: articlesError } = await supabase
          .from('articles_achats_fournisseurs')
          .insert(articlesWithPurchaseId);

        if (articlesError) throw articlesError;
      }

      // Si un paiement a été effectué, l'enregistrer
      if (montant_paye > 0 && newPurchase.mode_paiement) {
        await addPayment({
          fournisseur_id: newPurchase.fournisseur_id,
          achat_fournisseur_id: purchaseData.id,
          montant: montant_paye,
          mode_paiement: newPurchase.mode_paiement,
          date_paiement: newPurchase.date_achat,
          description: `Paiement initial pour achat ${newPurchase.numero_facture || purchaseData.id}`
        });
      }

      await fetchPurchases();
      await calculateBalances();
      
      toast({
        title: "Achat ajouté",
        description: `L'achat a été enregistré avec succès`,
      });
      
      return purchaseData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'achat';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Ajouter un paiement
  const addPayment = async (newPayment: NewSupplierPayment): Promise<SupplierPayment | null> => {
    try {
      const { data, error } = await supabase
        .from('paiements_fournisseurs')
        .insert([newPayment])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le statut de l'achat si spécifié
      if (newPayment.achat_fournisseur_id) {
        await updatePurchasePaymentStatus(newPayment.achat_fournisseur_id);
      }

      // Enregistrer le mouvement de caisse ou bancaire
      if (newPayment.mode_paiement === 'especes') {
        await supabase
          .from('transactions_caisse')
          .insert([{
            type: 'sortie',
            montant: newPayment.montant,
            description: `Paiement fournisseur - ${newPayment.description || 'Paiement'}`,
            date_transaction: newPayment.date_paiement
          }]);
      } else if (newPayment.mode_paiement === 'virement' && newPayment.compte_bancaire_id) {
        await supabase
          .from('mouvements_bancaires')
          .insert([{
            compte_bancaire_id: newPayment.compte_bancaire_id,
            type: 'debit',
            montant: newPayment.montant,
            description: `Paiement fournisseur - ${newPayment.description || 'Paiement'}`,
            date_mouvement: newPayment.date_paiement
          }]);
      }

      await fetchPayments();
      await fetchPurchases();
      await calculateBalances();
      
      toast({
        title: "Paiement enregistré",
        description: `Le paiement de ${newPayment.montant} DH a été enregistré`,
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du paiement';
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Mettre à jour le statut de paiement d'un achat
  const updatePurchasePaymentStatus = async (purchaseId: string) => {
    try {
      // Calculer le total payé pour cet achat
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('paiements_fournisseurs')
        .select('montant')
        .eq('achat_fournisseur_id', purchaseId);

      if (paymentsError) throw paymentsError;

      const totalPaye = paymentsData.reduce((sum, payment) => sum + payment.montant, 0);

      // Récupérer le montant total de l'achat
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('achats_fournisseurs')
        .select('montant_total')
        .eq('id', purchaseId)
        .single();

      if (purchaseError) throw purchaseError;

      const montantRestant = purchaseData.montant_total - totalPaye;
      let statutPaiement: 'en_attente' | 'partiel' | 'paye' = 'en_attente';
      
      if (totalPaye >= purchaseData.montant_total) {
        statutPaiement = 'paye';
      } else if (totalPaye > 0) {
        statutPaiement = 'partiel';
      }

      // Mettre à jour l'achat
      const { error: updateError } = await supabase
        .from('achats_fournisseurs')
        .update({
          montant_paye: totalPaye,
          montant_restant: montantRestant,
          statut_paiement: statutPaiement
        })
        .eq('id', purchaseId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut de paiement:', err);
    }
  };

  // Obtenir les achats d'un fournisseur spécifique
  const getPurchasesBySupplier = (supplierId: string) => {
    return purchases.filter(purchase => purchase.fournisseur_id === supplierId);
  };

  // Obtenir les paiements d'un fournisseur spécifique
  const getPaymentsBySupplier = (supplierId: string) => {
    return payments.filter(payment => payment.fournisseur_id === supplierId);
  };

  // Obtenir le solde d'un fournisseur spécifique
  const getSupplierBalance = (supplierId: string) => {
    return balances.find(balance => balance.fournisseur_id === supplierId) || {
      fournisseur_id: supplierId,
      total_achats: 0,
      total_paye: 0,
      solde_restant: 0,
      derniere_transaction: ''
    };
  };

  useEffect(() => {
    fetchPurchases();
    fetchPayments();
    calculateBalances();
  }, []);

  return {
    purchases,
    payments,
    balances,
    loading,
    error,
    addPurchase,
    addPayment,
    getPurchasesBySupplier,
    getPaymentsBySupplier,
    getSupplierBalance,
    refreshData: () => {
      fetchPurchases();
      fetchPayments();
      calculateBalances();
    }
  };
}