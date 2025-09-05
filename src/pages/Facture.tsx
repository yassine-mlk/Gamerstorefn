import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, FileText, Eye, Laptop, Monitor, Mouse, Armchair, Settings, Cpu, Receipt, Search, Filter, Calendar, User } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { type Vente, type VenteArticle, useVentes } from "@/hooks/useVentes";
import { usePcPortables } from "@/hooks/usePcPortables";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { usePeripheriques } from "@/hooks/usePeripheriques";
import { useChaisesGamingSupabase } from "@/hooks/useChaisesGamingSupabase";
import { usePCGamer } from "@/hooks/usePCGamer";
import { useComposantsPC } from "@/hooks/useComposantsPC";

interface ProductItem {
  id: string;
  nom_produit: string;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  quantite: number;
  total_ht: number;
  total_ttc: number;
  produit_type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  produit_id: string;
}

interface InvoiceData {
  numero_vente: string;
  client_nom: string;
  client_email: string;
  client_type: 'particulier' | 'societe';
  client_ice?: string;
  date_vente: string;
  articles: ProductItem[];
  avec_tva: boolean;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
}

type ProductType = 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc' | '';

const productTypes = [
  { value: 'pc_portable', label: 'PC Portable', icon: Laptop },
  { value: 'moniteur', label: 'Moniteur', icon: Monitor },
  { value: 'peripherique', label: 'Périphérique', icon: Mouse },
  { value: 'chaise_gaming', label: 'Chaise Gaming', icon: Armchair },
  { value: 'pc_gamer', label: 'PC Gamer', icon: Settings },
  { value: 'composant_pc', label: 'Composants PC', icon: Cpu }
];

