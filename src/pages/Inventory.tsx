
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Monitor,
  Laptop,
  Gamepad2,
  Mouse,
  Briefcase,
  Cpu,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  prix: number;
  stock: number;
  stockMin: number;
  codeBarre: string;
  fournisseur: string;
  statut: 'En stock' | 'Stock faible' | 'Rupture';
}

const mockProducts: Product[] = [
  {
    id: 1,
    nom: "RTX 4090 Gaming X",
    description: "Carte graphique haut de gamme pour gaming",
    categorie: "composantpc",
    prix: 1899,
    stock: 12,
    stockMin: 5,
    codeBarre: "3664551234567",
    fournisseur: "TechDistrib Pro",
    statut: "En stock"
  },
  {
    id: 2,
    nom: "Gaming Chair Pro RGB",
    description: "Chaise gaming ergonomique avec éclairage RGB",
    categorie: "chaisegamer",
    prix: 299,
    stock: 3,
    stockMin: 8,
    codeBarre: "3664551234568",
    fournisseur: "Gaming Hardware Wholesale",
    statut: "Stock faible"
  },
  {
    id: 3,
    nom: "ASUS ROG Laptop 17\"",
    description: "PC portable gaming 17 pouces RTX 4070",
    categorie: "pcportable",
    prix: 2299,
    stock: 8,
    stockMin: 3,
    codeBarre: "3664551234569",
    fournisseur: "TechDistrib Pro",
    statut: "En stock"
  },
  {
    id: 4,
    nom: "Monitor Gaming 27\" 144Hz",
    description: "Écran gaming 27 pouces 1440p 144Hz",
    categorie: "moniteur",
    prix: 349,
    stock: 15,
    stockMin: 5,
    codeBarre: "3664551234570",
    fournisseur: "Monitor Solutions Europe",
    statut: "En stock"
  },
  {
    id: 5,
    nom: "Logitech G Pro X Superlight",
    description: "Souris gaming sans fil ultra-légère",
    categorie: "peripherique",
    prix: 149,
    stock: 0,
    stockMin: 10,
    codeBarre: "3664551234571",
    fournisseur: "Gaming Hardware Wholesale",
    statut: "Rupture"
  },
  {
    id: 6,
    nom: "Bureau Gaming LED",
    description: "Bureau gaming avec éclairage LED intégré",
    categorie: "bureaugamer",
    prix: 199,
    stock: 6,
    stockMin: 4,
    codeBarre: "3664551234572",
    fournisseur: "Gaming Hardware Wholesale",
    statut: "En stock"
  }
];

