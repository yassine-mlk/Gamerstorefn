import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useCash } from '@/hooks/useCash';

export interface VenteArticle {
  id?: string;
  vente_id?: string;
  produit_id: string;
  produit_type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  nom_produit: string;
  code_barre?: string;
  marque?: string;
  modele?: string;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  quantite: number;
  remise_unitaire?: number;
  total_ht: number;
  total_ttc: number;
  created_at?: string;
}

export interface VentePaiement {
  id?: string;
  vente_id?: string;
  montant: number;
  mode_paiement: 'especes' | 'carte' | 'virement' | 'cheque';
  numero_transaction?: string;
  numero_cheque?: string;
  date_echeance?: string;
  compte_bancaire_id?: string;
  banque?: string;
  statut: 'en_attente' | 'valide' | 'refuse' | 'annule';
  date_paiement?: string;
  created_at?: string;
  created_by?: string;
}

export interface PaiementDetaille {
  mode_paiement: 'especes' | 'carte' | 'virement' | 'cheque';
  montant: number;
  numero_cheque?: string;
  date_echeance?: string;
  compte_bancaire_id?: string;
}

export interface Vente {
  id?: string;
  numero_vente?: string;
  date_vente?: string;
  client_id?: string;
  client_nom: string;
  client_email?: string;
  vendeur_id?: string;
  vendeur_nom?: string;
  sous_total: number;
  tva: number;
  remise: number;
  total_ht: number;
  total_ttc: number;
  mode_paiement: string;
  type_vente: string;
  statut: 'en_cours' | 'payee' | 'partiellement_payee' | 'annulee' | 'remboursee';
  adresse_livraison?: string;
  frais_livraison?: number;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  notes?: string;
  commentaire_interne?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  
  // Relations
  articles?: VenteArticle[];
  paiements?: VentePaiement[];
}

export interface VenteFilters {
  search?: string;
  statut?: string;
  mode_paiement?: string;
  type_vente?: string;
  date_debut?: string;
  date_fin?: string;
  client_id?: string;
  vendeur_id?: string;
}

export interface VenteStats {
  total_ventes: number;
  nombre_ventes: number;
  vente_moyenne: number;
  nombre_clients: number;
  ventes_par_statut: Record<string, number>;
  ventes_par_mode_paiement: Record<string, number>;
  ventes_par_type: Record<string, number>;
  evolution_mensuelle: Array<{
    mois: string;
    total: number;
    nombre: number;
  }>;
}

