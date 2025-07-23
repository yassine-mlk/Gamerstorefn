import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, PlayCircle, CheckCircle, AlertCircle, Calendar, Package, User, Target, TrendingUp, Eye, FileText, ExternalLink, Filter, Search, SortAsc, SortDesc } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useProductAssignments, type ProductAssignment } from "@/hooks/useProductAssignments";
import { supabase } from "@/lib/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyTasks = () => {
  const [userAssignments, setUserAssignments] = useState<ProductAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ProductAssignment | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("due_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { getStatusText, getPriorityText, getProductTypeText, updateAssignmentStatus } = useProductAssignments();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Charger les assignations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserAssignments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('product_assignments')
          .select('*')
          .eq('assigned_to_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserAssignments(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des assignations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAssignments();
  }, []);

  // Fonction pour commencer une tâche
  const startTask = async (taskId: string) => {
    const success = await updateAssignmentStatus(taskId, 'en_cours');
    if (success) {
      setUserAssignments(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'en_cours', started_date: new Date().toISOString() }
          : task
      ));
      toast({
        title: "Tâche démarrée",
        description: "La tâche a été marquée comme en cours",
      });
    }
  };

  // Fonction pour terminer une tâche
  const completeTask = async (taskId: string) => {
    const success = await updateAssignmentStatus(taskId, 'terminee');
    if (success) {
      setUserAssignments(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'terminee', completed_date: new Date().toISOString() }
          : task
      ));
      toast({
        title: "Tâche terminée",
        description: "La tâche a été marquée comme terminée",
      });
    }
  };

  // Fonction pour voir les détails d'une tâche
  const viewTaskDetails = (task: ProductAssignment) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  // Fonction pour naviguer vers les détails du produit
  const viewProductDetails = (task: ProductAssignment) => {
    const routeMap: Record<string, string> = {
      'pc_portable': `/pc-portable/${task.product_id}`,
      'pc_gamer': `/pc-gamer/${task.product_id}`,
      'moniteur': `/moniteur/${task.product_id}`,
      'chaise_gaming': `/chaise-gaming/${task.product_id}`,
      'peripherique': `/peripherique/${task.product_id}`,
      'composant_pc': `/composant-pc/${task.product_id}`,
    };

    const route = routeMap[task.product_type];
    if (route) {
      navigate(route);
    } else {
      toast({
        title: "Erreur",
        description: "Type de produit non reconnu",
        variant: "destructive",
      });
    }
  };

  // Fonctions utilitaires
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_attente': return <Clock className="w-4 h-4" />;
      case 'en_cours': return <PlayCircle className="w-4 h-4" />;
      case 'terminee': return <CheckCircle className="w-4 h-4" />;
      case 'validee': return <CheckSquare className="w-4 h-4" />;
      case 'annulee': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en_cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'terminee': return 'bg-green-100 text-green-800 border-green-200';
      case 'validee': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'annulee': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-500';
      case 'haute': return 'bg-orange-500';
      case 'moyenne': return 'bg-yellow-500';
      case 'basse': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'pc_portable': return <Package className="w-4 h-4" />;
      case 'pc_gamer': return <Target className="w-4 h-4" />;
      case 'moniteur': return <TrendingUp className="w-4 h-4" />;
      case 'chaise_gaming': return <User className="w-4 h-4" />;
      case 'peripherique': return <FileText className="w-4 h-4" />;
      case 'composant_pc': return <ExternalLink className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (task: ProductAssignment) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'terminee' && task.status !== 'validee';
  };

  // Filtrage et tri des tâches
  const filteredAndSortedTasks = userAssignments
    .filter(task => {
      const matchesSearch = task.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "due_date":
          comparison = new Date(a.due_date || '9999').getTime() - new Date(b.due_date || '9999').getTime();
          break;
        case "priority":
          const priorityOrder = { urgente: 4, haute: 3, moyenne: 2, basse: 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Grouper les tâches par statut
  const tasksByStatus = {
    en_attente: filteredAndSortedTasks.filter(task => task.status === 'en_attente'),
    en_cours: filteredAndSortedTasks.filter(task => task.status === 'en_cours'),
    terminee: filteredAndSortedTasks.filter(task => task.status === 'terminee'),
    validee: filteredAndSortedTasks.filter(task => task.status === 'validee'),
    annulee: filteredAndSortedTasks.filter(task => task.status === 'annulee')
  };

  // Calculer les statistiques
  const stats = {
    total: userAssignments.length,
    en_attente: tasksByStatus.en_attente.length,
    en_cours: tasksByStatus.en_cours.length,
    terminee: tasksByStatus.terminee.length,
    validee: tasksByStatus.validee.length,
    annulee: tasksByStatus.annulee.length,
    overdue: userAssignments.filter(isOverdue).length
  };

  const progressPercentage = stats.total > 0 ? ((stats.terminee + stats.validee) / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Tâches</h1>
            <p className="text-gray-600">Chargement en cours...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-cyan"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Tâches</h1>
            <p className="text-gray-600">Gérez vos assignations et suivez votre progression</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-cyan/20 rounded-lg">
                <Target className="w-6 h-6 text-gaming-cyan" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tâches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <PlayCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.en_cours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.terminee + stats.validee}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Retard</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card className="bg-card border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progression globale</h3>
            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{stats.terminee + stats.validee} terminées</span>
            <span>{stats.total - (stats.terminee + stats.validee)} restantes</span>
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
                  placeholder="Rechercher par titre ou produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="terminee">Terminée</SelectItem>
                <SelectItem value="validee">Validée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Date d'échéance</SelectItem>
                  <SelectItem value="priority">Priorité</SelectItem>
                  <SelectItem value="created_at">Date de création</SelectItem>
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

      {/* Onglets des tâches */}
      <Card className="bg-card border-gray-200">
        <CardContent className="p-6">
          <Tabs defaultValue="en_attente" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-100">
              <TabsTrigger value="en_attente" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>En attente</span>
                <Badge variant="outline" className="ml-1">{stats.en_attente}</Badge>
              </TabsTrigger>
              <TabsTrigger value="en_cours" className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                <span>En cours</span>
                <Badge variant="outline" className="ml-1">{stats.en_cours}</Badge>
              </TabsTrigger>
              <TabsTrigger value="terminee" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Terminées</span>
                <Badge variant="outline" className="ml-1">{stats.terminee}</Badge>
              </TabsTrigger>
              <TabsTrigger value="validee" className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span>Validées</span>
                <Badge variant="outline" className="ml-1">{stats.validee}</Badge>
              </TabsTrigger>
              <TabsTrigger value="annulee" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Annulées</span>
                <Badge variant="outline" className="ml-1">{stats.annulee}</Badge>
              </TabsTrigger>
            </TabsList>

            {Object.entries(tasksByStatus).map(([status, tasks]) => (
              <TabsContent key={status} value={status} className="mt-0">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
                    <p className="text-gray-600">Aucune tâche trouvée dans cette catégorie.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tasks.map((task) => (
                      <Card key={task.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                  {getProductTypeIcon(task.product_type)}
                                  <Badge variant="outline" className="text-xs">
                                    {getProductTypeText(task.product_type)}
                                  </Badge>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                  {getStatusIcon(task.status)}
                                  <span className="ml-1">{getStatusText(task.status)}</span>
                                </Badge>
                                {isOverdue(task) && (
                                  <Badge variant="destructive" className="text-xs">
                                    En retard
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.task_title}</h3>
                              <p className="text-gray-600 mb-3">{task.product_name}</p>
                              
                              {/* Afficher l'état du produit s'il est disponible */}
                              {task.product_etat && (
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    État: {task.product_etat}
                                  </Badge>
                                </div>
                              )}
                              
                              {task.task_description && (
                                <p className="text-sm text-gray-500 mb-3">{task.task_description}</p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Assignée le {formatDate(task.assigned_date)}</span>
                                </div>
                                {task.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Échéance: {formatDate(task.due_date)}</span>
                                  </div>
                                )}
                                {task.started_date && (
                                  <div className="flex items-center gap-1">
                                    <PlayCircle className="w-4 h-4" />
                                    <span>Démarrée le {formatDate(task.started_date)}</span>
                                  </div>
                                )}
                                {task.completed_date && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Terminée le {formatDate(task.completed_date)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewTaskDetails(task)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Détails
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewProductDetails(task)}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Produit
                              </Button>
                              
                              {task.status === 'en_attente' && (
                                <Button
                                  size="sm"
                                  onClick={() => startTask(task.id)}
                                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  Démarrer
                                </Button>
                              )}
                              
                              {task.status === 'en_cours' && (
                                <Button
                                  size="sm"
                                  onClick={() => completeTask(task.id)}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Terminer
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de détails de tâche */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la tâche</DialogTitle>
            <DialogDescription>
              Informations complètes sur cette assignation
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedTask.task_title}</h3>
                <p className="text-gray-600">{selectedTask.product_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Statut</label>
                  <Badge className={`mt-1 ${getStatusColor(selectedTask.status)}`}>
                    {getStatusText(selectedTask.status)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priorité</label>
                  <Badge className="mt-1" variant="outline">
                    {getPriorityText(selectedTask.priority)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type de produit</label>
                  <p className="text-sm text-gray-600 mt-1">{getProductTypeText(selectedTask.product_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Code produit</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.product_code || 'N/A'}</p>
                </div>
              </div>
              
              {/* Afficher l'état du produit s'il est disponible */}
              {selectedTask.product_etat && (
                <div>
                  <label className="text-sm font-medium text-gray-700">État du produit</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.product_etat}</p>
                </div>
              )}
              
              {selectedTask.task_description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.task_description}</p>
                </div>
              )}
              
              {selectedTask.task_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.task_notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date d'assignation</label>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(selectedTask.assigned_date)}</p>
                </div>
                {selectedTask.due_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date d'échéance</label>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(selectedTask.due_date)}</p>
                  </div>
                )}
                {selectedTask.started_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date de début</label>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(selectedTask.started_date)}</p>
                  </div>
                )}
                {selectedTask.completed_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date de fin</label>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(selectedTask.completed_date)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => viewProductDetails(selectedTask)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir le produit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTaskDetails(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTasks;
