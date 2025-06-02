import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CashTransaction {
  id: string;
  type: "entree" | "sortie";
  amount: number;
  description: string;
  category: string;
  date: string;
  user: string;
  vente_id?: string;
  numero_vente?: string;
}

const defaultTransactions: CashTransaction[] = [
  {
    id: "T001",
    type: "entree",
    amount: 450.00,
    description: "Vente accessoires gaming (Espèces)",
    category: "Vente",
    date: "2024-01-15",
    user: "Admin"
  },
  {
    id: "T002",
    type: "sortie",
    amount: 50.00,
    description: "Frais de déplacement (Espèces)",
    category: "Frais",
    date: "2024-01-14",
    user: "Admin"
  },
  {
    id: "T003",
    type: "entree",
    amount: 1200.00,
    description: "Vente PC portable (Espèces)",
    category: "Vente",
    date: "2024-01-13",
    user: "Admin"
  }
];

export function useCash() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les données depuis localStorage
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem('gamerstore_cash_transactions');
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        // Vérifier si c'est la toute première utilisation de l'application
        const isFirstTimeUser = !localStorage.getItem('gamerstore_initialized');
        
        if (isFirstTimeUser) {
          // Première utilisation : charger les données de démonstration
          setTransactions(defaultTransactions);
          localStorage.setItem('gamerstore_cash_transactions', JSON.stringify(defaultTransactions));
          localStorage.setItem('gamerstore_initialized', 'true');
        } else {
          // Utilisateur existant : commencer avec un tableau vide pour les vraies données
          setTransactions([]);
          localStorage.setItem('gamerstore_cash_transactions', JSON.stringify([]));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transactions de caisse:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les transactions
  const saveTransactions = (newTransactions: CashTransaction[]) => {
    try {
      setTransactions(newTransactions);
      localStorage.setItem('gamerstore_cash_transactions', JSON.stringify(newTransactions));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    }
  };

  // Ajouter une transaction de caisse
  const addCashTransaction = (transaction: Omit<CashTransaction, 'id' | 'date'>) => {
    try {
      const newTransaction: CashTransaction = {
        ...transaction,
        id: `T${String(transactions.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0]
      };

      const newTransactions = [newTransaction, ...transactions];
      const success = saveTransactions(newTransactions);

      if (success) {
        toast({
          title: "Transaction ajoutée",
          description: `Transaction de ${transaction.amount.toFixed(2)} MAD ajoutée`,
        });
      }

      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de la transaction",
        variant: "destructive",
      });
      return false;
    }
  };

  // Ajouter une transaction depuis une vente (sans toast)
  const addCashTransactionFromVente = (transaction: Omit<CashTransaction, 'id' | 'date'>) => {
    try {
      const newTransaction: CashTransaction = {
        ...transaction,
        id: `V${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        date: new Date().toISOString().split('T')[0]
      };

      const newTransactions = [newTransaction, ...transactions];
      const success = saveTransactions(newTransactions);

      return success;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction depuis vente:', error);
      return false;
    }
  };

  // Calculer les totaux
  const getTotaux = () => {
    const totalEntrees = transactions
      .filter(t => t.type === "entree")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSorties = transactions
      .filter(t => t.type === "sortie")
      .reduce((sum, t) => sum + t.amount, 0);

    const soldeCaisse = totalEntrees - totalSorties;

    return {
      totalEntrees,
      totalSorties,
      soldeCaisse
    };
  };

  // Fonction pour réinitialiser les données (utile pour les tests)
  const resetCashData = () => {
    setTransactions([]);
    localStorage.setItem('gamerstore_cash_transactions', JSON.stringify([]));
    toast({
      title: "Données réinitialisées",
      description: "L'historique de caisse a été remis à zéro",
    });
  };

  return {
    transactions,
    loading,
    addCashTransaction,
    addCashTransactionFromVente,
    getTotaux,
    resetCashData
  };
} 