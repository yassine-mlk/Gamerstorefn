import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  ShoppingCart,
  Plus,
  Scan,
  Trash2,
  Receipt,
  Banknote,
  Building,
  FileCheck,
  Package,
  Minus,
  Search,
  Grid3X3,
  Laptop,
  Monitor,
  Mouse,
  Armchair,
  Settings,
  Cpu,
  DollarSign,
  Check,
  Printer,
  Calculator,
  CreditCard,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeProductId } from "@/utils/uuid";
import { usePcPortables } from "@/hooks/usePcPortables";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { usePeripheriques } from "@/hooks/usePeripheriques";
import { useChaisesGamingSupabase } from "@/hooks/useChaisesGamingSupabase";
import { usePCGamer } from "@/hooks/usePCGamer";
import { useComposantsPC } from "@/hooks/useComposantsPC";
import { useVentes, type VenteArticle, type PaiementDetaille } from "@/hooks/useVentes";
import { useClients } from "@/hooks/useClients";
import { useBankAccounts } from "@/hooks/useBankAccounts";

interface CartItem {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  codeBarre: string;
  categorie: string;
  type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  stock_disponible: number;
}

type ProductType = 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc' | '';

const productTypes = [
  { value: 'pc_portable', label: 'PC Portable', icon: Laptop, color: 'bg-blue-600' },
  { value: 'moniteur', label: 'Moniteur', icon: Monitor, color: 'bg-green-600' },
  { value: 'peripherique', label: 'Périphérique', icon: Mouse, color: 'bg-purple-600' },
  { value: 'chaise_gaming', label: 'Chaise Gaming', icon: Armchair, color: 'bg-red-600' },
  { value: 'pc_gamer', label: 'PC Gamer', icon: Settings, color: 'bg-orange-600' },
  { value: 'composant_pc', label: 'Composants PC', icon: Cpu, color: 'bg-cyan-600' }
];

