
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Package, Clock, TrendingUp, Star, Target } from "lucide-react";

const MemberDashboard = () => {
  // Données simulées pour le membre
  const memberStats = {
    tasksCompleted: 23,
    tasksInProgress: 5,
    productsAssigned: 45,
    performanceScore: 87,
    monthlyTarget: 30,
    completionRate: 76
  };

  const recentTasks = [
    { id: 1, title: "Vérifier stock Gaming Chairs", status: "Terminé", priority: "Haute" },
    { id: 2, title: "Mise à jour prix écrans", status: "En cours", priority: "Moyenne" },
    { id: 3, title: "Inventaire périphériques", status: "En attente", priority: "Basse" },
  ];

  const assignedProducts = [
    { name: "Gaming Chairs", count: 12, category: "Mobilier" },
    { name: "Claviers Gaming", count: 15, category: "Périphériques" },
    { name: "Écrans 4K", count: 8, category: "Moniteurs" },
    { name: "Souris Gaming", count: 10, category: "Périphériques" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Mon Espace de Travail</h2>
          <p className="text-gray-400 mt-1">Gérez vos tâches et produits assignés</p>
        </div>
        <Badge variant="outline" className="border-gaming-purple text-gaming-purple bg-gaming-purple/10">
          Membre de l'équipe
        </Badge>
      </div>

      {/* Statistiques personnelles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tâches Terminées</CardTitle>
            <CheckSquare className="h-4 w-4 text-gaming-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{memberStats.tasksCompleted}</div>
            <p className="text-xs text-gray-400">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tâches En Cours</CardTitle>
            <Clock className="h-4 w-4 text-gaming-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{memberStats.tasksInProgress}</div>
            <p className="text-xs text-gray-400">À terminer</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Produits Assignés</CardTitle>
            <Package className="h-4 w-4 text-gaming-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{memberStats.productsAssigned}</div>
            <p className="text-xs text-gray-400">Sous votre responsabilité</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Performance</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{memberStats.performanceScore}%</div>
            <p className="text-xs text-gray-400">Score mensuel</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Progression mensuelle */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-gaming-cyan" />
              Progression Mensuelle
            </CardTitle>
            <CardDescription className="text-gray-400">
              Objectif: {memberStats.monthlyTarget} tâches ce mois
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Tâches terminées</span>
                <span className="text-white">{memberStats.tasksCompleted}/{memberStats.monthlyTarget}</span>
              </div>
              <Progress 
                value={memberStats.completionRate} 
                className="h-2"
              />
            </div>
            <div className="text-xs text-gray-400">
              {memberStats.completionRate}% de l'objectif atteint
            </div>
          </CardContent>
        </Card>

        {/* Tâches récentes */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Tâches Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={task.status === "Terminé" ? "default" : task.status === "En cours" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {task.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          task.priority === "Haute" ? "border-red-500 text-red-400" :
                          task.priority === "Moyenne" ? "border-yellow-500 text-yellow-400" :
                          "border-green-500 text-green-400"
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produits assignés */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Mes Produits Assignés</CardTitle>
          <CardDescription className="text-gray-400">
            Catégories de produits sous votre responsabilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {assignedProducts.map((product, index) => (
              <div key={index} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-5 w-5 text-gaming-purple" />
                  <span className="text-lg font-bold text-white">{product.count}</span>
                </div>
                <h3 className="font-medium text-white">{product.name}</h3>
                <p className="text-xs text-gray-400">{product.category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberDashboard;
