import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ChaiseGaming {
  id: string;
  nom_produit: string;
  code_barre?: string;
  marque: string;
  modele?: string;
  couleur?: string;
  materiau?: string;
  type_rembourrage?: string;
  poids_max?: number;
  reglages?: string;
  dimensions?: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  image_url?: string;
  fournisseur_id?: string;
  statut: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  garantie?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface NewChaiseGaming {
  nom_produit: string;
  code_barre?: string;
  marque: string;
  modele?: string;
  couleur?: string;
  materiau?: string;
  type_rembourrage?: string;
  poids_max?: number;
  reglages?: string;
  dimensions?: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  image_url?: string;
  fournisseur_id?: string;
  statut?: 'Disponible' | 'Stock faible' | 'Rupture' | 'Réservé' | 'Archivé';
  garantie?: string;
  description?: string;
}

// Données de test
const mockChaisesGaming: ChaiseGaming[] = [
  {
    id: '1',
    nom_produit: 'DXRacer Formula Series',
    code_barre: 'DXR001',
    marque: 'DXRacer',
    modele: 'Formula F11',
    couleur: 'Noir/Rouge',
    materiau: 'Cuir PU',
    type_rembourrage: 'Mousse haute densité',
    poids_max: 120,
    reglages: 'Hauteur, Inclinaison, Accoudoirs 4D',
    dimensions: '70x70x125-135cm',
    prix_achat: 1800,
    prix_vente: 2500,
    stock_actuel: 5,
    stock_minimum: 2,
    image_url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400',
    fournisseur_id: '1',
    statut: 'Disponible',
    garantie: '24 mois',
    description: 'Chaise gaming ergonomique avec support lombaire',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nom_produit: 'Secretlab Titan Evo',
    code_barre: 'SEC002',
    marque: 'Secretlab',
    modele: 'Titan Evo 2022',
    couleur: 'Noir',
    materiau: 'NEO Hybrid Leatherette',
    type_rembourrage: 'Mousse froide',
    poids_max: 130,
    reglages: 'Hauteur, Inclinaison, Accoudoirs 4D, Support lombaire',
    dimensions: '75x75x130-140cm',
    prix_achat: 3200,
    prix_vente: 4200,
    stock_actuel: 2,
    stock_minimum: 3,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    fournisseur_id: '2',
    statut: 'Stock faible',
    garantie: '36 mois',
    description: 'Chaise gaming premium avec support lombaire magnétique',
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    nom_produit: 'Corsair T3 Rush',
    code_barre: 'COR003',
    marque: 'Corsair',
    modele: 'T3 Rush',
    couleur: 'Gris/Noir',
    materiau: 'Tissu respirant',
    type_rembourrage: 'Mousse mémoire de forme',
    poids_max: 120,
    reglages: 'Hauteur, Inclinaison, Accoudoirs 3D',
    dimensions: '68x68x120-130cm',
    prix_achat: 1400,
    prix_vente: 1900,
    stock_actuel: 8,
    stock_minimum: 3,
    image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    fournisseur_id: '1',
    statut: 'Disponible',
    garantie: '18 mois',
    description: 'Chaise gaming confortable avec tissu respirant',
    created_at: '2024-01-12T09:15:00Z',
    updated_at: '2024-01-12T09:15:00Z'
  }
];

export const useChaisesGaming = () => {
  const [chaisesGaming, setChaisesGaming] = useState<ChaiseGaming[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Simuler le chargement des données
  useEffect(() => {
    const loadChaisesGaming = async () => {
      try {
        setLoading(true);
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        setChaisesGaming(mockChaisesGaming);
      } catch (error) {
        console.error('Erreur lors du chargement des chaises gaming:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les chaises gaming",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadChaisesGaming();
  }, [toast]);

  const addChaiseGaming = async (newChaise: NewChaiseGaming): Promise<boolean> => {
    try {
      const chaise: ChaiseGaming = {
        id: Date.now().toString(),
        ...newChaise,
        statut: newChaise.stock_actuel === 0 ? 'Rupture' : 
                newChaise.stock_actuel < newChaise.stock_minimum ? 'Stock faible' : 'Disponible',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setChaisesGaming(prev => [...prev, chaise]);
      
      toast({
        title: "Chaise gaming ajoutée",
        description: `${chaise.nom_produit} a été ajoutée au stock`,
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la chaise gaming:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la chaise gaming",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateChaiseGaming = async (id: string, updates: Partial<ChaiseGaming>): Promise<boolean> => {
    try {
      setChaisesGaming(prev => prev.map(chaise => {
        if (chaise.id === id) {
          const updated = { ...chaise, ...updates, updated_at: new Date().toISOString() };
          // Mettre à jour le statut basé sur le stock
          if (updates.stock_actuel !== undefined) {
            updated.statut = updates.stock_actuel === 0 ? 'Rupture' : 
                            updates.stock_actuel < (updates.stock_minimum || chaise.stock_minimum) ? 'Stock faible' : 'Disponible';
          }
          return updated;
        }
        return chaise;
      }));
      
      toast({
        title: "Chaise gaming modifiée",
        description: "Les informations ont été mises à jour",
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la modification de la chaise gaming:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la chaise gaming",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteChaiseGaming = async (id: string): Promise<boolean> => {
    try {
      setChaisesGaming(prev => prev.filter(chaise => chaise.id !== id));
      
      toast({
        title: "Chaise gaming supprimée",
        description: "La chaise a été supprimée du stock",
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la chaise gaming:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la chaise gaming",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    chaisesGaming,
    loading,
    addChaiseGaming,
    updateChaiseGaming,
    deleteChaiseGaming
  };
}; 