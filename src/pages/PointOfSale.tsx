import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  Mouse
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePcPortables } from "@/hooks/usePcPortables";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { usePeripheriques } from "@/hooks/usePeripheriques";

interface CartItem {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  codeBarre: string;
  categorie: string;
  type: 'pc_portable' | 'moniteur' | 'peripherique';
  stock_disponible: number;
}

type ProductType = 'pc_portable' | 'moniteur' | 'peripherique' | '';

const productTypes = [
  { value: 'pc_portable', label: 'PC Portable', icon: Laptop },
  { value: 'moniteur', label: 'Moniteur', icon: Monitor },
  { value: 'peripherique', label: 'Périphérique', icon: Mouse }
];

const mockClients = [
  { id: 1, nom: "Martin Jean", email: "jean.martin@email.com" },
  { id: 2, nom: "Dubois Marie", email: "marie.dubois@email.com" },
  { id: 3, nom: "Leroy Pierre", email: "pierre.leroy@email.com" },
];

export default function PointOfSale() {
  // Hooks de données
  const { pcPortables, loading: loadingPC } = usePcPortables();
  const { moniteurs, loading: loadingMoniteurs } = useMoniteurs();
  const { peripheriques, loading: loadingPeripheriques } = usePeripheriques();

  // États
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<ProductType>("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("especes");
  const [saleType, setSaleType] = useState("magasin");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const { toast } = useToast();

  // Vérifier si les données sont en cours de chargement
  const isLoading = loadingPC || loadingMoniteurs || loadingPeripheriques;

  // Mise à jour des filtres quand le type de produit change
  useEffect(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setShowProductSearch(false);
  }, [selectedProductType]);

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
    }
    
    return products;
  };

  // Filtrer les produits selon la recherche et la catégorie
  const filteredProducts = getAllProducts().filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.codeBarre.includes(searchQuery);
    const matchesCategory = selectedCategory === "" || selectedCategory === "all" || product.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les catégories disponibles selon le type de produit
  const getAvailableCategories = () => {
    if (selectedProductType === 'pc_portable') {
      return ['PC Portable'];
    } else if (selectedProductType === 'moniteur') {
      return ['Moniteur'];
    } else if (selectedProductType === 'peripherique') {
      const categories = [...new Set(peripheriques.map(p => p.categorie))];
      return categories;
    }
    return [];
  };

  const addToCartByBarcode = (barcode: string) => {
    if (!selectedProductType) {
      toast({
        title: "Type de produit requis",
        description: "Veuillez d'abord sélectionner un type de produit",
        variant: "destructive",
      });
      return;
    }

    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.codeBarre === barcode);
    
    if (!product) {
      toast({
        title: "Produit non trouvé",
        description: "Aucun produit trouvé avec ce code-barres",
        variant: "destructive",
      });
      return;
    }

    addProductToCart(product);
    setBarcodeInput("");
  };

  const addProductToCart = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "Stock insuffisant",
        description: "Ce produit n'est plus en stock",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantite >= product.stock) {
        toast({
          title: "Stock insuffisant",
          description: "Quantité maximum atteinte pour ce produit",
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
      setCart([...cart, {
        id: product.id,
        nom: product.nom,
        prix: product.prix,
        quantite: 1,
        codeBarre: product.codeBarre,
        categorie: product.categorie,
        type: product.type,
        stock_disponible: product.stock
      }]);
    }

    toast({
      title: "Produit ajouté",
      description: `${product.nom} ajouté au panier`,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantite + change;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > product.stock) {
          toast({
            title: "Stock insuffisant",
            description: "Quantité maximum atteinte",
            variant: "destructive",
          });
          return item;
        }
        return { ...item, quantite: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.prix * item.quantite), 0);
  };

  const handleSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de finaliser la vente",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClient) {
      toast({
        title: "Client requis",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    const clientName = mockClients.find(c => c.id.toString() === selectedClient)?.nom || "Client anonyme";
    
    setCart([]);
    setSelectedClient("");
    setPaymentMethod("especes");
    setSaleType("magasin");
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedProductType("");
    setShowProductSearch(false);

    toast({
      title: "Vente enregistrée",
      description: `Vente de ${getTotal()} MAD enregistrée avec succès`,
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Point de vente</h1>
            <p className="text-gray-400 text-sm lg:text-base">Scanner les produits et finaliser la vente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Scanner et panier */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Caisse
              {selectedProductType && (
                <Badge variant="outline" className="border-gaming-cyan text-gaming-cyan ml-2">
                  {productTypes.find(t => t.value === selectedProductType)?.label}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {selectedProductType 
                ? `Scanner les produits ${productTypes.find(t => t.value === selectedProductType)?.label.toLowerCase()} et gérer le panier`
                : "Sélectionnez le type de produit pour commencer"
              }
            </CardDescription>
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
              <Label className="text-gray-300">Type de produit *</Label>
              <Select value={selectedProductType} onValueChange={(value: ProductType) => {
                setSelectedProductType(value);
                setSearchQuery("");
                setSelectedCategory("all");
                setBarcodeInput("");
              }} disabled={isLoading}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Sélectionnez d'abord le type de produit" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {productTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Scanner de code-barres - affiché seulement si un type est sélectionné */}
            {selectedProductType && (
              <div className="space-y-2">
                <Label className="text-gray-300">Code-barres produit</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Scan className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Scanner ou saisir le code-barres"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToCartByBarcode(barcodeInput);
                        }
                      }}
                      className="pl-10 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={() => addToCartByBarcode(barcodeInput)}
                    className="gaming-gradient"
                    disabled={!barcodeInput.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Séparateur avec option de recherche - affiché seulement si un type est sélectionné */}
            {selectedProductType && (
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-gray-600"></div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-black"
                >
                  {showProductSearch ? <Scan className="w-4 h-4 mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  {showProductSearch ? "Scanner" : "Rechercher"}
                </Button>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>
            )}

            {/* Recherche de produits - affiché seulement si un type est sélectionné et la recherche activée */}
            {selectedProductType && showProductSearch && (
              <div className="space-y-4 bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Recherche par nom */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Rechercher un produit</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Nom du produit ou marque..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-700 border-gray-500 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Filtre par catégorie */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Catégorie</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-gray-700 border-gray-500 text-sm">
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-500">
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {getAvailableCategories().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Résultats de recherche */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">
                      Produits trouvés ({filteredProducts.length})
                    </Label>
                    {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                        }}
                        className="text-gray-400 hover:text-white text-xs h-6"
                      >
                        Effacer filtres
                      </Button>
                    )}
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto bg-gray-700 rounded border border-gray-600">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-4">
                        <Grid3X3 className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                        <p className="text-gray-400 text-sm">
                          {(searchQuery || (selectedCategory && selectedCategory !== "all")) ? "Aucun produit trouvé" : "Utilisez la recherche pour trouver des produits"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between bg-gray-600 rounded p-2 hover:bg-gray-500 transition-colors cursor-pointer"
                            onClick={() => addProductToCart(product)}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">{product.nom}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs border-gaming-cyan text-gaming-cyan">
                                  {product.categorie}
                                </Badge>
                                <span className="text-green-400 text-xs font-medium">{product.prix} MAD</span>
                                <span className="text-gray-400 text-xs">Stock: {product.stock}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="gaming-gradient h-8 w-8 p-0 ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                addProductToCart(product);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Message d'aide si aucun type sélectionné */}
            {!selectedProductType && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-blue-300 font-medium mb-1">Sélectionnez un type de produit</p>
                <p className="text-blue-400 text-sm">Choisissez d'abord le type de produit pour commencer la vente</p>
              </div>
            )}

            {/* Panier */}
            <div className="space-y-2">
              <Label className="text-gray-300">Panier ({cart.length} articles)</Label>
              <div className="bg-gray-800 rounded-lg p-4 max-h-64 lg:max-h-80 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Panier vide</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-700 rounded p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{item.nom}</p>
                          <p className="text-gaming-cyan text-sm">{item.prix} MAD × {item.quantite}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white w-8 text-center text-sm">{item.quantite}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:bg-red-400/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gaming-purple/20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total:</span>
                <span className="text-xl lg:text-2xl font-bold text-gaming-cyan">{getTotal().toFixed(2)} MAD</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de vente */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Finaliser la vente</CardTitle>
            <CardDescription className="text-gray-400">
              Informations client et paiement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection client */}
            <div className="space-y-2">
              <Label className="text-gray-300">Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-gray-700" />

            {/* Mode de paiement */}
            <div className="space-y-3">
              <Label className="text-gray-300">Mode de paiement</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="especes" id="especes" />
                  <Label htmlFor="especes" className="text-white flex items-center gap-2 cursor-pointer">
                    <Banknote className="w-4 h-4" />
                    Espèces
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="virement" id="virement" />
                  <Label htmlFor="virement" className="text-white flex items-center gap-2 cursor-pointer">
                    <Building className="w-4 h-4" />
                    Virement bancaire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cheque" id="cheque" />
                  <Label htmlFor="cheque" className="text-white flex items-center gap-2 cursor-pointer">
                    <FileCheck className="w-4 h-4" />
                    Chèque
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator className="bg-gray-700" />

            {/* Type de vente */}
            <div className="space-y-3">
              <Label className="text-gray-300">Type de vente</Label>
              <RadioGroup value={saleType} onValueChange={setSaleType} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="magasin" id="magasin" />
                  <Label htmlFor="magasin" className="text-white cursor-pointer">Magasin (sur place)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="commande" id="commande" />
                  <Label htmlFor="commande" className="text-white cursor-pointer">Commande en ligne (livraison)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Finaliser la vente */}
            <Button
              onClick={handleSale}
              className="w-full gaming-gradient hover:scale-105 transition-transform mt-6"
              disabled={cart.length === 0}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Finaliser la vente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