const categories = [
  { id: "pcgamer", nom: "PC Gamer", icon: Gamepad2 },
  { id: "pcportable", nom: "PC Portable", icon: Laptop },
  { id: "moniteur", nom: "Moniteur", icon: Monitor },
  { id: "chaisegamer", nom: "Chaise Gamer", icon: Gamepad2 },
  { id: "peripherique", nom: "Périphérique", icon: Mouse },
  { id: "bureaugamer", nom: "Bureau Gamer", icon: Briefcase },
  { id: "composantpc", nom: "Composant PC", icon: Cpu }
];

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("tous");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nom: "",
    description: "",
    categorie: "",
    prix: "",
    stock: "",
    stockMin: "",
    codeBarre: "",
    fournisseur: ""
  });
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codeBarre.includes(searchTerm);
    const matchesCategory = activeCategory === "tous" || product.categorie === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!newProduct.nom || !newProduct.categorie || !newProduct.prix || !newProduct.stock) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const stock = parseInt(newProduct.stock);
    const stockMin = parseInt(newProduct.stockMin) || 5;
    
    const product: Product = {
      id: Date.now(),
      nom: newProduct.nom,
      description: newProduct.description,
      categorie: newProduct.categorie,
      prix: parseFloat(newProduct.prix),
      stock: stock,
      stockMin: stockMin,
      codeBarre: newProduct.codeBarre || `${Date.now()}`,
      fournisseur: newProduct.fournisseur || "Non défini",
      statut: stock === 0 ? "Rupture" : stock <= stockMin ? "Stock faible" : "En stock"
    };

    setProducts([...products, product]);
    setNewProduct({
      nom: "",
      description: "",
      categorie: "",
      prix: "",
      stock: "",
      stockMin: "",
      codeBarre: "",
      fournisseur: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Produit ajouté",
      description: `${product.nom} a été ajouté au stock`,
    });
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
    toast({
      title: "Produit supprimé",
      description: "Le produit a été supprimé du stock",
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'En stock': return 'bg-gaming-green';
      case 'Stock faible': return 'bg-yellow-600';
      case 'Rupture': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'En stock': return <CheckCircle className="w-4 h-4" />;
      case 'Stock faible': return <AlertTriangle className="w-4 h-4" />;
      case 'Rupture': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryProducts = (categoryId: string) => {
    return products.filter(product => product.categorie === categoryId);
  };

  const getStockStats = () => {
    return {
      total: products.length,
      enStock: products.filter(p => p.statut === 'En stock').length,
      stockFaible: products.filter(p => p.statut === 'Stock faible').length,
      rupture: products.filter(p => p.statut === 'Rupture').length
    };
  };

  const stats = getStockStats();

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion du stock</h1>
            <p className="text-gray-400">Gérez votre inventaire par catégorie de produits</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>
              <DialogDescription className="text-gray-400">
                Remplissez les informations du nouveau produit
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom du produit *</Label>
                  <Input
                    id="nom"
                    value={newProduct.nom}
                    onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select value={newProduct.categorie} onValueChange={(value) => setNewProduct({ ...newProduct, categorie: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prix">Prix (€) *</Label>
                  <Input
                    id="prix"
                    type="number"
                    value={newProduct.prix}
                    onChange={(e) => setNewProduct({ ...newProduct, prix: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="stockMin">Stock minimum</Label>
                  <Input
                    id="stockMin"
                    type="number"
                    value={newProduct.stockMin}
                    onChange={(e) => setNewProduct({ ...newProduct, stockMin: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codeBarre">Code-barres</Label>
                  <Input
                    id="codeBarre"
                    value={newProduct.codeBarre}
                    onChange={(e) => setNewProduct({ ...newProduct, codeBarre: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Généré automatiquement"
                  />
                </div>
                <div>
                  <Label htmlFor="fournisseur">Fournisseur</Label>
                  <Input
                    id="fournisseur"
                    value={newProduct.fournisseur}
                    onChange={(e) => setNewProduct({ ...newProduct, fournisseur: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button onClick={handleAddProduct} className="gaming-gradient">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gaming-purple/20 border-gaming-purple/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-gaming-purple" />
              <div>
                <p className="text-sm text-gray-400">Total produits</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gaming-green/20 border-gaming-green/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-gaming-green" />
              <div>
                <p className="text-sm text-gray-400">En stock</p>
                <p className="text-2xl font-bold text-white">{stats.enStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-600/20 border-yellow-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Stock faible</p>
                <p className="text-2xl font-bold text-white">{stats.stockFaible}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-600/20 border-red-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Rupture</p>
                <p className="text-2xl font-bold text-white">{stats.rupture}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Rechercher un produit par nom, description ou code-barres..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-800">
          <TabsTrigger value="tous" className="data-[state=active]:bg-gaming-purple">
            Tous
          </TabsTrigger>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-gaming-purple flex items-center gap-1"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{category.nom}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="tous" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Tous les produits</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredProducts.length} produit(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Produit</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Catégorie</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Prix</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Stock</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Code-barres</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{product.nom}</p>
                            <p className="text-sm text-gray-400">{product.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-gaming-cyan text-gaming-cyan">
                            {categories.find(c => c.id === product.categorie)?.nom}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gaming-green font-semibold">
                          €{product.prix}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">
                            {product.stock}
                            <span className="text-sm text-gray-400 ml-1">
                              (min: {product.stockMin})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatutColor(product.statut)} flex items-center gap-1 w-fit`}>
                            {getStatutIcon(product.statut)}
                            {product.statut}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                          {product.codeBarre}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gaming-purple hover:bg-gaming-purple/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-400 hover:bg-red-400/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Aucun produit trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <category.icon className="w-5 h-5" />
                  {category.nom}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {getCategoryProducts(category.id).length} produit(s) dans cette catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCategoryProducts(category.id).map((product) => (
                    <Card key={product.id} className="bg-gray-800 border-gray-700 hover:border-gaming-purple/50 transition-all">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-white font-medium text-sm">{product.nom}</h3>
                          <Badge className={`${getStatutColor(product.statut)} text-xs`}>
                            {product.statut}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-3">{product.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">Prix:</span>
                            <span className="text-gaming-green font-semibold">€{product.prix}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">Stock:</span>
                            <span className="text-white">{product.stock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">Fournisseur:</span>
                            <span className="text-gray-300 text-xs">{product.fournisseur}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gaming-purple hover:bg-gaming-purple/20 h-8 w-8 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-400 hover:bg-red-400/20 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {getCategoryProducts(category.id).length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <category.icon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">Aucun produit dans cette catégorie</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
