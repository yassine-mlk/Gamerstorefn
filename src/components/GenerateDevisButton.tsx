import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { useDevis } from '@/hooks/useDevis';
import { DevisPreview } from '@/components/DevisPreview';

interface Product {
  id: string;
  nom?: string;
  marque?: string;
  modele?: string;
  prix?: number;
  prix_achat?: number;
  image_url?: string;
}

interface GenerateDevisButtonProps {
  product: Product;
  productType: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  className?: string;
}

export function GenerateDevisButton({ product, productType, className }: GenerateDevisButtonProps) {
  const { toast } = useToast();
  const { clients } = useClients();
  const { createDevis } = useDevis();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [avecTva, setAvecTva] = useState(false);
  const [fraisLivraison, setFraisLivraison] = useState(0);
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [createdDevis, setCreatedDevis] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV-${year}${month}${day}-${random}`;
  };

  const handleCreateDevis = async () => {
    if (!selectedClient) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const selectedClientData = clients.find(c => c.id === selectedClient);
      if (!selectedClientData) {
        throw new Error('Client non trouvé');
      }

      const productName = product.nom || `${product.marque} ${product.modele}`;
      const productPrice = product.prix || product.prix_achat || 0;
      const sousTotal = productPrice * quantite;
      const tvaAmount = avecTva ? sousTotal * 0.20 : 0;
      
      const newDevis = {
        numero_devis: generateQuoteNumber(),
        client_id: selectedClient,
        date_creation: new Date().toISOString(),
        date_expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        statut: 'en_attente' as const,
        sous_total: sousTotal,
        total_ht: sousTotal,
        tva: tvaAmount,
        total_ttc: sousTotal + tvaAmount + fraisLivraison,
        frais_livraison: fraisLivraison,
        notes: notes,
        articles: [{
          produit_id: product.id,
          produit_type: productType,
          nom_produit: productName,
          prix_unitaire_ht: productPrice,
          prix_unitaire_ttc: productPrice,
          quantite: quantite,
          total_ht: sousTotal,
          total_ttc: sousTotal
        }]
      };

      const devisId = await createDevis(newDevis);
      
      // Créer l'objet devis complet pour l'aperçu
      const fullDevis = {
        id: devisId,
        ...newDevis,
        client: selectedClientData,
        created_at: new Date().toISOString(),
        articles: newDevis.articles.map(article => ({
          ...article,
          id: 'temp-' + Math.random(),
          devis_id: devisId,
          created_at: new Date().toISOString()
        }))
      };
      
      setCreatedDevis(fullDevis);
      setIsOpen(false);
      setShowPreview(true);
      
      toast({
        title: "Devis créé",
        description: `Le devis ${newDevis.numero_devis} a été créé avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis",
        variant: "destructive",
      });
      console.error('Erreur lors de la création du devis:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedClient('');
    setQuantite(1);
    setAvecTva(false);
    setFraisLivraison(0);
    setNotes('');
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={`border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white ${className}`}
        title="Générer un devis"
      >
        <FileText className="w-3 h-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Générer un devis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Produit */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Produit sélectionné</h4>
              <p className="text-sm text-gray-600">
                {product.nom || `${product.marque} ${product.modele}`}
              </p>
              <p className="text-sm font-medium text-green-600">
                {(product.prix || product.prix_achat || 0).toFixed(2)} MAD
              </p>
            </div>

            {/* Client */}
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        {client.type_client === 'societe' ? (
                          <Building className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span>
                          {client.type_client === 'societe' 
                            ? client.nom 
                            : `${client.prenom} ${client.nom}`
                          }
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantité */}
            <div>
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                id="quantite"
                type="number"
                min="1"
                value={quantite}
                onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>

            {/* TVA */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="avec_tva"
                checked={avecTva}
                onChange={(e) => setAvecTva(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="avec_tva">Appliquer la TVA (20%)</Label>
            </div>

            {/* Frais de livraison */}
            <div>
              <Label htmlFor="frais_livraison">Frais de livraison (MAD)</Label>
              <Input
                id="frais_livraison"
                type="number"
                min="0"
                step="0.01"
                value={fraisLivraison}
                onChange={(e) => setFraisLivraison(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Conditions particulières, délais, etc."
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateDevis}
                disabled={!selectedClient || isCreating}
                className="flex-1"
              >
                {isCreating ? 'Création...' : 'Créer le devis'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Aperçu du devis */}
      {showPreview && createdDevis && (
        <DevisPreview
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setCreatedDevis(null);
          }}
          devis={createdDevis}
        />
      )}
    </>
  );
}