export default function VendeurPOS() {
  // Hooks de données
  const { pcPortables, loading: loadingPC } = usePcPortables();
  const { moniteurs, loading: loadingMoniteurs } = useMoniteurs();
  const { peripheriques, loading: loadingPeripheriques } = usePeripheriques();
  const { chaisesGaming, loading: loadingChaises } = useChaisesGamingSupabase();
  const { pcGamerConfigs, loading: loadingPCGamer } = usePCGamer();
  const { composantsPC, loading: loadingComposants } = useComposantsPC();
  const { createVente, loading: loadingVente } = useVentes();
  const { clients, loading: loadingClients } = useClients();
  const { comptes: bankAccounts, loading: loadingBankAccounts } = useBankAccounts();

  // États
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<ProductType>("");
  const [selectedClient, setSelectedClient] = useState("anonymous");
  const [paymentMethod, setPaymentMethod] = useState("especes");
  const [saleType, setSaleType] = useState("magasin");
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  // États pour les paiements
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeEcheance, setChequeEcheance] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  
  // États pour les fonctionnalités POS
  const [reductionMontant, setReductionMontant] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [venteFinalise, setVenteFinalise] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'products' | 'cart'>('categories');
  
  const { toast } = useToast();

  // Vérifier si les données sont en cours de chargement
  const isLoading = loadingPC || loadingMoniteurs || loadingPeripheriques || loadingChaises || loadingPCGamer || loadingComposants || loadingVente || loadingClients;

  // Obtenir tous les produits selon le type sélectionné
  const getAllProducts = () => {
    let products: any[] = [];
    
    if (selectedProductType === 'pc_portable') {
      products = pcPortables.map(pc => ({
        id: pc.id,
        nom: pc.nom_produit,
        prix: pc.prix_vente,
        codeBarre: pc.code_barre || '',
        stock: pc.stock_actuel,
        categorie: 'PC Portable',
        type: 'pc_portable' as const,
        marque: pc.marque
      }));
    } else if (selectedProductType === 'moniteur') {
      products = moniteurs.map(moniteur => ({
        id: moniteur.id,
        nom: moniteur.nom_produit,
        prix: moniteur.prix_vente,
        codeBarre: moniteur.code_barre || '',
        stock: moniteur.stock_actuel,
        categorie: 'Moniteur',
        type: 'moniteur' as const,
        marque: moniteur.marque
      }));
    } else if (selectedProductType === 'peripherique') {
      products = peripheriques.map(periph => ({
        id: periph.id,
        nom: periph.nom_produit,
        prix: periph.prix_vente,
        codeBarre: periph.code_barre || '',
        stock: periph.stock_actuel,
        categorie: periph.categorie,
        type: 'peripherique' as const,
        marque: periph.marque || 'Non défini'
      }));
    } else if (selectedProductType === 'chaise_gaming') {
      products = chaisesGaming.map(chaise => ({
        id: chaise.id,
        nom: chaise.nom_produit,
        prix: chaise.prix_vente,
        codeBarre: chaise.code_barre || '',
        stock: chaise.stock_actuel,
        categorie: 'Chaise Gaming',
        type: 'chaise_gaming' as const,
        marque: chaise.marque
      }));
    } else if (selectedProductType === 'pc_gamer') {
      products = pcGamerConfigs
        .filter(config => config.statut === 'Actif' && config.stock_possible > 0)
        .map(config => ({
          id: config.id,
          nom: config.nom_config,
          prix: config.prix_vente,
          codeBarre: config.code_barre || '',
          stock: config.stock_possible,
          categorie: 'PC Gamer',
          type: 'pc_gamer' as const,
          marque: 'Configuration'
        }));
    } else if (selectedProductType === 'composant_pc') {
      products = composantsPC
        .filter(comp => comp.statut === 'Disponible' && comp.stock_actuel > 0)
        .map(comp => ({
          id: comp.id,
          nom: comp.nom_produit,
          prix: comp.prix_vente,
          codeBarre: comp.code_barre || '',
          stock: comp.stock_actuel,
          categorie: comp.categorie,
          type: 'composant_pc' as const,
          marque: 'Composant'
        }));
    }
    
    return products;
  };

  // Filtrer les produits selon la recherche
  const filteredProducts = getAllProducts().filter(product =>
    product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.codeBarre.includes(searchQuery)
  );

  // Fonction pour ajouter un produit par code-barres
  const addToCartByBarcode = (barcode: string) => {
    const allProducts = [
      ...pcPortables.map(pc => ({ ...pc, type: 'pc_portable' as const })),
      ...moniteurs.map(m => ({ ...m, type: 'moniteur' as const })),
      ...peripheriques.map(p => ({ ...p, type: 'peripherique' as const })),
      ...chaisesGaming.map(c => ({ ...c, type: 'chaise_gaming' as const })),
      ...pcGamerConfigs.filter(config => config.statut === 'Actif').map(pc => ({ ...pc, type: 'pc_gamer' as const })),
      ...composantsPC.filter(comp => comp.statut === 'Disponible').map(c => ({ ...c, type: 'composant_pc' as const }))
    ];

    const product = allProducts.find(p => p.code_barre === barcode);
    if (product) {
      addProductToCart(product);
    } else {
      toast({
        title: "Produit non trouvé",
        description: "Aucun produit avec ce code-barres",
        variant: "destructive",
      });
    }
  };

  // Fonction pour ajouter un produit au panier
  const addProductToCart = (product: any) => {
    const stockDisponible = product.stock_actuel || product.stock_possible || 0;
    
    if (stockDisponible <= 0) {
      toast({
        title: "Stock insuffisant",
        description: "Ce produit n'est plus en stock",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantite >= stockDisponible) {
        toast({
          title: "Stock insuffisant",
          description: `Stock disponible: ${stockDisponible}`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantite: item.quantite + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        nom: product.nom_produit || product.nom_config,
        prix: product.prix_vente,
        quantite: 1,
        codeBarre: product.code_barre || '',
        categorie: product.categorie || 'Autre',
        type: product.type,
        stock_disponible: stockDisponible
      };
      setCart([...cart, newItem]);
    }

    setCurrentView('cart');
    toast({
      title: "Produit ajouté",
      description: `${product.nom_produit || product.nom_config} ajouté au panier`,
    });
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantite + change;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > item.stock_disponible) {
          toast({
            title: "Stock insuffisant",
            description: `Stock disponible: ${item.stock_disponible}`,
            variant: "destructive",
          });
          return item;
        }
        return { ...item, quantite: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // Supprimer un article du panier
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculer le total
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.prix * item.quantite), 0);
  };

  // Calculer le total avec réduction
  const getTotalAvecReduction = () => {
    return Math.max(0, getTotal() - reductionMontant);
  };

  // Finaliser la vente
  const finaliserVente = async () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de finaliser",
        variant: "destructive",
      });
      return;
    }

    const total = getTotalAvecReduction();
    const tva = total * 0.2;
    const totalHt = total - tva;

    const venteData = {
      client_nom: selectedClient && selectedClient !== "anonymous" ? clients.find(c => c.id === selectedClient)?.nom || "Client anonyme" : "Client anonyme",
      client_email: selectedClient && selectedClient !== "anonymous" ? clients.find(c => c.id === selectedClient)?.email || "" : "",
      client_id: selectedClient && selectedClient !== "anonymous" ? selectedClient : null,
      sous_total: getTotal(),
      tva: tva,
      remise: reductionMontant,
      total_ht: totalHt,
      total_ttc: total,
      mode_paiement: paymentMethod,
      type_vente: saleType,
      statut: "payee" as const,
      notes: `Vente POS vendeur - ${cart.length} article(s)`
    };

    const articles: Omit<VenteArticle, 'id' | 'vente_id'>[] = cart.map(item => {
      const prixUnitaireHt = item.prix / 1.2; // Calculer HT depuis TTC
      const totalItemHt = prixUnitaireHt * item.quantite;
      const totalItemTtc = item.prix * item.quantite;
      
      return {
        produit_id: safeProductId(item.id),
        produit_type: item.type,
        nom_produit: item.nom,
        code_barre: item.codeBarre,
        prix_unitaire_ht: prixUnitaireHt,
        prix_unitaire_ttc: item.prix,
        quantite: item.quantite,
        total_ht: totalItemHt,
        total_ttc: totalItemTtc
      };
    });

    const paiements: PaiementDetaille[] = [{
      mode_paiement: paymentMethod as 'especes' | 'carte' | 'virement' | 'cheque',
      montant: total,
      numero_cheque: paymentMethod === 'cheque' ? chequeNumber : undefined,
      date_echeance: paymentMethod === 'cheque' ? chequeEcheance : undefined,
      compte_bancaire_id: paymentMethod === 'virement' ? selectedAccount : undefined
    }];

    try {
      const venteId = await createVente(venteData, articles, paiements);
      
      if (venteId) {
        setVenteFinalise({ ...venteData, id: venteId, articles, numero_vente: `V-${Date.now()}` });
        setShowTicket(true);
        setCart([]);
        setReductionMontant(0);
        setSelectedClient("anonymous");
        setPaymentMethod("especes");
        setChequeNumber("");
        setChequeEcheance("");
        setSelectedAccount("");
        setCurrentView('categories');
        
        toast({
          title: "Vente finalisée",
          description: `Vente ${venteId} créée avec succès`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser la vente",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center tech-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-purple mx-auto mb-4"></div>
          <p className="text-white text-xl">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tech-gradient p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 gaming-gradient rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Point de Vente</h1>
              <p className="text-gray-400">Interface vendeur simplifiée</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-gaming-green text-white text-lg px-4 py-2">
              Total: {getTotalAvecReduction().toFixed(2)}€
            </Badge>
            <Badge className="bg-gaming-purple text-white px-3 py-2">
              {cart.length} article(s)
            </Badge>
          </div>
        </div>

        {/* Navigation entre vues */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={currentView === 'categories' ? 'default' : 'outline'}
            className={`flex-1 h-16 text-lg ${currentView === 'categories' ? 'bg-gaming-purple' : ''}`}
            onClick={() => setCurrentView('categories')}
          >
            <Grid3X3 className="w-6 h-6 mr-2" />
            Catégories
          </Button>
          <Button
            variant={currentView === 'products' ? 'default' : 'outline'}
            className={`flex-1 h-16 text-lg ${currentView === 'products' ? 'bg-gaming-purple' : ''}`}
            onClick={() => setCurrentView('products')}
            disabled={!selectedProductType}
          >
            <Package className="w-6 h-6 mr-2" />
            Produits
          </Button>
          <Button
            variant={currentView === 'cart' ? 'default' : 'outline'}
            className={`flex-1 h-16 text-lg ${currentView === 'cart' ? 'bg-gaming-purple' : ''}`}
            onClick={() => setCurrentView('cart')}
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            Panier ({cart.length})
          </Button>
        </div>

        {/* Scanner de code-barres */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Scanner ou saisir un code-barres..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && barcodeInput.trim()) {
                      addToCartByBarcode(barcodeInput.trim());
                      setBarcodeInput("");
                    }
                  }}
                  className="h-14 text-lg bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Button
                onClick={() => {
                  if (barcodeInput.trim()) {
                    addToCartByBarcode(barcodeInput.trim());
                    setBarcodeInput("");
                  }
                }}
                className="h-14 px-6 bg-gaming-cyan hover:bg-gaming-cyan/80"
              >
                <Scan className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Zone principale */}
          <div className="xl:col-span-2">
            {/* Vue Catégories */}
            {currentView === 'categories' && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {productTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className="bg-gray-800 border-gray-700 hover:border-gaming-purple cursor-pointer transition-all duration-300 transform hover:scale-105"
                      onClick={() => {
                        setSelectedProductType(type.value as ProductType);
                        setCurrentView('products');
                      }}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 ${type.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">{type.label}</h3>
                        <p className="text-gray-400 text-sm">
                          {getAllProducts().length > 0 ? `${getAllProducts().length} produits` : 'Aucun produit'}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Vue Produits */}
            {currentView === 'products' && selectedProductType && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentView('categories')}
                      className="border-gray-600"
                    >
                      ← Retour
                    </Button>
                    <h2 className="text-xl text-white font-bold">
                      {productTypes.find(t => t.value === selectedProductType)?.label}
                    </h2>
                  </div>
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="bg-gray-800 border-gray-700 hover:border-gaming-purple cursor-pointer transition-all duration-300"
                      onClick={() => addProductToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-medium text-sm line-clamp-2">{product.nom}</h3>
                          <Badge className="bg-gaming-green text-xs">
                            Stock: {product.stock}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">{product.marque}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-gaming-cyan font-bold text-lg">
                            {product.prix.toFixed(2)}€
                          </span>
                          <Button size="sm" className="bg-gaming-purple hover:bg-gaming-purple/80">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Vue Panier */}
            {currentView === 'cart' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Panier ({cart.length} articles)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Votre panier est vide</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{item.nom}</h4>
                            <p className="text-gray-400 text-sm">{item.prix.toFixed(2)}€ x {item.quantite}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-white font-bold w-8 text-center">{item.quantite}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-white font-bold">
                            {(item.prix * item.quantite).toFixed(2)}€
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel de droite - Résumé et paiement */}
          <div className="space-y-6">
            {/* Résumé de la commande */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Résumé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Sous-total:</span>
                    <span>{getTotal().toFixed(2)}€</span>
                  </div>
                  
                  {reductionMontant > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Réduction:</span>
                      <span>-{reductionMontant.toFixed(2)}€</span>
                    </div>
                  )}
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>{getTotalAvecReduction().toFixed(2)}€</span>
                  </div>
                </div>

                {/* Réduction */}
                <div>
                  <Label className="text-gray-300">Réduction (€)</Label>
                  <Input
                    type="number"
                    value={reductionMontant}
                    onChange={(e) => setReductionMontant(Number(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Client</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">Client anonyme</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom} - {client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Paiement */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Mode de paiement</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="especes">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          Espèces
                        </div>
                      </SelectItem>
                      <SelectItem value="carte">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Carte bancaire
                        </div>
                      </SelectItem>
                      <SelectItem value="cheque">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4" />
                          Chèque
                        </div>
                      </SelectItem>
                      <SelectItem value="virement">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Virement
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Champs supplémentaires selon le mode de paiement */}
                {paymentMethod === 'cheque' && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-gray-300">Numéro de chèque</Label>
                      <Input
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="123456"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Date d'échéance</Label>
                      <Input
                        type="date"
                        value={chequeEcheance}
                        onChange={(e) => setChequeEcheance(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'virement' && (
                  <div>
                    <Label className="text-gray-300">Compte bancaire</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Sélectionner un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.nom_compte} - {account.numero_compte}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={finaliserVente}
                    disabled={cart.length === 0 || loadingVente}
                    className="w-full h-14 text-lg bg-gaming-green hover:bg-gaming-green/80"
                  >
                    {loadingVente ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Check className="w-6 h-6 mr-2" />
                    )}
                    Finaliser la vente
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setCart([]);
                      setReductionMontant(0);
                      setSelectedClient("anonymous");
                      setCurrentView('categories');
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider le panier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de ticket */}
        <Dialog open={showTicket} onOpenChange={setShowTicket}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Vente finalisée
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                La vente a été enregistrée avec succès
              </DialogDescription>
            </DialogHeader>
            
            {venteFinalise && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gaming-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Vente {venteFinalise.numero_vente}</h3>
                  <p className="text-gray-400">Total: {venteFinalise.total_ttc.toFixed(2)}€</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Client:</span>
                    <span className="text-white">{venteFinalise.client_nom}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Paiement:</span>
                    <span className="text-white capitalize">{venteFinalise.mode_paiement}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Articles:</span>
                    <span className="text-white">{venteFinalise.articles.length}</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button
                onClick={() => setShowTicket(false)}
                className="bg-gaming-purple hover:bg-gaming-purple/80"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer ticket
              </Button>
              <Button
                onClick={() => setShowTicket(false)}
                variant="outline"
                className="border-gray-600"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 