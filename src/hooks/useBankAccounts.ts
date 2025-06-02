import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CompteBancaire {
  id: string;
  nom_compte: string;
  nom_banque: string;
  numero_compte?: string;
  iban?: string;
  bic?: string;
  solde_initial: number;
  solde_actuel: number;
  devise: string;
  date_creation: string;
  statut: 'Actif' | 'Inactif' | 'Fermé';
  type_compte: 'Courant' | 'Épargne' | 'Crédit' | 'Professionnel';
  description?: string;
  contact_banque?: string;
  telephone_banque?: string;
  email_banque?: string;
  adresse_banque?: string;
  notes?: string;
}

export interface MouvementBancaire {
  id: string;
  compte_bancaire_id: string;
  type_mouvement: 'Débit' | 'Crédit';
  montant: number;
  libelle: string;
  reference?: string;
  date_mouvement: string;
  date_valeur?: string;
  categorie?: string;
  mode_paiement?: 'Virement' | 'Chèque' | 'Carte' | 'Prélèvement' | 'Autre';
  beneficiaire?: string;
  emetteur?: string;
  statut: 'En attente' | 'Validé' | 'Rejeté' | 'Annulé';
  rapproche: boolean;
  notes?: string;
  piece_jointe?: string;
}

const defaultBankAccounts: CompteBancaire[] = [
  {
    id: '1',
    nom_compte: 'Compte Principal Gamerstore',
    nom_banque: 'Attijariwafa Bank',
    numero_compte: '007780001234567890',
    iban: 'MA64007780001234567890123456',
    solde_initial: 50000.00,
    solde_actuel: 47300.00,
    devise: 'MAD',
    date_creation: '2024-01-01T00:00:00Z',
    statut: 'Actif',
    type_compte: 'Professionnel',
    description: 'Compte principal pour les opérations courantes',
    contact_banque: 'Mohammed Alami',
    telephone_banque: '0522-123456'
  },
  {
    id: '2',
    nom_compte: 'Compte Épargne',
    nom_banque: 'BMCE Bank',
    numero_compte: '011550009876543210',
    iban: 'MA64011550009876543210123456',
    solde_initial: 25000.00,
    solde_actuel: 25000.00,
    devise: 'MAD',
    date_creation: '2024-01-01T00:00:00Z',
    statut: 'Actif',
    type_compte: 'Épargne',
    description: 'Compte d\'épargne pour les réserves',
    contact_banque: 'Fatima Bennani',
    telephone_banque: '0523-654321'
  },
  {
    id: '3',
    nom_compte: 'Compte Fournisseurs',
    nom_banque: 'Banque Populaire',
    numero_compte: '021100005555666677',
    iban: 'MA64021100005555666677123456',
    solde_initial: 15000.00,
    solde_actuel: 13800.00,
    devise: 'MAD',
    date_creation: '2024-01-01T00:00:00Z',
    statut: 'Actif',
    type_compte: 'Professionnel',
    description: 'Compte dédié aux paiements fournisseurs',
    contact_banque: 'Youssef Tazi',
    telephone_banque: '0524-789012'
  }
];

const defaultMovements: MouvementBancaire[] = [
  {
    id: '1',
    compte_bancaire_id: '1',
    type_mouvement: 'Crédit',
    montant: 2500.00,
    libelle: 'Vente matériel gaming - Client VIP',
    date_mouvement: '2024-01-15T10:30:00Z',
    categorie: 'Vente',
    mode_paiement: 'Virement',
    beneficiaire: 'Gamerstore',
    emetteur: 'Martin Jean',
    statut: 'Validé',
    rapproche: true
  },
  {
    id: '2',
    compte_bancaire_id: '1',
    type_mouvement: 'Débit',
    montant: 800.00,
    libelle: 'Achat stock processeurs',
    date_mouvement: '2024-01-14T14:20:00Z',
    categorie: 'Achat Stock',
    mode_paiement: 'Virement',
    beneficiaire: 'TechDistrib Pro',
    emetteur: 'Gamerstore',
    statut: 'Validé',
    rapproche: true
  },
  {
    id: '3',
    compte_bancaire_id: '3',
    type_mouvement: 'Débit',
    montant: 1200.00,
    libelle: 'Paiement facture - Gaming Hardware',
    date_mouvement: '2024-01-13T16:45:00Z',
    categorie: 'Achat Stock',
    mode_paiement: 'Virement',
    beneficiaire: 'Gaming Hardware Wholesale',
    emetteur: 'Gamerstore',
    statut: 'Validé',
    rapproche: true
  }
];

