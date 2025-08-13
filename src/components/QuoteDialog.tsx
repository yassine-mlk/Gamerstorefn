import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Building, FileText, Printer, Download, Eye } from 'lucide-react';
import { generateQuoteHTML, previewQuote, printQuote, downloadQuote, QuoteData } from '@/utils/quoteUtils';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';

interface Product {
  id: string;
  nom?: string;
  marque?: string;
  modele?: string;
  prix?: number;
  prix_achat?: number;
  image_url?: string;
}

interface QuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  productType: string;
}

export function QuoteDialog({ isOpen, onClose, product, productType }: QuoteDialogProps) {
  const { toast } = useToast();
  const { clients, loading: loadingClients } = useClients();
  
  const [selectedClient, setSelectedClient] = useState('');
  
  const [quoteData, setQuoteData] = useState({
    quantite: 1,
    avec_tva: false,
    frais_livraison: 0,
    notes: '',
  });

  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV-${year}${month}${day}-${random}`;
  };

  const createQuoteData = (): QuoteData => {
    const selectedClientData = clients.find(c => c.id === selectedClient);
    if (!selectedClientData) {
      throw new Error('Client non trouvé');
    }

    const productName = product.nom || `${product.marque} ${product.modele}`;
    const productPrice = product.prix || product.prix_achat || 0;
    
    // Construire le nom du client selon le type
    const clientName = selectedClientData.type_client === 'societe' 
      ? selectedClientData.nom 
      : `${selectedClientData.prenom} ${selectedClientData.nom}`;
    
    return {
      numero_devis: generateQuoteNumber(),
      date_devis: new Date().toISOString(),
      client_nom: clientName,
      client_email: selectedClientData.email || '',
      client_type: selectedClientData.type_client || 'particulier',
      client_ice: selectedClientData.ice || '',
      articles: [{
        id: product.id,
        nom_produit: productName,
        prix_unitaire_ht: productPrice,
        prix_unitaire_ttc: productPrice,
        quantite: quoteData.quantite,
        produit_type: productType,
        produit_id: product.id,
        image_url: product.image_url,
      }],
      tva: quoteData.avec_tva ? productPrice * quoteData.quantite * 0.20 : 0,
      frais_livraison: quoteData.frais_livraison,
      notes: quoteData.notes,
    };
  };

  const handleAction = async (action: 'preview' | 'print' | 'download') => {
    if (!selectedClient) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    try {
      const quote = createQuoteData();
      const htmlContent = await generateQuoteHTML(quote);

      switch (action) {
        case 'preview':
          previewQuote(htmlContent);
          break;
        case 'print':
          printQuote(htmlContent);
          break;
        case 'download':
          downloadQuote(htmlContent, quote.numero_devis);
          break;
      }

      toast({
        title: "Devis généré",
        description: `Le devis a été ${action === 'preview' ? 'ouvert en aperçu' : action === 'print' ? 'envoyé à l\'impression' : 'téléchargé'}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le devis",
        variant: "destructive",
      });
      console.error('Erreur lors de la génération du devis:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Générer un devis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations produit */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Produit sélectionné</h3>
            <div className="flex items-center gap-4">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.nom || `${product.marque} ${product.modele}`}
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
              <div>
                <p className="font-medium">{product.nom || `${product.marque} ${product.modele}`}</p>
                <p className="text-sm text-gray-600">Prix : {(product.prix || product.prix_achat || 0).toFixed(2)} MAD</p>
              </div>
            </div>
          </div>

          {/* Sélection du client */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sélectionner un client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Choisir un client" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 max-h-60">
                {loadingClients ? (
                  <SelectItem value="loading" disabled>
                    Chargement...
                  </SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="no-clients" disabled>
                    Aucun client disponible
                  </SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        {client.type_client === 'societe' ? (
                          <Building className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-green-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {client.type_client === 'societe' 
                              ? client.nom 
                              : `${client.prenom} ${client.nom}`
                            }
                          </div>
                          {client.type_client === 'societe' && client.ice && (
                            <div className="text-xs text-gray-600">
                              ICE: {client.ice}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {/* Affichage des informations du client sélectionné */}
            {selectedClient && (
              <div className="p-3 bg-gray-50 rounded-lg">
                {(() => {
                  const client = clients.find(c => c.id === selectedClient);
                  if (!client) return null;
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {client.type_client === 'societe' ? (
                          <Building className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-green-600" />
                        )}
                        <span className="font-medium">
                          {client.type_client === 'societe' 
                            ? `${client.nom} (Société)` 
                            : `${client.prenom} ${client.nom} (Particulier)`
                          }
                        </span>
                      </div>
                      {client.email && (
                        <div className="text-sm text-gray-600">
                          Email: {client.email}
                        </div>
                      )}
                      {client.type_client === 'societe' && client.ice && (
                        <div className="text-sm text-gray-600">
                          ICE: {client.ice}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Détails du devis */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                id="quantite"
                type="number"
                min="1"
                value={quoteData.quantite}
                onChange={(e) => setQuoteData({ ...quoteData, quantite: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="frais_livraison">Frais de livraison (MAD)</Label>
              <Input
                id="frais_livraison"
                type="number"
                min="0"
                step="0.01"
                value={quoteData.frais_livraison}
                onChange={(e) => setQuoteData({ ...quoteData, frais_livraison: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          {/* TVA */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="avec_tva"
              checked={quoteData.avec_tva}
              onChange={(e) => setQuoteData({ ...quoteData, avec_tva: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="avec_tva">Appliquer la TVA (20%)</Label>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={quoteData.notes}
              onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
              placeholder="Conditions particulières, délais, etc."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleAction('preview')}
              variant="outline"
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            
            <Button
              onClick={() => handleAction('print')}
              variant="outline"
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            
            <Button
              onClick={() => handleAction('download')}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
