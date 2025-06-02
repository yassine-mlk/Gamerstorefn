import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, Eye, AlertTriangle, Barcode, Monitor, Gamepad2, Cpu, HardDrive, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MyProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Données simulées des produits avec détails techniques complets
  const assignedProducts = [
    {
      id: "P001",
      name: "Chaise Gaming RGB Pro",
      category: "Mobilier",
      type: "Chaise Gaming",
      brand: "GameMax",
      codeBarre: "CG001234567890",
      stock: 15,
      minStock: 10,
      sellPrice: 2500,
      status: "En stock",
      lastUpdate: "2024-01-15",
      assignedDate: "2024-01-01",
      description: "Chaise gaming ergonomique avec éclairage RGB, support lombaire et accoudoirs réglables",
      technicalDetails: {
        "Matériau": "Cuir PU + Mousse haute densité",
        "Dimensions": "68 x 68 x 125-135 cm",
        "Poids max": "120 kg",
        "Éclairage": "RGB 16 millions de couleurs",
        "Accoudoirs": "4D réglables"
      },
      etat: "Neuf",
      garantie: "9 mois",
      image: "/images/chaise-gaming.jpg"
    },
    {
      id: "P002",
      name: "Clavier Mécanique RGB",
      category: "Périphériques",
      type: "Clavier",
      brand: "TechPro",
      codeBarre: "KB002345678901",
      stock: 3,
      minStock: 5,
      sellPrice: 850,
      status: "Stock faible",
      lastUpdate: "2024-01-14",
      assignedDate: "2024-01-01",
      description: "Clavier mécanique gaming avec switches Cherry MX, rétroéclairage RGB et touches programmables",
      technicalDetails: {
        "Type de switches": "Cherry MX Red",
        "Rétroéclairage": "RGB per-key",
        "Connexion": "USB-C détachable",
        "Touches": "104 touches AZERTY",
        "Polling rate": "1000 Hz",
        "Durée de vie": "50 millions de frappes"
      },
      etat: "Neuf",
      garantie: "6 mois",
      image: "/images/clavier-mecanique.jpg"
    },
    {
      id: "P003",
      name: "Écran 4K 27 pouces",
      category: "Moniteurs",
      type: "Moniteur Gaming",
      brand: "ViewMax",
      codeBarre: "MON003456789012",
      stock: 8,
      minStock: 3,
      sellPrice: 3200,
      status: "En stock",
      lastUpdate: "2024-01-13",
      assignedDate: "2024-01-05",
      description: "Moniteur gaming 4K UHD avec taux de rafraîchissement 144Hz, HDR400 et technologies FreeSync/G-Sync",
      technicalDetails: {
        "Taille": "27 pouces",
        "Résolution": "3840 x 2160 (4K UHD)",
        "Taux de rafraîchissement": "144 Hz",
        "Temps de réponse": "1 ms",
        "Type de dalle": "IPS",
        "HDR": "HDR400",
        "Connectivité": "HDMI 2.1, DisplayPort 1.4, USB-C"
      },
      etat: "Neuf",
      garantie: "9 mois",
      image: "/images/moniteur-4k.jpg"
    },
    {
      id: "P004",
      name: "Souris Gaming Pro",
      category: "Périphériques",
      type: "Souris",
      brand: "GameTech",
      codeBarre: "MOUSE004567890123",
      stock: 0,
      minStock: 8,
      sellPrice: 450,
      status: "Rupture",
      lastUpdate: "2024-01-12",
      assignedDate: "2024-01-01",
      description: "Souris gaming haute précision avec capteur optique 25000 DPI, éclairage RGB et 8 boutons programmables",
      technicalDetails: {
        "Capteur": "Optique 25000 DPI",
        "Nombre de boutons": "8 boutons programmables",
        "Éclairage": "RGB Chroma",
        "Connexion": "USB filaire",
        "Polling rate": "1000 Hz",
        "Poids": "85g (ajustable)"
      },
      etat: "Neuf",
      garantie: "3 mois",
      image: "/images/souris-gaming.jpg"
    },
    {
      id: "P005",
      name: "Casque Gaming 7.1",
      category: "Périphériques",
      type: "Casque Audio",
      brand: "SoundMax",
      codeBarre: "HDST005678901234",
      stock: 12,
      minStock: 6,
      sellPrice: 680,
      status: "En stock",
      lastUpdate: "2024-01-15",
      assignedDate: "2024-01-08",
      description: "Casque gaming surround 7.1 avec microphone antibruit, éclairage RGB et coussinets en mousse à mémoire",
      technicalDetails: {
        "Audio": "Surround 7.1 virtuel",
        "Drivers": "50mm néodyme",
        "Microphone": "Omnidirectionnel avec suppression de bruit",
        "Connectivité": "USB + Jack 3.5mm",
        "Éclairage": "RGB synchronisable",
        "Confort": "Coussinets mousse à mémoire"
      },
      etat: "Neuf",
      garantie: "6 mois",
      image: "/images/casque-gaming.jpg"
    },
    {
      id: "P006",
      name: "PC Portable Gaming RTX 4070",
      category: "PC Portable",
      type: "Ordinateur Portable",
      brand: "ASUS",
      codeBarre: "LAPTOP006789012345",
      stock: 5,
      minStock: 2,
      sellPrice: 15999,
      status: "En stock",
      lastUpdate: "2024-01-16",
      assignedDate: "2024-01-10",
      description: "PC portable gaming haute performance avec processeur Intel i7, carte graphique RTX 4070 et écran 144Hz",
      technicalDetails: {
        "Processeur": "Intel Core i7-13700H",
        "Carte graphique": "NVIDIA RTX 4070 8GB",
        "Mémoire": "32GB DDR5",
        "Stockage": "1TB SSD NVMe",
        "Écran": "15.6'' QHD 144Hz",
        "Système": "Windows 11 Pro"
      },
      etat: "Neuf",
      garantie: "9 mois",
      image: "/images/pc-portable-gaming.jpg"
    }
  ];

  const filteredProducts = assignedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codeBarre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En stock": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "Stock faible": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "Rupture": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Moniteurs": return Monitor;
      case "Périphériques": return Gamepad2;
      case "PC Portable": return Cpu;
      case "Mobilier": return Package;
      default: return Package;
    }
  };

  const totalProducts = assignedProducts.length;
  const lowStockProducts = assignedProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockProducts = assignedProducts.filter(p => p.stock === 0).length;

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Produits</h2>
          <p className="text-gray-400 mt-1">Consultez les informations des produits assignés - Informations techniques et disponibilité</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-gaming-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProducts}</div>
            <p className="text-xs text-gray-400">Assignés à vous</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Stock Faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{lowStockProducts}</div>
            <p className="text-xs text-gray-400">Nécessitent attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">En Rupture</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{outOfStockProducts}</div>
            <p className="text-xs text-gray-400">Action urgente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recherche de Produits</CardTitle>
          <CardDescription className="text-gray-400">
            Recherchez par nom, code-barres, type de produit ou marque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, code-barres, type ou marque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="Mobilier">Mobilier</SelectItem>
                <SelectItem value="Périphériques">Périphériques</SelectItem>
                <SelectItem value="Moniteurs">Moniteurs</SelectItem>
                <SelectItem value="PC Portable">PC Portable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="En stock">En stock</SelectItem>
                <SelectItem value="Stock faible">Stock faible</SelectItem>
                <SelectItem value="Rupture">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informations Produits</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredProducts.length} produit(s) trouvé(s) - Consultation uniquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Produit</TableHead>
                <TableHead className="text-gray-300">Code-barres</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Stock</TableHead>
                <TableHead className="text-gray-300">Prix de vente</TableHead>
                <TableHead className="text-gray-300">État</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const IconComponent = getCategoryIcon(product.category);
                return (
                  <TableRow key={product.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gaming-cyan" />
                        <div>
                          <div className="text-white font-medium">{product.name}</div>
                          <div className="text-gray-400 text-sm">{product.brand}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <span className="text-white font-mono text-sm">{product.codeBarre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gaming-purple text-gaming-purple">
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-white">
                        {product.stock} unités
                        {product.stock <= product.minStock && product.stock > 0 && (
                          <AlertTriangle className="inline h-4 w-4 ml-1 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gaming-green font-semibold">{product.sellPrice} MAD</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        {product.etat}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gaming-cyan hover:text-white"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl text-white">
                              {selectedProduct?.name}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Informations techniques et détails du produit
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedProduct && (
                            <div className="grid gap-6 py-4">
                              {/* Informations générales */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Informations générales</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Nom:</span>
                                        <span className="text-white font-medium">{selectedProduct.name}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Marque:</span>
                                        <span className="text-white">{selectedProduct.brand}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Code-barres:</span>
                                        <span className="text-white font-mono text-sm">{selectedProduct.codeBarre}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Type:</span>
                                        <span className="text-white">{selectedProduct.type}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">État:</span>
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                          {selectedProduct.etat}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Garantie:</span>
                                        <span className="text-white">{selectedProduct.garantie}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Disponibilité</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Stock actuel:</span>
                                        <span className="text-white font-semibold">{selectedProduct.stock} unités</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Statut:</span>
                                        <Badge className={getStatusColor(selectedProduct.status)}>
                                          {selectedProduct.status}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Prix de vente:</span>
                                        <span className="text-gaming-green font-semibold">{selectedProduct.sellPrice} MAD</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Dernière MAJ:</span>
                                        <span className="text-white">{selectedProduct.lastUpdate}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Description */}
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                                <p className="text-gray-300 leading-relaxed">{selectedProduct.description}</p>
                              </div>
                              
                              {/* Spécifications techniques */}
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Spécifications techniques</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800/50 p-4 rounded-lg">
                                  {Object.entries(selectedProduct.technicalDetails).map(([key, value]) => (
                                    <div key={key} className="flex justify-between border-b border-gray-700 pb-2">
                                      <span className="text-gray-400">{key}:</span>
                                      <span className="text-white font-medium">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Image placeholder */}
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Image du produit</h3>
                                <div className="bg-gray-800/50 p-8 rounded-lg text-center">
                                  <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                  <p className="text-gray-400">Image non disponible</p>
                                  <p className="text-xs text-gray-500 mt-1">{selectedProduct.image}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Aucun produit trouvé</p>
              <p className="text-gray-500 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProducts;
