import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Laptop,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PCPortable {
  id: number;
  nom: string;
  marque: string;
  modele: string;
  processeur: string;
  ram: string;
  stockage: string;
  carteGraphique: string;
  ecran: string;
  prixAchat: number;
  prixVente: number;
  stock: number;
  codeBarre: string;
  fournisseur: string;
  statut: 'En stock' | 'Stock faible' | 'Rupture';
  image?: string;
  garantie: string;
}

const mockPCPortables: PCPortable[] = [
  {
    id: 1,
    nom: "ASUS ROG Strix G15",
    marque: "ASUS",
    modele: "ROG Strix G15",
    processeur: "AMD Ryzen 7 7735HS",
    ram: "16 GB DDR5",
    stockage: "512 GB SSD NVMe",
    carteGraphique: "NVIDIA RTX 4060 8GB",
    ecran: "15.6\"",
    prixAchat: 1099,
    prixVente: 1299,
    stock: 8,
    codeBarre: "PC001234567",
    fournisseur: "TechDistrib Pro",
    statut: "En stock",
    garantie: "12 mois"
  },
  {
    id: 2,
    nom: "MacBook Air M2",
    marque: "Apple",
    modele: "MacBook Air M2",
    processeur: "Apple M2",
    ram: "8 GB",
    stockage: "256 GB SSD",
    carteGraphique: "GPU M2 8 cœurs",
    ecran: "13.6\"",
    prixAchat: 1099,
    prixVente: 1299,
    stock: 2,
    codeBarre: "PC001234568",
    fournisseur: "Apple Distribution",
    statut: "Stock faible",
    garantie: "12 mois"
  },
  {
    id: 3,
    nom: "HP Pavilion Gaming",
    marque: "HP",
    modele: "Pavilion Gaming 15",
    processeur: "Intel Core i5-12500H",
    ram: "8 GB DDR4",
    stockage: "512 GB SSD",
    carteGraphique: "NVIDIA RTX 3050 4GB",
    ecran: "15.6\"",
    prixAchat: 699,
    prixVente: 899,
    stock: 0,
    codeBarre: "PC001234569",
    fournisseur: "HP Enterprise",
    statut: "Rupture",
    garantie: "6 mois"
  }
];

// Marques par défaut - seront gérées via les paramètres plus tard
const marques = ["ASUS", "Apple", "HP", "Dell", "Lenovo", "Acer", "MSI", "Alienware"];
const garanties = ["Sans garantie", "3 mois", "6 mois", "9 mois", "12 mois"];

// Mock fournisseurs - à remplacer par les vrais fournisseurs de la base
const mockFournisseurs = [
  "TechDistrib Pro",
  "Apple Distribution", 
  "HP Enterprise",
  "Dell Partners",
  "Lenovo Direct",
  "Acer Wholesale",
  "MSI Gaming",
  "Tech Solutions"
];

