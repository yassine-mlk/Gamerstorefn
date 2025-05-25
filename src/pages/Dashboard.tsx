
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Calendar,
  Target
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const salesData = [
  { name: 'Jan', ventes: 45000, commandes: 120 },
  { name: 'Fév', ventes: 52000, commandes: 140 },
  { name: 'Mar', ventes: 48000, commandes: 135 },
  { name: 'Avr', ventes: 61000, commandes: 165 },
  { name: 'Mai', ventes: 58000, commandes: 155 },
  { name: 'Juin', ventes: 67000, commandes: 180 },
];

const categoryData = [
  { name: 'PC Gamer', value: 35, color: '#6366f1' },
  { name: 'Composants', value: 25, color: '#06b6d4' },
  { name: 'Périphériques', value: 20, color: '#ec4899' },
  { name: 'Moniteurs', value: 15, color: '#10b981' },
  { name: 'Autres', value: 5, color: '#f59e0b' },
];

const topProducts = [
  { name: 'RTX 4090 Gaming', sales: 45, stock: 12, status: 'En stock' },
  { name: 'AMD Ryzen 9 7950X', sales: 38, stock: 8, status: 'Stock faible' },
  { name: 'Corsair K95 RGB', sales: 32, stock: 25, status: 'En stock' },
  { name: 'ASUS ROG Monitor 27"', sales: 28, stock: 5, status: 'Stock critique' },
  { name: 'Logitech G Pro X', sales: 24, stock: 18, status: 'En stock' },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
            <p className="text-gray-400">Vue d'ensemble de votre magasin TechStore</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-gaming-purple to-gaming-purple/80 border-gaming-purple/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€67,245</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+12.5% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gaming-cyan to-gaming-cyan/80 border-gaming-cyan/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">180</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+8.2% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gaming-pink to-gaming-pink/80 border-gaming-pink/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+5.7% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gaming-green to-gaming-green/80 border-gaming-green/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits en stock</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <div className="flex items-center text-xs mt-1">
              <AlertTriangle className="w-3 h-3 mr-1 text-yellow-300" />
              <span>12 stocks faibles</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Évolution des ventes</CardTitle>
            <CardDescription className="text-gray-400">
              Chiffre d'affaires et nombre de commandes sur 6 mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ventes" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="commandes" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Répartition par catégorie</CardTitle>
            <CardDescription className="text-gray-400">
              Pourcentage des ventes par type de produit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top produits du mois</CardTitle>
          <CardDescription className="text-gray-400">
            Les produits les plus vendus avec leur niveau de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Produit</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Ventes</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-gaming-cyan">{product.sales}</td>
                    <td className="py-3 px-4 text-white">{product.stock}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={
                          product.status === 'En stock' ? 'default' :
                          product.status === 'Stock faible' ? 'secondary' : 'destructive'
                        }
                        className={
                          product.status === 'En stock' ? 'bg-gaming-green' :
                          product.status === 'Stock faible' ? 'bg-yellow-600' : 'bg-red-600'
                        }
                      >
                        {product.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-gaming-purple/50 transition-all duration-200 cursor-pointer">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-gaming-purple" />
            <h3 className="text-white font-semibold mb-2">Nouvelle vente</h3>
            <p className="text-gray-400 text-sm">Enregistrer une nouvelle commande</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-gaming-cyan/50 transition-all duration-200 cursor-pointer">
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gaming-cyan" />
            <h3 className="text-white font-semibold mb-2">Gérer le stock</h3>
            <p className="text-gray-400 text-sm">Ajouter ou modifier des produits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-gaming-pink/50 transition-all duration-200 cursor-pointer">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gaming-pink" />
            <h3 className="text-white font-semibold mb-2">Rapports</h3>
            <p className="text-gray-400 text-sm">Voir les statistiques détaillées</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
