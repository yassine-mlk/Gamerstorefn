import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface RetourProduit {
  id: string;
  vente_originale_id?: string;
  numero_vente_originale?: string;
  produit_id: string;
  produit_type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  motif_retour: string;
  type_retour: 'retour_simple' | 'reprise_echange';
  client_id?: string;
  client_nom: string;
  client_email?: string;
  date_retour: string;
  statut: 'en_attente' | 'traite' | 'rembourse' | 'refuse';
  mode_remboursement?: 'especes' | 'virement' | 'avoir' | 'carte' | 'cheque';
  compte_bancaire_id?: string;
  created_by?: string;
  notes?: string;
}

export interface RepriseEchange {
  id: string;
  retour_id: string;
  client_id?: string;
  client_nom?: string;
  ancien_produit: {
    id: string;
    nom: string;
    prix: number;
    quantite: number;
  };
  nouveau_produit: {
    id: string;
    nom: string;
    prix: number;
    quantite: number;
  };
  difference_prix: number; // Positif si client doit payer, négatif si remboursement
  mode_paiement_difference?: 'especes' | 'carte' | 'virement' | 'cheque';
  compte_bancaire_id?: string;
  statut: 'en_attente' | 'finalise' | 'annule';
  date_echange: string;
  notes?: string;
}

export function useRetours() {
  const [retours, setRetours] = useState<RetourProduit[]>([]);
  const [reprises, setReprises] = useState<RepriseEchange[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les données depuis localStorage
  useEffect(() => {
    try {
      const savedRetours = localStorage.getItem('gamerstore_retours');
      const savedReprises = localStorage.getItem('gamerstore_reprises');
      
      if (savedRetours) {
        setRetours(JSON.parse(savedRetours));
      } else {
        setRetours([]);
        localStorage.setItem('gamerstore_retours', JSON.stringify([]));
      }

      if (savedReprises) {
        setReprises(JSON.parse(savedReprises));
      } else {
        setReprises([]);
        localStorage.setItem('gamerstore_reprises', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des retours:', error);
      setRetours([]);
      setReprises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les retours
  const saveRetours = (newRetours: RetourProduit[]) => {
    try {
      setRetours(newRetours);
      localStorage.setItem('gamerstore_retours', JSON.stringify(newRetours));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des retours:', error);
      return false;
    }
  };

  // Sauvegarder les reprises
  const saveReprises = (newReprises: RepriseEchange[]) => {
    try {
      setReprises(newReprises);
      localStorage.setItem('gamerstore_reprises', JSON.stringify(newReprises));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des reprises:', error);
      return false;
    }
  };

  // Ajouter un retour
  const addRetour = (retour: Omit<RetourProduit, 'id' | 'date_retour'>) => {
    try {
      const newRetour: RetourProduit = {
        ...retour,
        id: `RET${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        date_retour: new Date().toISOString().split('T')[0]
      };

      const newRetours = [newRetour, ...retours];
      const success = saveRetours(newRetours);

      if (success) {
        toast({
          title: "Retour enregistré",
          description: `Retour ${newRetour.id} créé avec succès`,
        });
      }

      return success ? newRetour.id : null;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du retour",
        variant: "destructive",
      });
      return null;
    }
  };

  // Ajouter une reprise/échange
  const addReprise = (reprise: Omit<RepriseEchange, 'id' | 'date_echange'>) => {
    try {
      const newReprise: RepriseEchange = {
        ...reprise,
        id: `REP${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        date_echange: new Date().toISOString().split('T')[0]
      };

      const newReprises = [newReprise, ...reprises];
      const success = saveReprises(newReprises);

      if (success) {
        toast({
          title: "Reprise enregistrée",
          description: `Reprise ${newReprise.id} créée avec succès`,
        });
      }

      return success ? newReprise.id : null;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement de la reprise",
        variant: "destructive",
      });
      return null;
    }
  };

  // Traiter un retour (remboursement)
  const traiterRetour = (retourId: string, modeRemboursement: 'especes' | 'virement' | 'avoir' | 'carte' | 'cheque', compteBancaireId?: string) => {
    try {
      const newRetours = retours.map(retour => {
        if (retour.id === retourId) {
          return {
            ...retour,
            statut: 'rembourse' as const,
            mode_remboursement: modeRemboursement,
            compte_bancaire_id: compteBancaireId
          };
        }
        return retour;
      });

      const success = saveRetours(newRetours);

      if (success) {
        toast({
          title: "Retour traité",
          description: `Le retour a été remboursé avec succès`,
        });
      }

      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement du retour",
        variant: "destructive",
      });
      return false;
    }
  };

  // Finaliser une reprise
  const finaliserReprise = (repriseId: string) => {
    try {
      const newReprises = reprises.map(reprise => {
        if (reprise.id === repriseId) {
          return {
            ...reprise,
            statut: 'finalise' as const
          };
        }
        return reprise;
      });

      const success = saveReprises(newReprises);

      if (success) {
        toast({
          title: "Reprise finalisée",
          description: `La reprise a été finalisée avec succès`,
        });
      }

      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la finalisation de la reprise",
        variant: "destructive",
      });
      return false;
    }
  };

  // Calculer les statistiques
  const getStats = () => {
    const totalRetours = retours.length;
    const retoursTraites = retours.filter(r => r.statut === 'rembourse').length;
    const montantRetours = retours.filter(r => r.statut === 'rembourse').reduce((sum, r) => sum + r.prix_total, 0);
    
    const totalReprises = reprises.length;
    const represeFinalisees = reprises.filter(r => r.statut === 'finalise').length;

    return {
      totalRetours,
      retoursTraites,
      montantRetours,
      totalReprises,
      represeFinalisees
    };
  };

  return {
    retours,
    reprises,
    loading,
    addRetour,
    addReprise,
    traiterRetour,
    finaliserReprise,
    getStats
  };
} 