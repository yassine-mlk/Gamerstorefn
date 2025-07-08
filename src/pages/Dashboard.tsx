import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  DollarSign,
  ShoppingCart,
  Calendar,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Zap
} from "lucide-react";
import { useVentes, type VenteStats } from "@/hooks/useVentes";
import { usePcPortables } from "@/hooks/usePcPortables";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { usePeripheriques } from "@/hooks/usePeripheriques";
import { useChaisesGamingSupabase } from "@/hooks/useChaisesGamingSupabase";

export default function Dashboard() {
  const { getVentesStats, loading: loadingVentes } = useVentes();
  const { pcPortables, loading: loadingPC } = usePcPortables();
  const { moniteurs, loading: loadingMoniteurs } = useMoniteurs();
  const { peripheriques, loading: loadingPeripheriques } = usePeripheriques();
  const { chaisesGaming, loading: loadingChaises } = useChaisesGamingSupabase();

  const [stats, setStats] = useState<VenteStats | null>(null);
  const [period, setPeriod] = useState("ce_mois");
  const [loadingStats, setLoadingStats] = useState(false);

  const isLoading = loadingVentes || loadingPC || loadingMoniteurs || loadingPeripheriques || loadingChaises;

  const loadStats = async () => {
    setLoadingStats(true);
    
    const filters: any = {};
    const today = new Date();
    
    switch (period) {
      case "aujourd_hui":
        filters.date_debut = today.toISOString().split('T')[0];
        filters.date_fin = today.toISOString().split('T')[0];
        break;
      case "cette_semaine":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        filters.date_debut = startOfWeek.toISOString().split('T')[0];
        break;
      case "ce_mois":
        filters.date_debut = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case "cette_annee":
        filters.date_debut = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
    }

    const newStats = await getVentesStats(filters);
    setStats(newStats);
    setLoadingStats(false);
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  // Calcul des statistiques des stocks
  const getStockStats = () => {
    const allProducts = [
      ...pcPortables.map(p => ({ ...p, type: 'PC Portable' })),
      ...moniteurs.map(p => ({ ...p, type: 'Moniteur' })),
      ...peripheriques.map(p => ({ ...p, type: 'Périphérique' })),
      ...chaisesGaming.map(p => ({ ...p, type: 'Chaise Gaming' }))
    ];

    const totalStock = allProducts.reduce((sum, p) => sum + p.stock_actuel, 0);
    const stockFaible = allProducts.filter(p => p.stock_actuel <= p.stock_minimum).length;
    const rupture = allProducts.filter(p => p.stock_actuel === 0).length;
    const valeurStock = allProducts.reduce((sum, p) => sum + (p.prix_achat * p.stock_actuel), 0);

    return { totalStock, stockFaible, rupture, valeurStock, totalProducts: allProducts.length };
  };

  const stockStats = getStockStats();

  // Calcul du taux de croissance (simulé)
  const calculateGrowthRate = (current: number) => {
    const previous = current * (0.8 + Math.random() * 0.4); // Simulation
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  const formatPeriodLabel = (period: string) => {
    switch (period) {
      case "aujourd_hui": return "Aujourd'hui";
      case "cette_semaine": return "Cette semaine";
      case "ce_mois": return "Ce mois";
      case "cette_annee": return "Cette année";
      default: return period;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'payee': return 'bg-green-500';
      case 'en_cours': return 'bg-yellow-500';
      case 'partiellement_payee': return 'bg-orange-500';
      case 'annulee': return 'bg-red-500';
      case 'remboursee': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatutLabel = (statut: string) => {
    switch (statut) {
      case 'payee': return 'Payées';
      case 'en_cours': return 'En cours';
      case 'partiellement_payee': return 'Part. payées';
      case 'annulee': return 'Annulées';
      case 'remboursee': return 'Remboursées';
      default: return statut;
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-gaming-cyan" />
              Tableau de bord
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">Vue d'ensemble de votre activité</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="bg-white border-gray-200 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="aujourd_hui">Aujourd'hui</SelectItem>
              <SelectItem value="cette_semaine">Cette semaine</SelectItem>
              <SelectItem value="ce_mois">Ce mois</SelectItem>
              <SelectItem value="cette_annee">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={loadStats} 
            variant="outline" 
            size="sm"
            disabled={loadingStats}
            className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-black"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales des ventes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-gaming-cyan/20 to-gaming-cyan/5 border-gaming-cyan/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gaming-cyan">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : `${(stats?.total_ventes || 0).toLocaleString()} MAD`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">
                    +{calculateGrowthRate(stats?.total_ventes || 0)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gaming-cyan/20 rounded-full">
                <DollarSign className="w-6 h-6 text-gaming-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gaming-purple/20 to-gaming-purple/5 border-gaming-purple/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gaming-purple">Nombre de ventes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : (stats?.nombre_ventes || 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">
                    +{calculateGrowthRate(stats?.nombre_ventes || 0)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gaming-purple/20 rounded-full">
                <Receipt className="w-6 h-6 text-gaming-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gaming-green/20 to-gaming-green/5 border-gaming-green/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gaming-green">Vente moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : `${(stats?.vente_moyenne || 0).toFixed(0)} MAD`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">
                    +{calculateGrowthRate(stats?.vente_moyenne || 0)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gaming-green/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-gaming-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-400">Clients uniques</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : (stats?.nombre_clients || 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">
                    +{calculateGrowthRate(stats?.nombre_clients || 0)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total produits</p>
                <p className="text-2xl font-bold text-gray-900">{stockStats.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">Articles en catalogue</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock total</p>
                <p className="text-2xl font-bold text-gray-900">{stockStats.totalStock}</p>
                <p className="text-xs text-gray-500 mt-1">Unités disponibles</p>
              </div>
              <div className="p-3 bg-gaming-cyan/20 rounded-full">
                <ShoppingCart className="w-6 h-6 text-gaming-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes stock</p>
                <p className="text-2xl font-bold text-orange-400">{stockStats.stockFaible}</p>
                <p className="text-xs text-gray-500 mt-1">Produits en stock faible</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-full">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur stock</p>
                <p className="text-2xl font-bold text-gray-900">{stockStats.valeurStock.toLocaleString()} MAD</p>
                <p className="text-xs text-gray-500 mt-1">Valeur totale</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Répartition des ventes - {formatPeriodLabel(period)}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Statut des ventes de la période sélectionnée
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-gaming-cyan" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats?.ventes_par_statut || {}).map(([statut, count]) => (
                  <div key={statut} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(statut)} text-white`}>
                        {formatStatutLabel(statut)}
                      </Badge>
                      <span className="text-gray-300">{count} vente(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getStatusColor(statut)}`}
                          style={{ 
                            width: `${Math.min(100, (count / (stats?.nombre_ventes || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">
                        {((count / (stats?.nombre_ventes || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats?.ventes_par_statut || Object.keys(stats.ventes_par_statut).length === 0) && (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Aucune vente pour cette période</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartition par mode de paiement */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Modes de paiement - {formatPeriodLabel(period)}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Répartition des modes de paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-gaming-cyan" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats?.ventes_par_mode_paiement || {}).map(([mode, count]) => (
                  <div key={mode} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-gaming-cyan text-gaming-cyan capitalize">
                        {mode}
                      </Badge>
                      <span className="text-gray-700">{count} vente(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gaming-cyan"
                          style={{ 
                            width: `${Math.min(100, (count / (stats?.nombre_ventes || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {((count / (stats?.nombre_ventes || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats?.ventes_par_mode_paiement || Object.keys(stats.ventes_par_mode_paiement).length === 0) && (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Aucune vente pour cette période</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Évolution mensuelle */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Évolution des ventes (12 derniers mois)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Tendance du chiffre d'affaires et du nombre de ventes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-gaming-cyan" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.evolution_mensuelle && stats.evolution_mensuelle.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stats.evolution_mensuelle.map((mois, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-400">{mois.mois}</p>
                          <p className="text-lg font-bold text-gaming-cyan">{mois.total.toLocaleString()} MAD</p>
                          <p className="text-xs text-gray-400">{mois.nombre} vente(s)</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Aucune donnée d'évolution disponible</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
