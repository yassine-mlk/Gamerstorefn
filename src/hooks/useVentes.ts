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
  image_url?: string; // URL de l'image du produit
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
  document_type?: 'facture' | 'bon_achat';
  client_id?: string;
  client_nom: string;
  client_email?: string;
  client_type?: 'particulier' | 'societe';
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
  const { addMouvementFromVente, removeMouvementsByVente } = useBankAccounts();
  const { addCashTransactionFromVente, removeCashTransactionsByVente } = useCash();
  // Numérotation des ventes: configuration des points de départ par année
  const YEAR_BASELINES: Record<number, number> = {
    2025: 244,
  };

  const parseNumeroVente = (numero?: string): { sequence: number | null; year: number | null } => {
    if (!numero) return { sequence: null, year: null };
    const match = numero.match(/^(\d{1,6})\/(\d{4})$/);
    if (!match) return { sequence: null, year: null };
    const sequence = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    return { sequence: isNaN(sequence) ? null : sequence, year: isNaN(year) ? null : year };
  };

  const formatNumeroVente = (sequence: number, year: number): string => {
    return `${sequence}/${year}`;
  };

  const isNumeroVenteAvailable = async (numero: string, excludeVenteId?: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('ventes')
      .select('id, numero_vente')
      .eq('numero_vente', numero);
    if (error) throw error;
    if (!data || data.length === 0) return true;
    if (excludeVenteId) {
      return data.every(v => v.id === excludeVenteId);
    }
    return false;
  };

  const getNextAvailableNumeroForYear = async (year: number): Promise<string> => {
    const baseline = YEAR_BASELINES[year] ?? 0;
    const { data, error } = await supabase
      .from('ventes')
      .select('numero_vente')
      .ilike('numero_vente', `%/${year}`);
    if (error) throw error;
    const used = new Set<number>();
    for (const row of (data || [])) {
      const { sequence, year: parsedYear } = parseNumeroVente(row.numero_vente as string);
      if (parsedYear === year && sequence !== null) used.add(sequence);
    }
    // Trouver le plus petit nombre libre strictement supérieur au baseline
    let candidate = baseline + 1;
    while (used.has(candidate)) {
      candidate += 1;
    }
    return formatNumeroVente(candidate, year);
  };

  // Bon d'achat: réf au format BA xxx-YYYY (rétro-compatible avec baXXX-YYYY)
  const parseNumeroBonAchat = (numero?: string): { sequence: number | null; year: number | null } => {
    if (!numero) return { sequence: null, year: null };
    // Accepte "BA 001-2025" ou "ba001-2025" (espace optionnel)
    const match = numero.match(/^ba\s*(\d{3,6})-(\d{4})$/i);
    if (!match) return { sequence: null, year: null };
    const sequence = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    return { sequence: isNaN(sequence) ? null : sequence, year: isNaN(year) ? null : year };
  };

  const formatNumeroBonAchat = (sequence: number, year: number): string => {
    const seq = sequence.toString().padStart(3, '0');
    return `BA ${seq}-${year}`; // Format demandé
  };

  const getNextNumeroBonAchatForYear = async (year: number): Promise<string> => {
    const { data, error } = await supabase
      .from('ventes')
      .select('numero_vente')
      // Récupère toutes les refs finissant par -YEAR (couvre BA XXX-YYYY et baXXX-YYYY)
      .ilike('numero_vente', `%-${year}`);
    if (error) throw error;
    const used = new Set<number>();
    for (const row of (data || [])) {
      const { sequence, year: parsedYear } = parseNumeroBonAchat(row.numero_vente as string);
      if (parsedYear === year && sequence !== null) used.add(sequence);
    }
    let candidate = 1;
    while (used.has(candidate)) {
      candidate += 1;
    }
    return formatNumeroBonAchat(candidate, year);
  };



  // Charger toutes les ventes
  const fetchVentes = async (filters?: VenteFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Charger directement les ventes sans relations pour éviter les erreurs
      let query = supabase
        .from('ventes')
        .select('*')
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
      
      if (error) throw error;

      // Charger manuellement les articles et paiements pour chaque vente
      const ventesWithRelations = await Promise.all(
        (data || []).map(async (vente) => {
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

          // Charger le type de client
          let client_type = undefined;
          if (vente.client_id) {
            const { data: clientData } = await supabase
              .from('clients')
              .select('type_client')
              .eq('id', vente.client_id)
              .single();
            client_type = clientData?.type_client;
          }

          return {
            ...vente,
            client_type,
            articles: articles || [],
            paiements: paiements || []
          };
        })
      );

      setVentes(ventesWithRelations);
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

  // Fonction pour mettre à jour le stock d'un produit
  const updateProductStock = async (produit_id: string, produit_type: string, quantite_vendue: number): Promise<boolean> => {
    try {
      let tableName: string;
      
      switch (produit_type) {
        case 'pc_portable':
          tableName = 'pc_portables';
          break;
        case 'moniteur':
          tableName = 'moniteurs';
          break;
        case 'peripherique':
          tableName = 'peripheriques';
          break;
        case 'chaise_gaming':
          tableName = 'chaises_gaming';
          break;
        case 'pc_gamer':
          tableName = 'pc_gamer_configs';
          break;
        case 'composant_pc':
          tableName = 'composants_pc';
          break;
        default:
          throw new Error(`Type de produit non supporté: ${produit_type}`);
      }

      // Récupérer le stock actuel du produit
      const { data: produit, error: fetchError } = await supabase
        .from(tableName)
        .select('stock_actuel')
        .eq('id', produit_id)
        .single();

      if (fetchError) throw fetchError;
      if (!produit) throw new Error(`Produit non trouvé: ${produit_id}`);

      const nouveauStock = produit.stock_actuel - quantite_vendue;
      
      if (nouveauStock < 0) {
        throw new Error(`Stock insuffisant pour le produit ${produit_id}. Stock actuel: ${produit.stock_actuel}, Quantité demandée: ${quantite_vendue}`);
      }

      // Mettre à jour le stock
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          stock_actuel: nouveauStock,
          derniere_modification: new Date().toISOString()
        })
        .eq('id', produit_id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du stock pour ${produit_type} ${produit_id}:`, err);
      throw err;
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

      // Numéro de référence selon le type de document
      const now = new Date();
      const year = now.getFullYear();
      if (!(venteData as any).numero_vente || (venteData as any).numero_vente === '') {
        try {
          if (venteData.document_type === 'bon_achat') {
            (venteDataToInsert as any).numero_vente = await getNextNumeroBonAchatForYear(year);
          } else {
            (venteDataToInsert as any).numero_vente = await getNextAvailableNumeroForYear(year);
          }
        } catch (numError) {
          console.warn('Impossible de calculer le prochain numéro:', numError);
        }
      } else {
        // Si un numéro est fourni, vérifier la dispo
        const provided = (venteData as any).numero_vente as string;
        const ok = await isNumeroVenteAvailable(provided);
        if (!ok) throw new Error('Numéro de vente déjà utilisé');
      }
      
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

        // Mettre à jour le stock pour chaque article vendu
        for (const article of articles) {
          try {
            await updateProductStock(article.produit_id, article.produit_type, article.quantite);
          } catch (stockError) {
            // Si la mise à jour du stock échoue, annuler la vente
            console.error('Erreur lors de la mise à jour du stock, annulation de la vente:', stockError);
            
            // Supprimer la vente créée
            await supabase.from('ventes').delete().eq('id', vente.id);
            
            throw new Error(`Impossible de mettre à jour le stock: ${stockError instanceof Error ? stockError.message : 'Erreur inconnue'}`);
          }
        }
      }

      // Créer les paiements
      if (paiements && paiements.length > 0) {
        // Paiements multiples détaillés
        const paymentsToInsert = paiements.map(paiement => {
          // Validation du compte_bancaire_id pour virement
          if (paiement.mode_paiement === 'virement' && paiement.compte_bancaire_id) {
            // Vérifier que c'est un UUID valide
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(paiement.compte_bancaire_id)) {
              console.error('Invalid compte_bancaire_id:', paiement.compte_bancaire_id, 'Expected UUID format');
              throw new Error(`ID de compte bancaire invalide: ${paiement.compte_bancaire_id}. Format UUID requis.`);
            }
          }
          
          return {
            vente_id: vente.id,
            montant: paiement.montant,
            mode_paiement: paiement.mode_paiement,
            numero_cheque: paiement.numero_cheque,
            date_echeance: paiement.date_echeance,
            compte_bancaire_id: paiement.compte_bancaire_id,
            statut: venteData.statut === 'payee' ? 'valide' : 'en_attente',
            created_by: user.id
          };
        });

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

      // Récupérer la vente actuelle pour vérifier le changement de statut
      const { data: venteActuelle, error: fetchError } = await supabase
        .from('ventes')
        .select('statut, numero_vente')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Validation/normalisation du numéro de vente si mis à jour
      if (updates.numero_vente && updates.numero_vente !== venteActuelle.numero_vente) {
        const { sequence, year } = parseNumeroVente(updates.numero_vente);
        const currentYear = new Date().getFullYear();
        const targetYear = year ?? currentYear;
        // Si format invalide ou année manquante, forcer l'année courante
        if (sequence === null) {
          // Générer un prochain disponible pour l'année courante
          updates.numero_vente = await getNextAvailableNumeroForYear(targetYear);
        } else {
          // Respecter baseline: à partir de baseline+1
          const baseline = YEAR_BASELINES[targetYear] ?? 0;
          const seq = Math.max(sequence, baseline + 1);
          const candidate = formatNumeroVente(seq, targetYear);
          // Si occupé, avancer jusqu'au prochain libre
          if (!(await isNumeroVenteAvailable(candidate, id))) {
            updates.numero_vente = await getNextAvailableNumeroForYear(targetYear);
          } else {
            updates.numero_vente = candidate;
          }
        }
      }

      // Si le statut change vers "annulee" ou "remboursee", rembourser le stock
      if (updates.statut && 
          venteActuelle.statut !== 'annulee' && venteActuelle.statut !== 'remboursee' &&
          (updates.statut === 'annulee' || updates.statut === 'remboursee')) {
        
        // Récupérer les articles de la vente
        const { data: articles, error: articlesError } = await supabase
          .from('ventes_articles')
          .select('*')
          .eq('vente_id', id);

        if (articlesError) throw articlesError;

        // Rembourser le stock pour chaque article
        if (articles && articles.length > 0) {
          for (const article of articles) {
            try {
              await refundProductStock(article.produit_id, article.produit_type, article.quantite);
            } catch (stockError) {
              console.error('Erreur lors du remboursement du stock:', stockError);
              // Continuer malgré l'erreur de remboursement du stock
            }
          }
        }
      }

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

  // Fonction pour rembourser le stock d'un produit (annulation/remboursement)
  const refundProductStock = async (produit_id: string, produit_type: string, quantite_remboursee: number): Promise<boolean> => {
    try {
      let tableName: string;
      
      switch (produit_type) {
        case 'pc_portable':
          tableName = 'pc_portables';
          break;
        case 'moniteur':
          tableName = 'moniteurs';
          break;
        case 'peripherique':
          tableName = 'peripheriques';
          break;
        case 'chaise_gaming':
          tableName = 'chaises_gaming';
          break;
        case 'pc_gamer':
          tableName = 'pc_gamer_configs';
          break;
        case 'composant_pc':
          tableName = 'composants_pc';
          break;
        default:
          throw new Error(`Type de produit non supporté: ${produit_type}`);
      }

      // Récupérer le stock actuel du produit
      const { data: produit, error: fetchError } = await supabase
        .from(tableName)
        .select('stock_actuel')
        .eq('id', produit_id)
        .single();

      if (fetchError) throw fetchError;
      if (!produit) throw new Error(`Produit non trouvé: ${produit_id}`);

      const nouveauStock = produit.stock_actuel + quantite_remboursee;

      // Mettre à jour le stock
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          stock_actuel: nouveauStock,
          derniere_modification: new Date().toISOString()
        })
        .eq('id', produit_id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      console.error(`Erreur lors du remboursement du stock pour ${produit_type} ${produit_id}:`, err);
      throw err;
    }
  };

  // Supprimer une vente
  const deleteVente = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Récupérer les informations de la vente avant de la supprimer
      const { data: vente, error: venteError } = await supabase
        .from('ventes')
        .select('*')
        .eq('id', id)
        .single();

      if (venteError) throw venteError;
      if (!vente) throw new Error('Vente non trouvée');

      // Récupérer les articles de la vente avant de la supprimer
      const { data: articles, error: articlesError } = await supabase
        .from('ventes_articles')
        .select('*')
        .eq('vente_id', id);

      if (articlesError) throw articlesError;

      // Rembourser le stock pour chaque article
      if (articles && articles.length > 0) {
        for (const article of articles) {
          try {
            await refundProductStock(article.produit_id, article.produit_type, article.quantite);
          } catch (stockError) {
            console.error('Erreur lors du remboursement du stock:', stockError);
            // Continuer malgré l'erreur de remboursement du stock
          }
        }
      }

      // Supprimer les transactions de caisse liées à cette vente
      try {
        removeCashTransactionsByVente(id);
      } catch (cashError) {
        console.warn('Erreur lors de la suppression des transactions de caisse:', cashError);
      }

      // Supprimer les mouvements bancaires liés à cette vente
      try {
        removeMouvementsByVente(id, vente.numero_vente);
      } catch (bankError) {
        console.warn('Erreur lors de la suppression des mouvements bancaires:', bankError);
      }

      // Supprimer la vente
      const { error } = await supabase
        .from('ventes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Vente supprimée",
        description: "La vente et ses transactions associées ont été supprimées avec succès",
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