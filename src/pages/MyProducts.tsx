
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, Filter, Eye, Edit, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MyProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Données simulées des produits assignés au membre
  const assignedProducts = [
    {
      id: "P001",
      name: "Chaise Gaming RGB Pro",
      category: "Mobilier",
      brand: "GameMax",
      stock: 15,
      minStock: 10,
      price: 2500,
      status: "En stock",
      lastUpdate: "2024-01-15",
      assignedDate: "2024-01-01"
    },
    {
      id: "P002",
      name: "Clavier Mécanique RGB",
      category: "Périphériques",
      brand: "TechPro",
      stock: 3,
      minStock: 5,
      price: 850,
      status: "Stock faible",
      lastUpdate: "2024-01-14",
      assignedDate: "2024-01-01"
    },
    {
      id: "P003",
      name: "Écran 4K 27 pouces",
      category: "Moniteurs",
      brand: "ViewMax",
      stock: 8,
      minStock: 3,
      price: 3200,
      status: "En stock",
      lastUpdate: "2024-01-13",
      assignedDate: "2024-01-05"
    },
    {
      id: "P004",
      name: "Souris Gaming Pro",
      category: "Périphériques",
      brand: "GameTech",
      stock: 0,
      minStock: 8,
      price: 450,
      status: "Rupture",
      lastUpdate: "2024-01-12",
      assignedDate: "2024-01-01"
    },
    {
      id: "P005",
      name: "Casque Gaming 7.1",
      category: "Périphériques",
      brand: "SoundMax",
      stock: 12,
      minStock: 6,
      price: 680,
      status: "En stock",
      lastUpdate: "2024-01-15",
      assignedDate: "2024-01-08"
    },
  ];

  const filteredProducts = assignedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
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

  const totalProducts = assignedProducts.length;
  const lowStockProducts = assignedProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockProducts = assignedProducts.filter(p => p.stock === 0).length;
  const totalValue = assignedProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Mes Produits</h2>
          <p className="text-gray-400 mt-1">Gérez les produits qui vous sont assignés</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Valeur Stock</CardTitle>
            <Package className="h-4 w-4 text-gaming-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalValue.toLocaleString()} MAD</div>
            <p className="text-xs text-gray-400">Valeur totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Filtres de Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, marque ou ID..."
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
                <SelectItem value="Composants">Composants</SelectItem>
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
          <CardTitle className="text-white">Liste des Produits Assignés</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredProducts.length} produit(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Produit</TableHead>
                <TableHead className="text-gray-300">Catégorie</TableHead>
                <TableHead className="text-gray-300">Stock</TableHead>
                <TableHead className="text-gray-300">Prix</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Dernière MAJ</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-gray-700 hover:bg-gray-700/30">
                  <TableCell className="text-white font-medium">{product.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-white font-medium">{product.name}</div>
                      <div className="text-gray-400 text-sm">{product.brand}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gaming-purple text-gaming-purple">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-white">
                      {product.stock} / {product.minStock}
                      {product.stock <= product.minStock && (
                        <AlertTriangle className="inline h-4 w-4 ml-1 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{product.price} MAD</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{product.lastUpdate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-gaming-cyan hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gaming-purple hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProducts;
