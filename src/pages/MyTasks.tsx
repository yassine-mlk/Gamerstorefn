
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckSquare, Search, Clock, PlayCircle, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const MyTasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Données simulées des tâches assignées au membre
  const assignedTasks = [
    {
      id: "T001",
      title: "Vérifier stock Gaming Chairs",
      description: "Contrôler l'inventaire physique des chaises gaming et mettre à jour le système",
      assignedBy: "Manager A",
      priority: "Haute",
      status: "Terminé",
      dueDate: "2024-01-15",
      completedDate: "2024-01-14",
      estimatedTime: 2,
      actualTime: 1.5,
      category: "Inventaire"
    },
    {
      id: "T002",
      title: "Mise à jour prix écrans",
      description: "Actualiser les prix des écrans selon la nouvelle liste fournisseur",
      assignedBy: "Manager B",
      priority: "Moyenne",
      status: "En cours",
      dueDate: "2024-01-20",
      completedDate: null,
      estimatedTime: 3,
      actualTime: 1,
      category: "Prix"
    },
    {
      id: "T003",
      title: "Formation nouveaux claviers",
      description: "Étudier les spécifications des nouveaux modèles de claviers mécaniques",
      assignedBy: "Manager A",
      priority: "Basse",
      status: "En attente",
      dueDate: "2024-01-25",
      completedDate: null,
      estimatedTime: 4,
      actualTime: 0,
      category: "Formation"
    },
    {
      id: "T004",
      title: "Réorganiser zone périphériques",
      description: "Optimiser l'agencement de la zone périphériques gaming",
      assignedBy: "Manager C",
      priority: "Haute",
      status: "En retard",
      dueDate: "2024-01-12",
      completedDate: null,
      estimatedTime: 6,
      actualTime: 2,
      category: "Organisation"
    },
    {
      id: "T005",
      title: "Test nouveaux produits",
      description: "Tester et évaluer les nouveaux produits gaming arrivés cette semaine",
      assignedBy: "Manager B",
      priority: "Moyenne",
      status: "En cours",
      dueDate: "2024-01-18",
      completedDate: null,
      estimatedTime: 5,
      actualTime: 2.5,
      category: "Test"
    },
  ];

  const filteredTasks = assignedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Terminé": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "En cours": return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "En attente": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "En retard": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "En cours": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "En attente": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "En retard": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "Moyenne": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "Basse": return "bg-green-500/20 text-green-400 border-green-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const totalTasks = assignedTasks.length;
  const completedTasks = assignedTasks.filter(t => t.status === "Terminé").length;
  const inProgressTasks = assignedTasks.filter(t => t.status === "En cours").length;
  const overdueTasks = assignedTasks.filter(t => t.status === "En retard").length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Mes Tâches</h2>
          <p className="text-gray-400 mt-1">Gérez vos tâches assignées et suivez votre progression</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Tâches</CardTitle>
            <CheckSquare className="h-4 w-4 text-gaming-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalTasks}</div>
            <p className="text-xs text-gray-400">Assignées à vous</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedTasks}</div>
            <p className="text-xs text-gray-400">Taux: {completionRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">En Cours</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inProgressTasks}</div>
            <p className="text-xs text-gray-400">En progression</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">En Retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overdueTasks}</div>
            <p className="text-xs text-gray-400">Action urgente</p>
          </CardContent>
        </Card>
      </div>

      {/* Progression */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Progression Globale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Tâches terminées</span>
              <span className="text-white">{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-gray-400">{completionRate}% de progression</p>
          </div>
        </CardContent>
      </Card>

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
                  placeholder="Rechercher par titre, description ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
                <SelectItem value="En retard">En retard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="Haute">Haute</SelectItem>
                <SelectItem value="Moyenne">Moyenne</SelectItem>
                <SelectItem value="Basse">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tâches */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Liste de Mes Tâches</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredTasks.length} tâche(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Tâche</TableHead>
                <TableHead className="text-gray-300">Assigné par</TableHead>
                <TableHead className="text-gray-300">Priorité</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Échéance</TableHead>
                <TableHead className="text-gray-300">Temps</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="border-gray-700 hover:bg-gray-700/30">
                  <TableCell className="text-white font-medium">{task.id}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-white font-medium">{task.title}</div>
                      <div className="text-gray-400 text-sm truncate">{task.description}</div>
                      <Badge variant="outline" className="mt-1 text-xs border-gaming-cyan text-gaming-cyan">
                        {task.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{task.assignedBy}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {task.dueDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="text-sm">
                      <div>{task.actualTime}h / {task.estimatedTime}h</div>
                      <Progress 
                        value={(task.actualTime / task.estimatedTime) * 100} 
                        className="h-1 mt-1"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {task.status === "En attente" && (
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-white">
                          Commencer
                        </Button>
                      )}
                      {task.status === "En cours" && (
                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-white">
                          Terminer
                        </Button>
                      )}
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

export default MyTasks;