export function useVentes() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { addMouvementFromVente } = useBankAccounts();
  const { addCashTransactionFromVente } = useCash();

  // Charger toutes les ventes
  const fetchVentes = async (filters?: VenteFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Première tentative avec les relations
      let query = supabase
        .from('ventes')
        .select(`
          *,
          articles:ventes_articles(*),
          paiements:ventes_paiements(*)
        `)
        .order('date_vente', { ascending: false });

      // Appliquer les filtres
      if (filters?.search) {
        query = query.or(`client_nom.ilike.%${filters.search}%,numero_vente.ilike.%${filters.search}%`);
      }
      if (filters?.statut && filters.statut !== 'tous') {
        query = query.eq('statut', filters.statut);
      }
      if (filters?.mode_paiement && filters.mode_paiement !== 'tous') {
        query = query.eq('mode_paiement', filters.mode_paiement);
      }
      if (filters?.type_vente && filters.type_vente !== 'tous') {
        query = query.eq('type_vente', filters.type_vente);
      }
      if (filters?.date_debut) {
        query = query.gte('date_vente', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date_vente', filters.date_fin);
      }
      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters?.vendeur_id) {
        query = query.eq('vendeur_id', filters.vendeur_id);
      }

      const { data, error } = await query;

      if (error) {
        // Si erreur de relation (PGRST200), essayer sans les relations
        if (error.code === 'PGRST200' || error.message.includes('relationship')) {
          console.warn('Problème de relation détecté, chargement des ventes sans relations:', error);
          
          // Charger seulement les ventes
          let simpleQuery = supabase
            .from('ventes')
            .select('*')
            .order('date_vente', { ascending: false });

          // Réappliquer les filtres
          if (filters?.search) {
            simpleQuery = simpleQuery.or(`client_nom.ilike.%${filters.search}%,numero_vente.ilike.%${filters.search}%`);
          }
          if (filters?.statut && filters.statut !== 'tous') {
            simpleQuery = simpleQuery.eq('statut', filters.statut);
          }
          if (filters?.mode_paiement && filters.mode_paiement !== 'tous') {
            simpleQuery = simpleQuery.eq('mode_paiement', filters.mode_paiement);
          }
          if (filters?.type_vente && filters.type_vente !== 'tous') {
            simpleQuery = simpleQuery.eq('type_vente', filters.type_vente);
          }
          if (filters?.date_debut) {
            simpleQuery = simpleQuery.gte('date_vente', filters.date_debut);
          }
          if (filters?.date_fin) {
            simpleQuery = simpleQuery.lte('date_vente', filters.date_fin);
          }
          if (filters?.client_id) {
            simpleQuery = simpleQuery.eq('client_id', filters.client_id);
          }
          if (filters?.vendeur_id) {
            simpleQuery = simpleQuery.eq('vendeur_id', filters.vendeur_id);
          }

          const { data: simpleData, error: simpleError } = await simpleQuery;
          
          if (simpleError) throw simpleError;

          // Charger manuellement les articles et paiements pour chaque vente
          const ventesWithRelations = await Promise.all(
            (simpleData || []).map(async (vente) => {
              // Charger les articles
              const { data: articles } = await supabase
                .from('ventes_articles')
                .select('*')
                .eq('vente_id', vente.id);

              // Charger les paiements
              const { data: paiements } = await supabase
                .from('ventes_paiements')
                .select('*')
                .eq('vente_id', vente.id);

              return {
                ...vente,
                articles: articles || [],
                paiements: paiements || []
              };
            })
          );

          setVentes(ventesWithRelations);
          
          // Mode de compatibilité activé - pas besoin d'afficher un message d'erreur
          console.log("Ventes chargées en mode de compatibilité");
        } else {
          throw error;
        }
      } else {
        setVentes(data || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des ventes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de charger les ventes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle vente
  const createVente = async (
    venteData: Omit<Vente, 'id' | 'numero_vente' | 'created_at' | 'updated_at'>, 
    articles: Omit<VenteArticle, 'id' | 'vente_id'>[],
    paiements?: PaiementDetaille[]
  ): Promise<string | null> => {
    try {
      setLoading(true);

      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Utiliser la fonction SQL pour s'assurer que le profil existe
      try {
        await supabase.rpc('ensure_profile_exists', {
          user_id: user.id,
          user_email: user.email || '',
          user_name: user.user_metadata?.name || user.email || 'Utilisateur'
        });
      } catch (profileError) {
        console.warn('Impossible de créer le profil automatiquement:', profileError);
        // Continuer sans vendeur_id si la création du profil échoue
      }
      
      // Préparer les données de vente
      const venteDataToInsert = {
        ...venteData,
        created_by: user.id,
        updated_by: user.id,
        vendeur_id: user.id,
        vendeur_nom: user.user_metadata?.name || user.email || 'Utilisateur'
      };
      
      // Créer la vente
      const { data: vente, error: venteError } = await supabase
        .from('ventes')
        .insert(venteDataToInsert)
        .select()
        .single();

      if (venteError) throw venteError;

      // Créer les articles de vente
      if (articles.length > 0) {
        const articlesWithVenteId = articles.map(article => ({
          ...article,
          vente_id: vente.id
        }));

        const { error: articlesError } = await supabase
          .from('ventes_articles')
          .insert(articlesWithVenteId);

        if (articlesError) throw articlesError;
      }

      // Créer les paiements
      if (paiements && paiements.length > 0) {
        // Paiements multiples détaillés
        const paymentsToInsert = paiements.map(paiement => ({
          vente_id: vente.id,
          montant: paiement.montant,
          mode_paiement: paiement.mode_paiement,
          numero_cheque: paiement.numero_cheque,
          date_echeance: paiement.date_echeance,
          compte_bancaire_id: paiement.compte_bancaire_id,
          statut: venteData.statut === 'payee' ? 'valide' : 'en_attente',
          created_by: user.id
        }));

        const { error: paiementError } = await supabase
          .from('ventes_paiements')
          .insert(paymentsToInsert);

        if (paiementError) throw paiementError;

        // Si c'est un paiement par chèque, l'ajouter à la liste des chèques
        for (const paiement of paiements) {
          if (paiement.mode_paiement === 'cheque' && paiement.numero_cheque && paiement.date_echeance) {
            try {
              const savedCheques = localStorage.getItem('gamerstore_cheques');
              const cheques = savedCheques ? JSON.parse(savedCheques) : [];
              
              const nouveauCheque = {
                id: `cheque_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                numero_cheque: paiement.numero_cheque,
                montant: paiement.montant,
                date_emission: new Date().toISOString().split('T')[0],
                date_echeance: paiement.date_echeance,
                client_nom: venteData.client_nom,
                client_email: venteData.client_email,
                vente_id: vente.id,
                numero_vente: vente.numero_vente,
                statut: 'en_attente' as const,
                created_at: new Date().toISOString()
              };

              cheques.push(nouveauCheque);
              localStorage.setItem('gamerstore_cheques', JSON.stringify(cheques));
            } catch (error) {
              console.warn('Erreur lors de l\'ajout du chèque:', error);
            }
          }
        }

        // Ajouter les mouvements de caisse et bancaires selon le mode de paiement
        for (const paiement of paiements) {
          if (venteData.statut === 'payee') {
            if (paiement.mode_paiement === 'especes') {
              // Ajouter à la caisse physique
              try {
                addCashTransactionFromVente({
                  type: "entree",
                  amount: paiement.montant,
                  description: `Vente ${vente.numero_vente} - ${venteData.client_nom} (Espèces)`,
                  category: "Vente",
                  user: venteData.vendeur_nom || "Vendeur",
                  vente_id: vente.id,
                  numero_vente: vente.numero_vente
                });
              } catch (error) {
                console.warn('Erreur lors de l\'ajout à la caisse:', error);
              }
            } else if (paiement.mode_paiement === 'virement' && paiement.compte_bancaire_id) {
              // Ajouter au compte bancaire
              try {
                addMouvementFromVente({
                  compte_bancaire_id: paiement.compte_bancaire_id,
                  type_mouvement: 'Crédit',
                  montant: paiement.montant,
                  libelle: `Vente ${vente.numero_vente} - ${venteData.client_nom}`,
                  categorie: 'Vente',
                  mode_paiement: 'Virement',
                  beneficiaire: 'Gamerstore',
                  emetteur: venteData.client_nom,
                  statut: 'Validé',
                  rapproche: false
                });
              } catch (error) {
                console.warn('Erreur lors de l\'ajout au compte bancaire:', error);
              }
            }
            // Note: Les chèques seront traités lors de leur encaissement
            // Note: Les paiements carte peuvent être traités selon votre logique métier
          }
        }
      } else {
        // Paiement unique traditionnel
        const { error: paiementError } = await supabase
          .from('ventes_paiements')
          .insert({
            vente_id: vente.id,
            montant: venteData.total_ttc,
            mode_paiement: venteData.mode_paiement === 'mixte' ? 'carte' : venteData.mode_paiement,
            statut: venteData.statut === 'payee' ? 'valide' : 'en_attente',
            created_by: user.id
          });

        if (paiementError) throw paiementError;

        // Ajouter le mouvement de caisse ou bancaire pour le paiement unique
        if (venteData.statut === 'payee') {
          if (venteData.mode_paiement === 'especes') {
            // Ajouter à la caisse physique
            try {
              addCashTransactionFromVente({
                type: "entree",
                amount: venteData.total_ttc,
                description: `Vente ${vente.numero_vente} - ${venteData.client_nom} (Espèces)`,
                category: "Vente",
                user: venteData.vendeur_nom || "Vendeur",
                vente_id: vente.id,
                numero_vente: vente.numero_vente
              });
            } catch (error) {
              console.warn('Erreur lors de l\'ajout à la caisse:', error);
            }
          }
          // Note: Les autres modes de paiement (carte, virement, chèque) nécessitent plus d'informations
          // qui ne sont pas disponibles dans le mode paiement unique traditionnel
        }
      }

      toast({
        title: "Vente créée",
        description: `Vente ${vente.numero_vente} créée avec succès`,
      });

      // Recharger les ventes (ne pas faire échouer si ça ne marche pas)
      try {
        await fetchVentes();
      } catch (fetchError) {
        console.warn('Erreur lors du rechargement des ventes:', fetchError);
        // Ne pas faire échouer la création de vente pour ça
      }
      
      return vente.id;
    } catch (err) {
      console.error('Erreur lors de la création de la vente:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de créer la vente",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une vente
  const updateVente = async (id: string, updates: Partial<Vente>): Promise<boolean> => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('ventes')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Vente mise à jour",
        description: "La vente a été mise à jour avec succès",
      });

      await fetchVentes();
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la vente:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la vente",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une vente
  const deleteVente = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('ventes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Vente supprimée",
        description: "La vente a été supprimée avec succès",
      });

      await fetchVentes();
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la vente:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vente",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les statistiques des ventes
  const getVentesStats = async (filters?: VenteFilters): Promise<VenteStats | null> => {
    try {
      let query = supabase
        .from('ventes')
        .select('*');

      // Appliquer les mêmes filtres que pour les ventes
      if (filters?.statut && filters.statut !== 'tous') {
        query = query.eq('statut', filters.statut);
      }
      if (filters?.mode_paiement && filters.mode_paiement !== 'tous') {
        query = query.eq('mode_paiement', filters.mode_paiement);
      }
      if (filters?.type_vente && filters.type_vente !== 'tous') {
        query = query.eq('type_vente', filters.type_vente);
      }
      if (filters?.date_debut) {
        query = query.gte('date_vente', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date_vente', filters.date_fin);
      }

      const { data, error } = await query;

      if (error) throw error;

      const ventes = data || [];
      
      // Calculer les statistiques
      const total_ventes = ventes.reduce((sum, vente) => sum + vente.total_ttc, 0);
      const nombre_ventes = ventes.length;
      const vente_moyenne = nombre_ventes > 0 ? total_ventes / nombre_ventes : 0;
      const nombre_clients = new Set(ventes.map(v => v.client_nom)).size;

      // Grouper par statut
      const ventes_par_statut = ventes.reduce((acc, vente) => {
        acc[vente.statut] = (acc[vente.statut] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Grouper par mode de paiement
      const ventes_par_mode_paiement = ventes.reduce((acc, vente) => {
        acc[vente.mode_paiement] = (acc[vente.mode_paiement] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Grouper par type
      const ventes_par_type = ventes.reduce((acc, vente) => {
        acc[vente.type_vente] = (acc[vente.type_vente] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Évolution mensuelle (derniers 12 mois)
      const evolution_mensuelle = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const mois = date.toISOString().slice(0, 7); // YYYY-MM
        
        const ventesduMois = ventes.filter(v => 
          v.date_vente?.slice(0, 7) === mois
        );
        
        evolution_mensuelle.push({
          mois: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          total: ventesduMois.reduce((sum, v) => sum + v.total_ttc, 0),
          nombre: ventesduMois.length
        });
      }

      return {
        total_ventes,
        nombre_ventes,
        vente_moyenne,
        nombre_clients,
        ventes_par_statut,
        ventes_par_mode_paiement,
        ventes_par_type,
        evolution_mensuelle
      };
    } catch (err) {
      console.error('Erreur lors du calcul des statistiques:', err);
      return null;
    }
  };

  // Charger les ventes au montage du composant
  useEffect(() => {
    fetchVentes();
  }, []);

  return {
    ventes,
    loading,
    error,
    fetchVentes,
    createVente,
    updateVente,
    deleteVente,
    getVentesStats,
    refetch: fetchVentes
  };
} 