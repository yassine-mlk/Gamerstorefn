import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Laptop, 
  Cpu, 
  Settings, 
  Monitor, 
  Armchair, 
  Mouse,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Import des composants de produits (nous garderons seulement le contenu des pages, pas les headers)
import PCPortable from "./PCPortableNew";
import ComposantsPC from "./ComposantsPC";
import PCGamer from "./PCGamer";
import MoniteursNew from "./MoniteursNew";
import ChaisesGaming from "./ChaisesGamingSimple";
import Peripheriques from "./Peripheriques";

// Hook pour obtenir les statistiques de stock
import { usePcPortables } from "@/hooks/usePcPortables";
import { useComposantsPC } from "@/hooks/useComposantsPC";
import { usePCGamer } from "@/hooks/usePCGamer";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { useChaisesGamingSupabase } from "@/hooks/useChaisesGamingSupabase";
import { usePeripheriques } from "@/hooks/usePeripheriques";

const StockPage = () => {
  const [activeTab, setActiveTab] = useState("pc-portables");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Hooks pour les statistiques
  const { pcPortables } = usePcPortables();
  const { composantsPC } = useComposantsPC();
  const { pcGamerConfigs } = usePCGamer();
  const { moniteurs } = useMoniteurs();
  const { chaisesGaming } = useChaisesGamingSupabase();
  const { peripheriques } = usePeripheriques();

  // Calcul des statistiques générales
  const totalProducts = 
    pcPortables.length + 
    composantsPC.length + 
    pcGamerConfigs.length + 
    moniteurs.length + 
    chaisesGaming.length + 
    peripheriques.length;

  const lowStockProducts = [
    ...pcPortables.filter(p => p.stock_actuel <= (p.stock_minimum || 5)),
    ...composantsPC.filter(p => p.stock_actuel <= (p.stock_minimum || 5)),
    ...pcGamerConfigs.filter(p => (p.stock_possible || 0) <= 2), // PC Gamer avec stock possible faible
    ...moniteurs.filter(p => p.stock_actuel <= (p.stock_minimum || 5)),
    ...chaisesGaming.filter(p => p.stock_actuel <= (p.stock_minimum || 5)),
    ...peripheriques.filter(p => p.stock_actuel <= (p.stock_minimum || 5))
  ].length;

  const outOfStockProducts = [
    ...pcPortables.filter(p => p.stock_actuel === 0),
    ...composantsPC.filter(p => p.stock_actuel === 0),
    ...pcGamerConfigs.filter(p => (p.stock_possible || 0) === 0), // PC Gamer sans stock possible
    ...moniteurs.filter(p => p.stock_actuel === 0),
    ...chaisesGaming.filter(p => p.stock_actuel === 0),
    ...peripheriques.filter(p => p.stock_actuel === 0)
  ].length;

  const totalValue = [
    ...pcPortables.map(p => p.prix_vente * p.stock_actuel),
    ...composantsPC.map(p => p.prix_vente * p.stock_actuel),
    ...pcGamerConfigs.map(p => p.prix_vente * (p.stock_possible || 0)), // PC Gamer utilise stock_possible
    ...moniteurs.map(p => p.prix_vente * p.stock_actuel),
    ...chaisesGaming.map(p => p.prix_vente * p.stock_actuel),
    ...peripheriques.map(p => p.prix_vente * p.stock_actuel)
  ].reduce((sum, value) => sum + value, 0);

  // Calcul des statistiques par catégorie
  const categoryStats = {
    pcPortables: {
      total: pcPortables.length,
      inStock: pcPortables.filter(p => p.stock_actuel > 0).length,
      lowStock: pcPortables.filter(p => p.stock_actuel <= (p.stock_minimum || 5) && p.stock_actuel > 0).length,
      outOfStock: pcPortables.filter(p => p.stock_actuel === 0).length,
      value: pcPortables.reduce((sum, p) => sum + (p.prix_vente * p.stock_actuel), 0)
    },
    composantsPC: {
      total: composantsPC.length,
      inStock: composantsPC.filter(p => p.stock_actuel > 0).length,
      lowStock: composantsPC.filter(p => p.stock_actuel <= (p.stock_minimum || 5) && p.stock_actuel > 0).length,
      outOfStock: composantsPC.filter(p => p.stock_actuel === 0).length,
      value: composantsPC.reduce((sum, p) => sum + (p.prix_vente * p.stock_actuel), 0)
    },
    pcGamer: {
      total: pcGamerConfigs.length,
      inStock: pcGamerConfigs.filter(p => (p.stock_possible || 0) > 0).length,
      lowStock: pcGamerConfigs.filter(p => (p.stock_possible || 0) <= 2 && (p.stock_possible || 0) > 0).length,
      outOfStock: pcGamerConfigs.filter(p => (p.stock_possible || 0) === 0).length,
      value: pcGamerConfigs.reduce((sum, p) => sum + (p.prix_vente * (p.stock_possible || 0)), 0)
    },
    moniteurs: {
      total: moniteurs.length,
      inStock: moniteurs.filter(p => p.stock_actuel > 0).length,
      lowStock: moniteurs.filter(p => p.stock_actuel <= (p.stock_minimum || 5) && p.stock_actuel > 0).length,
      outOfStock: moniteurs.filter(p => p.stock_actuel === 0).length,
      value: moniteurs.reduce((sum, p) => sum + (p.prix_vente * p.stock_actuel), 0)
    },
    chaisesGaming: {
      total: chaisesGaming.length,
      inStock: chaisesGaming.filter(p => p.stock_actuel > 0).length,
      lowStock: chaisesGaming.filter(p => p.stock_actuel <= (p.stock_minimum || 5) && p.stock_actuel > 0).length,
      outOfStock: chaisesGaming.filter(p => p.stock_actuel === 0).length,
      value: chaisesGaming.reduce((sum, p) => sum + (p.prix_vente * p.stock_actuel), 0)
    },
    peripheriques: {
      total: peripheriques.length,
      inStock: peripheriques.filter(p => p.stock_actuel > 0).length,
      lowStock: peripheriques.filter(p => p.stock_actuel <= (p.stock_minimum || 5) && p.stock_actuel > 0).length,
      outOfStock: peripheriques.filter(p => p.stock_actuel === 0).length,
      value: peripheriques.reduce((sum, p) => sum + (p.prix_vente * p.stock_actuel), 0)
    }
  };

  const tabsData = [
    {
      id: "pc-portables",
      label: "PC Portables",
      icon: Laptop,
      count: pcPortables.length,
      component: <PCPortable embedded={true} />,
      stats: categoryStats.pcPortables
    },
    {
      id: "composants-pc",
      label: "Composants PC",
      icon: Cpu,
      count: composantsPC.length,
      component: <ComposantsPC embedded={true} />,
      stats: categoryStats.composantsPC
    },
    {
      id: "pc-gamer",
      label: "PC Gamer",
      icon: Settings,
      count: pcGamerConfigs.length,
      component: <PCGamer embedded={true} />,
      stats: categoryStats.pcGamer
    },
    {
      id: "moniteurs",
      label: "Moniteurs",
      icon: Monitor,
      count: moniteurs.length,
      component: <MoniteursNew embedded={true} />,
      stats: categoryStats.moniteurs
    },
    {
      id: "chaises-gaming",
      label: "Chaises Gaming",
      icon: Armchair,
      count: chaisesGaming.length,
      component: <ChaisesGaming embedded={true} />,
      stats: categoryStats.chaisesGaming
    },
    {
      id: "peripheriques",
      label: "Périphériques",
      icon: Mouse,
      count: peripheriques.length,
      component: <Peripheriques embedded={true} />,
      stats: categoryStats.peripheriques
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Stock</h1>
            <p className="text-gray-600">Gérez tous vos produits depuis une interface unifiée</p>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-cyan/20 rounded-lg">
                <Package className="w-6 h-6 text-gaming-cyan" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valeur Stock</p>
                <p className="text-2xl font-bold text-gray-900">{totalValue.toLocaleString()} MAD</p>
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
                <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Package className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rupture Stock</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par catégorie */}
      <Card className="bg-card border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistiques par Catégorie
          </CardTitle>
          <CardDescription>
            Vue d'ensemble du stock par type de produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabsData.map((tab) => {
              const IconComponent = tab.icon;
              const stats = tab.stats;
              return (
                <div key={tab.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className="w-5 h-5 text-gaming-cyan" />
                    <h3 className="font-semibold text-gray-900">{tab.label}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">En stock:</span>
                      <span className="font-medium text-green-600">{stats.inStock}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stock faible:</span>
                      <span className="font-medium text-yellow-600">{stats.lowStock}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rupture:</span>
                      <span className="font-medium text-red-600">{stats.outOfStock}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Valeur:</span>
                      <span className="font-medium text-gaming-cyan">{stats.value.toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card className="bg-card border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="État du stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                <SelectItem value="in_stock">En stock</SelectItem>
                <SelectItem value="low_stock">Stock faible</SelectItem>
                <SelectItem value="out_of_stock">Rupture</SelectItem>
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
                  <SelectItem value="value">Valeur</SelectItem>
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6 bg-gray-100 gap-1">
              {tabsData.map((tab) => {
                const IconComponent = tab.icon;
                const stats = tab.stats;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex flex-col items-center gap-2 data-[state=active]:bg-gaming-cyan data-[state=active]:text-white p-3 hover:bg-gray-200 transition-colors rounded-md"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200 px-1 py-0">
                        {stats.inStock}
                      </Badge>
                      {stats.lowStock > 0 && (
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200 px-1 py-0">
                          {stats.lowStock}
                        </Badge>
                      )}
                      {stats.outOfStock > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200 px-1 py-0">
                          {stats.outOfStock}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabsData.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  {tab.component}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card className="bg-card border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités de gestion du stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2 p-4 h-auto">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div className="text-left">
                <div className="font-medium">Stock Faible</div>
                <div className="text-sm text-gray-600">{lowStockProducts} produits</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 p-4 h-auto">
              <Package className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium">Ruptures</div>
                <div className="text-sm text-gray-600">{outOfStockProducts} produits</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 p-4 h-auto">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Valeur Totale</div>
                <div className="text-sm text-gray-600">{totalValue.toLocaleString()} MAD</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockPage; 