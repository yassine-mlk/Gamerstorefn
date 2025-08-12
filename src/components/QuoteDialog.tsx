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
  
  const [clientData, setClientData] = useState({
    type_client: 'particulier' as 'particulier' | 'societe',
    nom: '',
    email: '',
  });
  
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
    const productName = product.nom || `${product.marque} ${product.modele}`;
    const productPrice = product.prix || product.prix_achat || 0;
    
    return {
      numero_devis: generateQuoteNumber(),
      date_devis: new Date().toISOString(),
      client_nom: clientData.nom,
      client_email: clientData.email,
      client_type: clientData.type_client,
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
    if (!clientData.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom du client",
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

          {/* Type de client */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Type de client</Label>
            <RadioGroup 
              value={clientData.type_client} 
              onValueChange={(value: 'particulier' | 'societe') => 
                setClientData({...clientData, type_client: value, email: value === 'particulier' ? '' : clientData.email})
              }
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                <RadioGroupItem value="particulier" id="particulier" />
                <Label htmlFor="particulier" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium">Particulier</div>
                    <div className="text-xs text-gray-600">Client individuel</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                <RadioGroupItem value="societe" id="societe" />
                <Label htmlFor="societe" className="flex items-center gap-2 cursor-pointer">
                  <Building className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Société</div>
                    <div className="text-xs text-gray-600">Entreprise</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Informations client */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="client_nom">
                Nom {clientData.type_client === 'societe' ? 'de la société' : 'du client'} *
              </Label>
              <Input
                id="client_nom"
                value={clientData.nom}
                onChange={(e) => setClientData({ ...clientData, nom: e.target.value })}
                placeholder={clientData.type_client === 'societe' ? 'Nom de l\'entreprise' : 'Nom complet du client'}
                className="mt-1"
              />
            </div>
            
            {clientData.type_client === 'societe' && (
              <div>
                <Label htmlFor="client_email">ICE</Label>
                <Input
                  id="client_email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  placeholder="Numéro ICE de l'entreprise"
                  className="mt-1"
                />
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