const Facture = () => {
  const { clients } = useClients();
  const { toast } = useToast();
  
  // Hooks pour les ventes et factures
  const { ventes, loading: loadingVentes, fetchVentes } = useVentes();
  
  // Hooks pour les produits
  const { pcPortables, loading: loadingPC } = usePcPortables();
  const { moniteurs, loading: loadingMoniteurs } = useMoniteurs();
  const { peripheriques, loading: loadingPeripheriques } = usePeripheriques();
  const { chaisesGaming, loading: loadingChaises } = useChaisesGamingSupabase();
  const { pcGamerConfigs, loading: loadingPCGamer } = usePCGamer();
  const { composantsPC, loading: loadingComposants } = useComposantsPC();
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    numero_vente: `FAC-${Date.now()}`,
    client_nom: '',
    client_email: '',
    client_type: 'particulier',
    client_ice: '',
    date_vente: new Date().toISOString().split('T')[0],
    articles: [],
    avec_tva: true,
    total_ht: 0,
    total_tva: 0,
    total_ttc: 0
  });
  const [showPreview, setShowPreview] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(0);
  
  // États pour l'onglet des factures existantes
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [showVenteDetails, setShowVenteDetails] = useState(false);
  
  // Vérifier si les données sont en cours de chargement
  const isLoading = loadingPC || loadingMoniteurs || loadingPeripheriques || loadingChaises || loadingPCGamer || loadingComposants;

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.articles, invoiceData.avec_tva]);
  
  // Mise à jour des filtres quand le type de produit change
  useEffect(() => {
    setSelectedProduct('');
  }, [selectedProductType]);
  
  // Charger les ventes au montage du composant
  useEffect(() => {
    fetchVentes();
  }, [fetchVentes]);
  
  // Filtrer les factures (ventes avec document_type='facture')
  const factures = ventes.filter(vente => vente.document_type === 'facture');
  
  // Appliquer les filtres sur les factures
  const filteredFactures = factures.filter(facture => {
    const matchesSearch = !searchTerm || 
      facture.numero_vente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.client_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || facture.statut === statusFilter;
    
    const matchesDate = !dateFilter || 
      (facture.date_vente && facture.date_vente.startsWith(dateFilter));
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Obtenir tous les produits selon le type sélectionné
  const getAllProducts = () => {
    let products: any[] = [];
    
    if (selectedProductType === 'pc_portable') {
       products = pcPortables
         .filter(pc => pc.stock_actuel > 0)
         .map(pc => ({
           id: pc.id,
           nom_produit: pc.nom_produit,
           prix_vente: pc.prix_vente,
           type: 'pc_portable' as const,
           marque: pc.marque,
           image_url: pc.image_url
         }));
     } else if (selectedProductType === 'moniteur') {
       products = moniteurs
         .filter(moniteur => moniteur.stock_actuel > 0)
         .map(moniteur => ({
           id: moniteur.id,
           nom_produit: moniteur.nom_produit,
           prix_vente: moniteur.prix_vente,
           type: 'moniteur' as const,
           marque: moniteur.marque,
           image_url: moniteur.image_url
         }));
     } else if (selectedProductType === 'peripherique') {
       products = peripheriques
         .filter(periph => periph.stock_actuel > 0)
         .map(periph => ({
           id: periph.id,
           nom_produit: periph.nom_produit,
           prix_vente: periph.prix_vente,
           type: 'peripherique' as const,
           marque: periph.marque || 'Non défini',
           image_url: periph.image_url
         }));
     } else if (selectedProductType === 'chaise_gaming') {
       products = chaisesGaming
         .filter(chaise => chaise.stock_actuel > 0)
         .map(chaise => ({
           id: chaise.id,
           nom_produit: chaise.nom_produit,
           prix_vente: chaise.prix_vente,
           type: 'chaise_gaming' as const,
           marque: chaise.marque,
           image_url: chaise.image_url
         }));
    } else if (selectedProductType === 'pc_gamer') {
      products = pcGamerConfigs
        .filter(config => config.statut === 'Actif' && config.stock_possible > 0)
        .map(config => ({
          id: config.id,
          nom_produit: config.nom_config,
          prix_vente: config.prix_vente,
          type: 'pc_gamer' as const,
          marque: 'Configuration',
          image_url: config.image_url
        }));
    } else if (selectedProductType === 'composant_pc') {
      products = composantsPC
        .filter(comp => comp.statut === 'Disponible' && comp.stock_actuel > 0)
        .map(comp => ({
          id: comp.id,
          nom_produit: comp.nom_produit,
          prix_vente: comp.prix_vente,
          type: 'composant_pc' as const,
          marque: 'Composant',
          image_url: comp.image_url
        }));
    }
    
    return products;
  };

  const calculateTotals = () => {
    const totalHT = invoiceData.articles.reduce((sum, article) => 
      sum + article.total_ht, 0
    );
    
    const totalTVA = invoiceData.avec_tva ? totalHT * 0.20 : 0;
    const totalTTC = totalHT + totalTVA;

    setInvoiceData(prev => ({
      ...prev,
      total_ht: totalHT,
      total_tva: totalTVA,
      total_ttc: totalTTC
    }));
  };

  const addProduct = () => {
    if (!selectedProductType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de produit",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedProduct) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit",
        variant: "destructive"
      });
      return;
    }

    const products = getAllProducts();
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const prixUnitaire = customPrice > 0 ? customPrice : product.prix_vente;
    const totalHT = prixUnitaire * quantity;
    const totalTTC = invoiceData.avec_tva ? totalHT * 1.20 : totalHT;
    
    const newArticle: ProductItem = {
      id: `${Date.now()}-${Math.random()}`,
      nom_produit: product.nom_produit,
      prix_unitaire_ht: prixUnitaire,
      prix_unitaire_ttc: invoiceData.avec_tva ? prixUnitaire * 1.20 : prixUnitaire,
      quantite: quantity,
      total_ht: totalHT,
      total_ttc: totalTTC,
      produit_type: selectedProductType,
      produit_id: product.id
    };

    setInvoiceData(prev => ({
      ...prev,
      articles: [...prev.articles, newArticle]
    }));

    // Reset form
    setSelectedProduct('');
    setQuantity(1);
    setCustomPrice(0);
  };

  const removeProduct = (articleId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      articles: prev.articles.filter(article => article.id !== articleId)
    }));
  };

  const selectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setInvoiceData(prev => ({
        ...prev,
        client_nom: client.nom,
        client_email: client.email || '',
        client_type: client.type_client || 'particulier',
        client_ice: client.ice || ''
      }));
    }
  };

  const generatePreview = () => {
    if (invoiceData.articles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive"
      });
      return;
    }

    if (!invoiceData.client_nom) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive"
      });
      return;
    }

    setShowPreview(true);
  };

  // Convertir les données pour le composant InvoicePreview
  const venteForPreview: Vente = {
    id: 'preview',
    numero_vente: invoiceData.numero_vente,
    date_vente: invoiceData.date_vente,
    client_nom: invoiceData.client_nom,
    client_email: invoiceData.client_email,
    client_type: invoiceData.client_type,
    articles: invoiceData.articles as VenteArticle[],
    sous_total: invoiceData.total_ht,
    tva: invoiceData.total_tva,
    remise: 0,
    total_ht: invoiceData.total_ht,
    total_ttc: invoiceData.total_ttc,
    statut: 'payee',
    mode_paiement: 'especes',
    type_vente: 'directe',
    vendeur_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Factures</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Créer une facture
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Toutes les factures ({factures.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Générateur de Factures</h2>
            <Button 
              onClick={generatePreview}
              className="bg-gaming-purple hover:bg-gaming-purple/90 text-white"
              disabled={invoiceData.articles.length === 0 || !invoiceData.client_nom}
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu Facture
            </Button>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de la facture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informations Facture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Numéro de facture</Label>
                <Input
                  id="numero"
                  value={invoiceData.numero_vente}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, numero_vente: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoiceData.date_vente}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, date_vente: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Select onValueChange={selectClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom} {client.type_client === 'societe' ? '(Société)' : '(Particulier)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {invoiceData.client_nom && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p><strong>Nom:</strong> {invoiceData.client_nom}</p>
                <p><strong>Type:</strong> {invoiceData.client_type === 'societe' ? 'Société' : 'Particulier'}</p>
                {invoiceData.client_email && <p><strong>Email:</strong> {invoiceData.client_email}</p>}
                {invoiceData.client_ice && <p><strong>ICE:</strong> {invoiceData.client_ice}</p>}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="tva"
                checked={invoiceData.avec_tva}
                onCheckedChange={(checked) => 
                  setInvoiceData(prev => ({ ...prev, avec_tva: checked as boolean }))
                }
              />
              <Label htmlFor="tva">Avec TVA (20%)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Ajouter des produits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ajouter Produit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                  <span className="text-yellow-400 text-sm">Chargement des produits...</span>
                </div>
              </div>
            )}

            {/* Sélection du type de produit */}
            <div className="space-y-2">
              <Label className="text-gray-700">Type de produit *</Label>
              <Select value={selectedProductType} onValueChange={(value: ProductType) => {
                setSelectedProductType(value);
                setSelectedProduct('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le type de produit" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection du produit */}
            {selectedProductType && (
              <div>
                <Label htmlFor="produit">Produit</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllProducts().map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nom_produit} - {product.prix_vente.toLocaleString()} MAD
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantite">Quantité</Label>
                <Input
                  id="quantite"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="prix-custom">Prix personnalisé (optionnel)</Label>
                <Input
                  id="prix-custom"
                  type="number"
                  min="0"
                  step="0.01"
                  value={customPrice || ''}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Prix par défaut"
                />
              </div>
            </div>

            <Button 
              onClick={addProduct}
              className="w-full bg-gaming-cyan hover:bg-gaming-cyan/90 text-black"
              disabled={!selectedProduct}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter au panier
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits ajoutés ({invoiceData.articles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invoiceData.articles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun produit ajouté</p>
          ) : (
            <div className="space-y-2">
              {invoiceData.articles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{article.nom_produit}</p>
                    <p className="text-sm text-gray-600">
                      {article.quantite} × {article.prix_unitaire_ht.toLocaleString()} MAD = {article.total_ht.toLocaleString()} MAD
                    </p>
                  </div>
                  <Button
                    onClick={() => removeProduct(article.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totaux */}
      {invoiceData.articles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total HT:</span>
                <span className="font-medium">{invoiceData.total_ht.toLocaleString()} MAD</span>
              </div>
              {invoiceData.avec_tva && (
                <div className="flex justify-between">
                  <span>TVA (20%):</span>
                  <span className="font-medium">{invoiceData.total_tva.toLocaleString()} MAD</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC:</span>
                <span>{invoiceData.total_ttc.toLocaleString()} MAD</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

        </TabsContent>
        
        <TabsContent value="list" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Toutes les factures</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="partiellement_payee">Partiellement payée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                  <SelectItem value="remboursee">Remboursée</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          
          {loadingVentes ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-purple"></div>
              <span className="ml-2 text-gray-600">Chargement des factures...</span>
            </div>
          ) : filteredFactures.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Aucune facture trouvée</p>
                  <p className="text-sm">Aucune facture ne correspond à vos critères de recherche.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredFactures.map((facture) => (
                <Card key={facture.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {facture.numero_vente}
                          </h3>
                          <Badge 
                            variant={facture.statut === 'en_cours' ? 'default' : 
                                   facture.statut === 'partiellement_payee' ? 'secondary' : 'destructive'}
                          >
                            {facture.statut === 'en_cours' ? 'En cours' : 
                             facture.statut === 'partiellement_payee' ? 'Partiellement payée' : 
                             facture.statut === 'remboursee' ? 'Remboursée' : 'Annulée'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{facture.client_nom}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(facture.date_vente || '').toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gaming-purple">
                              {facture.total_ttc.toLocaleString()} MAD
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <InvoiceGenerator 
                          vente={facture}
                          onPreview={() => toast({
                            title: "Aperçu facture",
                            description: `Aperçu de la facture ${facture.numero_vente}`,
                          })}
                          onPrint={() => toast({
                            title: "Facture imprimée",
                            description: `Facture ${facture.numero_vente} envoyée à l'imprimante`,
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Aperçu de la facture */}
      <InvoicePreview
        vente={venteForPreview}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={() => {
          toast({
            title: "Facture imprimée",
            description: "La facture a été envoyée à l'imprimante"
          });
        }}
        onDownload={() => {
          toast({
            title: "Facture téléchargée",
            description: "La facture a été téléchargée"
          });
        }}
      />
    </div>
  );
};

export default Facture;