import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, 
  Search, 
  Eye, 
  AlertTriangle, 
  Barcode, 
  Monitor, 
  Gamepad2, 
  Cpu, 
  HardDrive, 
  Printer,
  Laptop,
  Armchair,
  Mouse,
  Headphones,
  Keyboard,
  TrendingUp,
  DollarSign,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Hooks pour les données réelles
import { usePcPortables } from "@/hooks/usePcPortables";
import { useComposantsPC } from "@/hooks/useComposantsPC";
import { usePCGamer } from "@/hooks/usePCGamer";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { useChaisesGamingSupabase } from "@/hooks/useChaisesGamingSupabase";
import { usePeripheriques } from "@/hooks/usePeripheriques";

const MyProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("all");

  const { toast } = useToast();
  const navigate = useNavigate();

  // Hooks pour les données réelles
  const { pcPortables } = usePcPortables();
  const { composantsPC } = useComposantsPC();
  const { pcGamerConfigs } = usePCGamer();
  const { moniteurs } = useMoniteurs();
  const { chaisesGaming } = useChaisesGamingSupabase();
  const { peripheriques } = usePeripheriques();

  // Transformer les données en format uniforme
  const transformProduct = (product: any, type: string) => {
    const baseProduct = {
      id: product.id,
      name: product.nom || product.modele || product.nom_produit || "Nom non disponible",
      category: type,
      type: getProductTypeText(type),
      brand: product.marque || product.fabricant || "Marque non disponible",
      codeBarre: product.code_barre || product.reference || "N/A",
      stock: product.stock_actuel || product.stock_possible || 0,
      minStock: product.stock_minimum || 5,
      sellPrice: product.prix_vente || 0,
      buyPrice: product.prix_achat || 0,
      status: getStockStatus(product.stock_actuel || product.stock_possible || 0, product.stock_minimum || 5),
      lastUpdate: product.updated_at || product.created_at || new Date().toISOString(),
      description: product.description || product.caracteristiques || "Aucune description disponible",
      technicalDetails: getTechnicalDetails(product, type),
      etat: product.etat || "Neuf",
      garantie: product.garantie || "6 mois",
      image: product.image_url || "/images/placeholder.jpg",
      originalData: product
    };

    return baseProduct;
  };

  // Obtenir les détails techniques selon le type de produit
  const getTechnicalDetails = (product: any, type: string) => {
    switch (type) {
      case 'pc_portable':
        return {
          "Processeur": product.processeur || "N/A",
          "Carte graphique": product.carte_graphique || "N/A",
          "Mémoire RAM": product.ram || "N/A",
          "Stockage": product.stockage || "N/A",
          "Écran": product.taille_ecran || "N/A",
          "Système": product.systeme_exploitation || "N/A"
        };
      case 'pc_gamer':
        return {
          "Processeur": product.processeur || "N/A",
          "Carte graphique": product.carte_graphique || "N/A",
          "Mémoire RAM": product.ram || "N/A",
          "Stockage": product.stockage || "N/A",
          "Alimentation": product.alimentation || "N/A",
          "Boîtier": product.boitier || "N/A"
        };
      case 'moniteur':
        return {
          "Taille": product.taille || "N/A",
          "Résolution": product.resolution || "N/A",
          "Taux de rafraîchissement": product.taux_rafraichissement || "N/A",
          "Temps de réponse": product.temps_reponse || "N/A",
          "Type de dalle": product.type_dalle || "N/A",
          "Connectivité": product.connectivite || "N/A"
        };
      case 'chaise_gaming':
        return {
          "Matériau": product.materiau || "N/A",
          "Dimensions": product.dimensions || "N/A",
          "Poids max": product.poids_max || "N/A",
          "Éclairage": product.eclairage || "N/A",
          "Accoudoirs": product.accoudoirs || "N/A"
        };
      case 'peripherique':
        return {
          "Type": product.type_peripherique || "N/A",
          "Connectivité": product.connectivite || "N/A",
          "Compatibilité": product.compatibilite || "N/A",
          "Fonctionnalités": product.fonctionnalites || "N/A"
        };
      case 'composant_pc':
        return {
          "Type": product.type_composant || "N/A",
          "Compatibilité": product.compatibilite || "N/A",
          "Spécifications": product.specifications || "N/A"
        };
      default:
        return {
          "Type": type,
          "Référence": product.reference || "N/A"
        };
    }
  };

  // Obtenir le statut du stock
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return "Rupture";
    if (stock <= minStock) return "Stock faible";
    return "En stock";
  };

  // Obtenir le texte du type de produit
  const getProductTypeText = (type: string) => {
    switch (type) {
      case 'pc_portable': return 'PC Portable';
      case 'pc_gamer': return 'PC Gamer';
      case 'moniteur': return 'Moniteur';
      case 'chaise_gaming': return 'Chaise Gaming';
      case 'peripherique': return 'Périphérique';
      case 'composant_pc': return 'Composant PC';
      default: return type;
    }
  };

  // Combiner tous les produits
  const allProducts = [
    ...pcPortables.map(p => transformProduct(p, 'pc_portable')),
    ...composantsPC.map(p => transformProduct(p, 'composant_pc')),
    ...pcGamerConfigs.map(p => transformProduct(p, 'pc_gamer')),
    ...moniteurs.map(p => transformProduct(p, 'moniteur')),
    ...chaisesGaming.map(p => transformProduct(p, 'chaise_gaming')),
    ...peripheriques.map(p => transformProduct(p, 'peripherique'))
  ];

  // Filtrer et trier les produits
  const filteredAndSortedProducts = allProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.codeBarre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "stock":
          comparison = a.stock - b.stock;
          break;
        case "price":
          comparison = a.sellPrice - b.sellPrice;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Grouper les produits par catégorie
  const productsByCategory = {
    all: filteredAndSortedProducts,
    pc_portable: filteredAndSortedProducts.filter(p => p.category === 'pc_portable'),
    pc_gamer: filteredAndSortedProducts.filter(p => p.category === 'pc_gamer'),
    moniteur: filteredAndSortedProducts.filter(p => p.category === 'moniteur'),
    chaise_gaming: filteredAndSortedProducts.filter(p => p.category === 'chaise_gaming'),
    peripherique: filteredAndSortedProducts.filter(p => p.category === 'peripherique'),
    composant_pc: filteredAndSortedProducts.filter(p => p.category === 'composant_pc')
  };

  // Calculer les statistiques
  const stats = {
    total: allProducts.length,
    inStock: allProducts.filter(p => p.status === 'En stock').length,
    lowStock: allProducts.filter(p => p.status === 'Stock faible').length,
    outOfStock: allProducts.filter(p => p.status === 'Rupture').length
  };

  // Fonctions utilitaires
  const getStatusColor = (status: string) => {
    switch (status) {
      case "En stock": return "bg-green-100 text-green-800 border-green-200";
      case "Stock faible": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Rupture": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "moniteur": return Monitor;
      case "peripherique": return Mouse;
      case "pc_portable": return Laptop;
      case "pc_gamer": return Cpu;
      case "chaise_gaming": return Armchair;
      case "composant_pc": return HardDrive;
      default: return Package;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' MAD';
  };

  // Fonction pour voir les détails du produit
  const viewProductDetails = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // Fonction pour naviguer vers les détails du produit
  const navigateToProductDetails = (product: any) => {
    const routeMap: Record<string, string> = {
      'pc_portable': `/pc-portable/${product.id}`,
      'pc_gamer': `/pc-gamer/${product.id}`,
      'moniteur': `/moniteur/${product.id}`,
      'chaise_gaming': `/chaise-gaming/${product.id}`,
      'peripherique': `/peripherique/${product.id}`,
      'composant_pc': `/composant-pc/${product.id}`,
    };

    const route = routeMap[product.category];
    if (route) {
      navigate(route);
    } else {
      toast({
        title: "Erreur",
        description: "Type de produit non reconnu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
            <p className="text-gray-600">Consultez les informations des produits pour renseigner les clients</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-cyan/20 rounded-lg">
                <Package className="w-6 h-6 text-gaming-cyan" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Faible</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="bg-card border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, marque, code-barres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="pc_portable">PC Portables</SelectItem>
                <SelectItem value="pc_gamer">PC Gamer</SelectItem>
                <SelectItem value="moniteur">Moniteurs</SelectItem>
                <SelectItem value="chaise_gaming">Chaises Gaming</SelectItem>
                <SelectItem value="peripherique">Périphériques</SelectItem>
                <SelectItem value="composant_pc">Composants PC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="En stock">En stock</SelectItem>
                <SelectItem value="Stock faible">Stock faible</SelectItem>
                <SelectItem value="Rupture">Rupture</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="price">Prix</SelectItem>
                  <SelectItem value="category">Catégorie</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets des produits */}
      <Card className="bg-card border-gray-200">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-6 bg-gray-100">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Tous</span>
                <Badge variant="outline" className="ml-1">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pc_portable" className="flex items-center gap-2">
                <Laptop className="w-4 h-4" />
                <span>PC Portables</span>
                <Badge variant="outline" className="ml-1">{productsByCategory.pc_portable.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pc_gamer" className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>PC Gamer</span>
                <Badge variant="outline" className="ml-1">{productsByCategory.pc_gamer.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="moniteur" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span>Moniteurs</span>
                <Badge variant="outline" className="ml-1">{productsByCategory.moniteur.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="chaise_gaming" className="flex items-center gap-2">
                <Armchair className="w-4 h-4" />
                <span>Chaises</span>
                <Badge variant="outline" className="ml-1">{productsByCategory.chaise_gaming.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="peripherique" className="flex items-center gap-2">
                <Mouse className="w-4 h-4" />
                <span>Périphériques</span>
                <Badge variant="outline" className="ml-1">{productsByCategory.peripherique.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="composant_pc" className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span>Composants</span>
                <Badge variant="outline" className="ml-1">{productsByCategory.composant_pc.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {Object.entries(productsByCategory).map(([category, products]) => (
              <TabsContent key={category} value={category} className="mt-0">
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
                    <p className="text-gray-600">Aucun produit trouvé dans cette catégorie.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {products.map((product) => {
                      const IconComponent = getCategoryIcon(product.category);
                      return (
                        <Card key={product.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-5 h-5 text-gaming-cyan" />
                                    <Badge variant="outline" className="text-xs">
                                      {product.type}
                                    </Badge>
                                  </div>
                                  <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                                    {product.status}
                                  </Badge>
                                  {product.stock === 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      Rupture
                                    </Badge>
                                  )}
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-3">{product.brand}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Code-barres:</span>
                                    <p className="font-mono text-gray-900">{product.codeBarre}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Stock:</span>
                                    <p className="font-semibold text-gray-900">
                                      {product.stock} unités
                                      {product.stock <= product.minStock && product.stock > 0 && (
                                        <AlertTriangle className="inline w-4 h-4 ml-1 text-yellow-500" />
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Prix de vente:</span>
                                    <p className="font-semibold text-green-600">{formatPrice(product.sellPrice)}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">État:</span>
                                    <Badge variant="outline" className="text-xs">
                                      {product.etat}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {product.description && (
                                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{product.description}</p>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewProductDetails(product)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Détails
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigateToProductDetails(product)}
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Voir
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de détails de produit */}
      <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900">
              {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Informations complètes pour renseigner les clients
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Informations générales
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium text-gray-900">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marque:</span>
                      <span className="text-gray-900">{selectedProduct.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code-barres:</span>
                      <span className="font-mono text-sm text-gray-900">{selectedProduct.codeBarre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{selectedProduct.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">État:</span>
                      <Badge variant="outline">{selectedProduct.etat}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Garantie:</span>
                      <span className="text-gray-900">{selectedProduct.garantie}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Disponibilité et prix
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock actuel:</span>
                      <span className="font-semibold text-gray-900">{selectedProduct.stock} unités</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <Badge className={getStatusColor(selectedProduct.status)}>
                        {selectedProduct.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix de vente:</span>
                      <span className="font-semibold text-green-600">{formatPrice(selectedProduct.sellPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dernière MAJ:</span>
                      <span className="text-gray-900">{formatDate(selectedProduct.lastUpdate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock minimum:</span>
                      <span className="text-gray-900">{selectedProduct.minStock} unités</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
              
              {/* Spécifications techniques */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Spécifications techniques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  {Object.entries(selectedProduct.technicalDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">{key}:</span>
                      <span className="text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => navigateToProductDetails(selectedProduct)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir la page complète
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowProductDetails(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyProducts;
