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
  AlertTriangle
} from "lucide-react";

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

  const tabsData = [
    {
      id: "pc-portables",
      label: "PC Portables",
      icon: Laptop,
      count: pcPortables.length,
      component: <PCPortable embedded={true} />
    },
    {
      id: "composants-pc",
      label: "Composants PC",
      icon: Cpu,
      count: composantsPC.length,
      component: <ComposantsPC embedded={true} />
    },
    {
      id: "pc-gamer",
      label: "PC Gamer",
      icon: Settings,
      count: pcGamerConfigs.length,
      component: <PCGamer embedded={true} />
    },
    {
      id: "moniteurs",
      label: "Moniteurs",
      icon: Monitor,
      count: moniteurs.length,
      component: <MoniteursNew embedded={true} />
    },
    {
      id: "chaises-gaming",
      label: "Chaises Gaming",
      icon: Armchair,
      count: chaisesGaming.length,
      component: <ChaisesGaming embedded={true} />
    },
    {
      id: "peripheriques",
      label: "Périphériques",
      icon: Mouse,
      count: peripheriques.length,
      component: <Peripheriques embedded={true} />
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion du Stock</h1>
            <p className="text-gray-400">Gérez tous vos produits depuis une interface unifiée</p>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-blue/20 rounded-lg">
                <Package className="w-6 h-6 text-gaming-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Produits</p>
                <p className="text-2xl font-bold text-white">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-green/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-gaming-green" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Valeur Stock</p>
                <p className="text-2xl font-bold text-white">{totalValue.toLocaleString()} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-yellow/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-gaming-yellow" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Stock Faible</p>
                <p className="text-2xl font-bold text-white">{lowStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-red/20 rounded-lg">
                <Package className="w-6 h-6 text-gaming-red" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Rupture Stock</p>
                <p className="text-2xl font-bold text-white">{outOfStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets des produits */}
      <Card className="bg-card border-gray-800">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6 bg-gray-800/50">
              {tabsData.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2 data-[state=active]:bg-gaming-cyan data-[state=active]:text-black"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabsData.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <div className="bg-background rounded-lg">
                  {tab.component}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockPage; 