export function useBankAccounts() {
  const [comptes, setComptes] = useState<CompteBancaire[]>([]);
  const [mouvements, setMouvements] = useState<MouvementBancaire[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les données depuis localStorage
  useEffect(() => {
    try {
      const savedComptes = localStorage.getItem('gamerstore_bank_accounts');
      const savedMouvements = localStorage.getItem('gamerstore_bank_movements');
      
      if (savedComptes) {
        setComptes(JSON.parse(savedComptes));
      } else {
        // Vérifier si c'est la toute première utilisation
        const isFirstTimeUser = !localStorage.getItem('gamerstore_initialized');
        
        if (isFirstTimeUser) {
          // Première utilisation : charger les données de démonstration
          setComptes(defaultBankAccounts);
          localStorage.setItem('gamerstore_bank_accounts', JSON.stringify(defaultBankAccounts));
        } else {
          // Utilisateur existant : commencer avec un tableau vide
          setComptes([]);
          localStorage.setItem('gamerstore_bank_accounts', JSON.stringify([]));
        }
      }

      if (savedMouvements) {
        setMouvements(JSON.parse(savedMouvements));
      } else {
        // Vérifier si c'est la toute première utilisation
        const isFirstTimeUser = !localStorage.getItem('gamerstore_initialized');
        
        if (isFirstTimeUser) {
          // Première utilisation : charger les données de démonstration
          setMouvements(defaultMovements);
          localStorage.setItem('gamerstore_bank_movements', JSON.stringify(defaultMovements));
          localStorage.setItem('gamerstore_initialized', 'true');
        } else {
          // Utilisateur existant : commencer avec un tableau vide
          setMouvements([]);
          localStorage.setItem('gamerstore_bank_movements', JSON.stringify([]));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des comptes bancaires:', error);
      setComptes([]);
      setMouvements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les comptes
  const saveComptes = (newComptes: CompteBancaire[]) => {
    try {
      setComptes(newComptes);
      localStorage.setItem('gamerstore_bank_accounts', JSON.stringify(newComptes));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    }
  };

  // Sauvegarder les mouvements
  const saveMouvements = (newMouvements: MouvementBancaire[]) => {
    try {
      setMouvements(newMouvements);
      localStorage.setItem('gamerstore_bank_movements', JSON.stringify(newMouvements));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    }
  };

  // Ajouter un compte bancaire
  const addCompte = (compte: Omit<CompteBancaire, 'id' | 'date_creation' | 'solde_actuel'>) => {
    try {
      const newCompte: CompteBancaire = {
        ...compte,
        id: Date.now().toString(),
        date_creation: new Date().toISOString(),
        solde_actuel: compte.solde_initial
      };

      const newComptes = [...comptes, newCompte];
      const success = saveComptes(newComptes);

      if (success) {
        toast({
          title: "Compte ajouté",
          description: `Le compte ${compte.nom_compte} a été créé avec succès`,
        });
      }

      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du compte bancaire",
        variant: "destructive",
      });
      return false;
    }
  };

  // Modifier un compte bancaire
  const updateCompte = (id: string, updates: Partial<CompteBancaire>) => {
    try {
      const newComptes = comptes.map(compte => 
        compte.id === id ? { ...compte, ...updates } : compte
      );
      
      const success = saveComptes(newComptes);

      if (success) {
        toast({
          title: "Compte modifié",
          description: "Les informations du compte ont été mises à jour",
        });
      }

      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du compte",
        variant: "destructive",
      });
      return false;
    }
  };

  // Supprimer un compte bancaire
  const deleteCompte = (id: string) => {
    try {
      const compte = comptes.find(c => c.id === id);
      if (!compte) return false;

      const newComptes = comptes.filter(c => c.id !== id);
      const newMouvements = mouvements.filter(m => m.compte_bancaire_id !== id);
      
      const success = saveComptes(newComptes) && saveMouvements(newMouvements);

      if (success) {
        toast({
          title: "Compte supprimé",
          description: `Le compte ${compte.nom_compte} a été supprimé`,
        });
      }

      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du compte",
        variant: "destructive",
      });
      return false;
    }
  };

  // Ajouter un mouvement bancaire
  const addMouvement = (mouvement: Omit<MouvementBancaire, 'id' | 'date_mouvement'>) => {
    try {
      const newMouvement: MouvementBancaire = {
        ...mouvement,
        id: Date.now().toString(),
        date_mouvement: new Date().toISOString()
      };

      const newMouvements = [newMouvement, ...mouvements];
      const success = saveMouvements(newMouvements);

      if (success) {
        // Mettre à jour le solde du compte
        updateSoldeCompte(mouvement.compte_bancaire_id);
        
        toast({
          title: "Mouvement ajouté",
          description: `Mouvement de ${mouvement.montant.toFixed(2)} MAD ajouté`,
        });
      }

      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du mouvement",
        variant: "destructive",
      });
      return false;
    }
  };

  // Ajouter un mouvement depuis une vente (sans toast)
  const addMouvementFromVente = (mouvement: Omit<MouvementBancaire, 'id' | 'date_mouvement'>) => {
    try {
      const newMouvement: MouvementBancaire = {
        ...mouvement,
        id: Date.now().toString(),
        date_mouvement: new Date().toISOString()
      };

      const newMouvements = [newMouvement, ...mouvements];
      const success = saveMouvements(newMouvements);

      if (success) {
        // Mettre à jour le solde du compte
        updateSoldeCompte(mouvement.compte_bancaire_id);
      }

      return success;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du mouvement depuis vente:', error);
      return false;
    }
  };

  // Mettre à jour le solde d'un compte
  const updateSoldeCompte = (compteId: string) => {
    const compte = comptes.find(c => c.id === compteId);
    if (!compte) return;

    const mouvementsCompte = mouvements.filter(m => 
      m.compte_bancaire_id === compteId && m.statut === 'Validé'
    );

    const totalMouvements = mouvementsCompte.reduce((sum, mouvement) => {
      return sum + (mouvement.type_mouvement === 'Crédit' ? mouvement.montant : -mouvement.montant);
    }, 0);

    const nouveauSolde = compte.solde_initial + totalMouvements;
    updateCompte(compteId, { solde_actuel: nouveauSolde });
  };

  // Calculer les totaux
  const getTotaux = () => {
    const totalSoldes = comptes
      .filter(c => c.statut === 'Actif')
      .reduce((sum, compte) => sum + compte.solde_actuel, 0);

    const totalEntrees = mouvements
      .filter(m => m.type_mouvement === 'Crédit' && m.statut === 'Validé')
      .reduce((sum, m) => sum + m.montant, 0);

    const totalSorties = mouvements
      .filter(m => m.type_mouvement === 'Débit' && m.statut === 'Validé')
      .reduce((sum, m) => sum + m.montant, 0);

    return {
      totalSoldes,
      totalEntrees,
      totalSorties,
      nombreComptes: comptes.filter(c => c.statut === 'Actif').length
    };
  };

  // Obtenir les mouvements d'un compte
  const getMouvementsCompte = (compteId: string) => {
    return mouvements.filter(m => m.compte_bancaire_id === compteId);
  };

  return {
    comptes,
    mouvements,
    loading,
    addCompte,
    updateCompte,
    deleteCompte,
    addMouvement,
    addMouvementFromVente,
    getMouvementsCompte,
    getTotaux,
    updateSoldeCompte
  };
} 