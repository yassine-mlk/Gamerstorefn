import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { User, Building, FileText, Printer, Download, Eye, Plus, Mail, Phone, MapPin, Receipt } from 'lucide-react';
import { generateQuoteHTML, previewQuote, printQuote, downloadQuote, QuoteData } from '@/utils/quoteUtils';
import { useToast } from '@/hooks/use-toast';
import { useClients, type NewClient } from '@/hooks/useClients';

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
  const { clients, loading: loadingClients, addClient } = useClients();
  
  const [selectedClient, setSelectedClient] = useState('');
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  
  const [quoteData, setQuoteData] = useState({
    quantite: 1,
    avec_tva: false,
    frais_livraison: 0,
    notes: '',
  });

  const [newClient, setNewClient] = useState<NewClient>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    statut: "Actif",
    type_client: "particulier",
    ice: "",
    notes: ""
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

  const handleAddClient = async () => {
    if (!newClient.nom) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive",
      });
      return;
    }

    setIsAddingClient(true);
    try {
      const addedClient = await addClient(newClient);
      
      // Sélectionner automatiquement le nouveau client
      setSelectedClient(addedClient.id);
      
      // Réinitialiser le formulaire
      setNewClient({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        statut: "Actif",
        type_client: "particulier",
        ice: "",
        notes: ""
      });
      
      // Fermer le formulaire d'ajout
      setShowAddClientForm(false);
      
      toast({
        title: "Succès",
        description: `Client ${newClient.type_client === 'societe' ? newClient.nom : `${newClient.prenom} ${newClient.nom}`} ajouté avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client",
        variant: "destructive",
      });
    } finally {
      setIsAddingClient(false);
    }
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
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Sélectionner un client</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddClientForm(!showAddClientForm)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouveau client
              </Button>
            </div>
            
            {!showAddClientForm && (
              <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Choisir un client" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 max-h-80">
                {loadingClients ? (
                  <SelectItem value="loading" disabled>
                    Chargement...
                  </SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="no-clients" disabled>
                    Aucun client disponible
                  </SelectItem>
                ) : (
                  <>
                    {/* Section Particuliers */}
                    {clients.filter(c => c.type_client === 'particulier').length > 0 && (
                      <>
                        <SelectItem value="header-particuliers" disabled className="font-semibold text-green-700 bg-green-50">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Particuliers ({clients.filter(c => c.type_client === 'particulier').length})
                          </div>
                        </SelectItem>
                        {clients
                          .filter(client => client.type_client === 'particulier')
                          .map((client) => (
                            <SelectItem key={client.id} value={client.id} className="pl-6">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-green-600" />
                                <div>
                                  <div className="font-medium">
                                    {client.prenom} {client.nom}
                                  </div>
                                  {client.email && (
                                    <div className="text-xs text-gray-600">
                                      {client.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                      </>
                    )}

                    {/* Section Sociétés */}
                    {clients.filter(c => c.type_client === 'societe').length > 0 && (
                      <>
                        <SelectItem value="header-societes" disabled className="font-semibold text-purple-700 bg-purple-50 mt-2">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Sociétés ({clients.filter(c => c.type_client === 'societe').length})
                          </div>
                        </SelectItem>
                        {clients
                          .filter(client => client.type_client === 'societe')
                          .map((client) => (
                            <SelectItem key={client.id} value={client.id} className="pl-6">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-purple-600" />
                                <div>
                                  <div className="font-medium">
                                    {client.nom}
                                  </div>
                                  {client.ice && (
                                    <div className="text-xs text-gray-600">
                                      ICE: {client.ice}
                                    </div>
                                  )}
                                  {client.email && (
                                    <div className="text-xs text-gray-600">
                                      {client.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                      </>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
            )}
            
            {/* Formulaire d'ajout de nouveau client */}
            {showAddClientForm && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Ajouter un nouveau client</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddClientForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                {/* Type de client */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Type de client</Label>
                  <RadioGroup 
                    value={newClient.type_client} 
                    onValueChange={(value: any) => setNewClient({...newClient, type_client: value, ice: value === 'particulier' ? '' : newClient.ice})}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg bg-white">
                      <RadioGroupItem value="particulier" id="particulier-quote" />
                      <Label htmlFor="particulier-quote" className="flex items-center gap-2 cursor-pointer text-sm">
                        <User className="w-4 h-4 text-green-600" />
                        Particulier
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg bg-white">
                      <RadioGroupItem value="societe" id="societe-quote" />
                      <Label htmlFor="societe-quote" className="flex items-center gap-2 cursor-pointer text-sm">
                        <Building className="w-4 h-4 text-purple-600" />
                        Société
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="nom-quote" className="text-sm font-medium">
                      {newClient.type_client === 'societe' ? 'Nom de la société *' : 'Nom de famille *'}
                    </Label>
                    <Input
                      id="nom-quote"
                      value={newClient.nom}
                      onChange={(e) => setNewClient({...newClient, nom: e.target.value})}
                      placeholder={newClient.type_client === 'societe' ? "Ex: TechCorp Solutions" : "Ex: Dupont"}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prenom-quote" className="text-sm font-medium">
                      {newClient.type_client === 'societe' ? 'Contact principal' : 'Prénom'}
                    </Label>
                    <Input
                      id="prenom-quote"
                      value={newClient.prenom}
                      onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}
                      placeholder={newClient.type_client === 'societe' ? "Ex: Mohammed Alami" : "Ex: Jean"}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Champ ICE pour les sociétés */}
                {newClient.type_client === 'societe' && (
                  <div>
                    <Label htmlFor="ice-quote" className="text-sm font-medium">Numéro ICE</Label>
                    <Input
                      id="ice-quote"
                      value={newClient.ice}
                      onChange={(e) => setNewClient({...newClient, ice: e.target.value})}
                      placeholder="Ex: 001234567000025"
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="email-quote" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email-quote"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="Ex: client@exemple.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telephone-quote" className="text-sm font-medium">Téléphone</Label>
                    <Input
                      id="telephone-quote"
                      value={newClient.telephone}
                      onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}
                      placeholder="Ex: 06 12 34 56 78"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <Label htmlFor="adresse-quote" className="text-sm font-medium">Adresse</Label>
                  <Textarea
                    id="adresse-quote"
                    value={newClient.adresse}
                    onChange={(e) => setNewClient({...newClient, adresse: e.target.value})}
                    placeholder="Ex: 123 Avenue Mohammed V, Casablanca"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    type="button"
                    onClick={handleAddClient}
                    disabled={!newClient.nom || isAddingClient}
                    className="flex-1"
                  >
                    {isAddingClient ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Ajout en cours...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter le client
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowAddClientForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
            
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