export default function PCPortable() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<PCPortable[]>(mockPCPortables);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PCPortable | null>(null);
  const [newProduct, setNewProduct] = useState({
    nom: "",
    marque: "",
    modele: "",
    processeur: "",
    ram: "",
    stockage: "",
    carteGraphique: "",
    ecran: "",
    prixAchat: "",
    prixVente: "",
    stock: "",
    codeBarre: "",
    fournisseur: "",
    garantie: "",
    image: ""
  });
  const { toast } = useToast();

  const filteredProducts = products.filter(product => 
    product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codeBarre.includes(searchTerm)
  );

  const handleAddProduct = () => {
    if (!newProduct.nom || !newProduct.marque || !newProduct.prixAchat || !newProduct.prixVente || !newProduct.stock) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const stock = parseInt(newProduct.stock);
    
    const product: PCPortable = {
      id: Date.now(),
      nom: newProduct.nom,
      marque: newProduct.marque,
      modele: newProduct.modele,
      processeur: newProduct.processeur,
      ram: newProduct.ram,
      stockage: newProduct.stockage,
      carteGraphique: newProduct.carteGraphique,
      ecran: newProduct.ecran,
      prixAchat: parseFloat(newProduct.prixAchat),
      prixVente: parseFloat(newProduct.prixVente),
      stock: stock,
      codeBarre: newProduct.codeBarre || `PC${Date.now()}`,
      fournisseur: newProduct.fournisseur || "Non défini",
      statut: stock === 0 ? "Rupture" : stock <= 3 ? "Stock faible" : "En stock",
      garantie: newProduct.garantie,
      image: newProduct.image
    };

    setProducts([...products, product]);
    resetForm();
    setIsAddDialogOpen(false);
    
    toast({
      title: "PC Portable ajouté",
      description: `${product.nom} a été ajouté au stock`,
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct || !newProduct.nom || !newProduct.marque || !newProduct.prixAchat || !newProduct.prixVente || !newProduct.stock) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const stock = parseInt(newProduct.stock);
    
    const updatedProduct: PCPortable = {
      ...editingProduct,
      nom: newProduct.nom,
      marque: newProduct.marque,
      modele: newProduct.modele,
      processeur: newProduct.processeur,
      ram: newProduct.ram,
      stockage: newProduct.stockage,
      carteGraphique: newProduct.carteGraphique,
      ecran: newProduct.ecran,
      prixAchat: parseFloat(newProduct.prixAchat),
      prixVente: parseFloat(newProduct.prixVente),
      stock: stock,
      codeBarre: newProduct.codeBarre,
      fournisseur: newProduct.fournisseur,
      statut: stock === 0 ? "Rupture" : stock <= 3 ? "Stock faible" : "En stock",
      garantie: newProduct.garantie,
      image: newProduct.image
    };

    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
    resetForm();
    setEditingProduct(null);
    
    toast({
      title: "PC Portable modifié",
      description: `${updatedProduct.nom} a été mis à jour`,
    });
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
    toast({
      title: "PC Portable supprimé",
      description: "Le produit a été supprimé du stock",
    });
  };

  const resetForm = () => {
    setNewProduct({
      nom: "",
      marque: "",
      modele: "",
      processeur: "",
      ram: "",
      stockage: "",
      carteGraphique: "",
      ecran: "",
      prixAchat: "",
      prixVente: "",
      stock: "",
      codeBarre: "",
      fournisseur: "",
      garantie: "",
      image: ""
    });
  };

  const openEditDialog = (product: PCPortable) => {
    setEditingProduct(product);
    setNewProduct({
      nom: product.nom,
      marque: product.marque,
      modele: product.modele,
      processeur: product.processeur,
      ram: product.ram,
      stockage: product.stockage,
      carteGraphique: product.carteGraphique,
      ecran: product.ecran,
      prixAchat: product.prixAchat.toString(),
      prixVente: product.prixVente.toString(),
      stock: product.stock.toString(),
      codeBarre: product.codeBarre,
      fournisseur: product.fournisseur,
      garantie: product.garantie,
      image: product.image || ""
    });
    setIsAddDialogOpen(true);
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
      default: return <Laptop className="w-4 h-4" />;
    }
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
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Laptop className="w-8 h-8 text-gaming-cyan" />
              PC Portables
            </h1>
            <p className="text-gray-400">Gestion du stock des ordinateurs portables</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau PC Portable
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Modifier le PC Portable" : "Ajouter un nouveau PC Portable"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Remplissez les informations du PC portable
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom du produit *</Label>
                  <Input
                    id="nom"
                    value={newProduct.nom}
                    onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Ex: ASUS ROG Strix G15"
                  />
                </div>
                <div>
                  <Label htmlFor="marque">Marque *</Label>
                  <Select value={newProduct.marque} onValueChange={(value) => setNewProduct({ ...newProduct, marque: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner une marque" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {marques.map((marque) => (
                        <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modele">Modèle</Label>
                  <Input
                    id="modele"
                    value={newProduct.modele}
                    onChange={(e) => setNewProduct({ ...newProduct, modele: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Ex: ROG Strix G15"
                  />
                </div>
                <div>
                  <Label htmlFor="ecran">Écran</Label>
                  <Input
                    id="ecran"
                    value={newProduct.ecran}
                    onChange={(e) => setNewProduct({ ...newProduct, ecran: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Ex: 15.6'' ou 13.6''"
                  />
                </div>
              </div>

              {/* Spécifications techniques */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Spécifications techniques</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="processeur">Processeur</Label>
                    <Input
                      id="processeur"
                      value={newProduct.processeur}
                      onChange={(e) => setNewProduct({ ...newProduct, processeur: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: Intel Core i7 ou AMD Ryzen 7"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ram">Mémoire RAM</Label>
                    <Input
                      id="ram"
                      value={newProduct.ram}
                      onChange={(e) => setNewProduct({ ...newProduct, ram: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: 16 GB DDR5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="stockage">Stockage</Label>
                    <Input
                      id="stockage"
                      value={newProduct.stockage}
                      onChange={(e) => setNewProduct({ ...newProduct, stockage: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: 512 GB SSD NVMe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carteGraphique">Carte graphique</Label>
                    <Input
                      id="carteGraphique"
                      value={newProduct.carteGraphique}
                      onChange={(e) => setNewProduct({ ...newProduct, carteGraphique: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: NVIDIA RTX 4060"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="garantie">Garantie</Label>
                  <Select value={newProduct.garantie} onValueChange={(value) => setNewProduct({ ...newProduct, garantie: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner la garantie" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {garanties.map((garantie) => (
                        <SelectItem key={garantie} value={garantie}>{garantie}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image */}
              <div className="border-t border-gray-700 pt-4">
                <Label htmlFor="image">Image du produit</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="bg-gray-800 border-gray-600 flex-1"
                    placeholder="URL de l'image ou chemin"
                  />
                  <Button variant="outline" className="border-gray-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Informations commerciales */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Informations commerciales</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prixAchat">Prix d'achat (MAD) *</Label>
                    <Input
                      id="prixAchat"
                      type="number"
                      value={newProduct.prixAchat}
                      onChange={(e) => setNewProduct({ ...newProduct, prixAchat: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prixVente">Prix de vente (MAD) *</Label>
                    <Input
                      id="prixVente"
                      type="number"
                      value={newProduct.prixVente}
                      onChange={(e) => setNewProduct({ ...newProduct, prixVente: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="0"
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
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
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
                    <Select value={newProduct.fournisseur} onValueChange={(value) => setNewProduct({ ...newProduct, fournisseur: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {mockFournisseurs.map((fournisseur) => (
                          <SelectItem key={fournisseur} value={fournisseur}>{fournisseur}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button 
                onClick={editingProduct ? handleEditProduct : handleAddProduct} 
                className="gaming-gradient"
              >
                {editingProduct ? "Modifier" : "Ajouter"}
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
              <Laptop className="w-8 h-8 text-gaming-purple" />
              <div>
                <p className="text-sm text-gray-400">Total PC Portables</p>
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
          placeholder="Rechercher un PC portable par nom, marque, modèle ou code-barres..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      {/* Products Grid */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Laptop className="w-5 h-5" />
            PC Portables
          </CardTitle>
          <CardDescription className="text-gray-400">
            {filteredProducts.length} PC portable(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-gray-800 border-gray-700 hover:border-gaming-purple/50 transition-all">
                <CardContent className="p-4">
                  {/* Image */}
                  <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.nom}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-gray-500" />
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg">{product.nom}</h3>
                      <p className="text-gaming-cyan text-sm">{product.marque} {product.modele}</p>
                    </div>
                    <Badge className={`${getStatutColor(product.statut)} text-xs ml-2`}>
                      {product.statut}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">PC portable {product.marque} {product.modele}</p>
                  
                  {/* Specs */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processeur:</span>
                      <span className="text-white">{product.processeur}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">RAM:</span>
                      <span className="text-white">{product.ram}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Stockage:</span>
                      <span className="text-white">{product.stockage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Carte graphique:</span>
                      <span className="text-white">{product.carteGraphique}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Écran:</span>
                      <span className="text-white">{product.ecran}</span>
                    </div>
                  </div>

                  {/* Commercial Info */}
                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prix d'achat:</span>
                      <span className="text-gaming-green font-semibold">{product.prixAchat} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prix de vente:</span>
                      <span className="text-gaming-green font-semibold">{product.prixVente} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Stock:</span>
                      <span className="text-white">{product.stock} unités</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Fournisseur:</span>
                      <span className="text-gray-300 text-sm">{product.fournisseur}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/pc-portable/${product.id}`)}
                      className="text-gaming-cyan hover:bg-gaming-cyan/20 h-8 w-8 p-0"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(product)}
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
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Laptop className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Aucun PC portable trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 