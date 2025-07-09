import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, PlayCircle, CheckCircle, AlertCircle, Calendar, Package, User, Target, TrendingUp, Eye, FileText, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useProductAssignments, type ProductAssignment } from "@/hooks/useProductAssignments";
import { supabase } from "@/lib/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const MyTasks = () => {
  const [userAssignments, setUserAssignments] = useState<ProductAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ProductAssignment | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "terminee": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "validee": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "en_cours": return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "en_attente": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "terminee": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "validee": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "en_cours": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "en_attente": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "haute": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "moyenne": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "basse": return "bg-green-500/20 text-green-400 border-green-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'pc_portable': return '💻';
      case 'pc_gamer': return '🖥️';
      case 'moniteur': return '📺';
      case 'chaise_gaming': return '🪑';
      case 'peripherique': return '🖱️';
      case 'composant_pc': return '🔧';
      default: return '📦';
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
    return task.due_date && new Date(task.due_date) < new Date() && !['terminee', 'validee'].includes(task.status);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-cyan"></div>
        </div>
      </div>
    );
  }

  // Calculs des statistiques
  const totalTasks = userAssignments.length;
  const completedTasks = userAssignments.filter(t => ['terminee', 'validee'].includes(t.status)).length;
  const inProgressTasks = userAssignments.filter(t => t.status === 'en_cours').length;
  const pendingTasks = userAssignments.filter(t => t.status === 'en_attente').length;
  const overdueTasks = userAssignments.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && !['terminee', 'validee'].includes(t.status)
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Statistiques par type de produit
  const tasksByProductType = userAssignments.reduce((acc, task) => {
    const type = task.product_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Statistiques par priorité
  const tasksByPriority = userAssignments.reduce((acc, task) => {
    const priority = task.priority;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tâches récemment assignées (dernières 7 jours)
  const recentTasks = userAssignments.filter(task => {
    const assignedDate = new Date(task.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return assignedDate >= weekAgo;
  }).length;

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Mes Tâches</h2>
            <p className="text-gray-400 mt-1">Gérez vos tâches assignées et suivez votre progression</p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
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
            <CardTitle className="text-sm font-medium text-gray-300">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingTasks}</div>
            <p className="text-xs text-gray-400">À démarrer</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">En cours</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inProgressTasks}</div>
            <p className="text-xs text-gray-400">En progression</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedTasks}</div>
            <p className="text-xs text-gray-400">Complétées</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">En retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overdueTasks}</div>
            <p className="text-xs text-gray-400">Échéance dépassée</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Nouvelles (7j)</CardTitle>
            <TrendingUp className="h-4 w-4 text-gaming-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{recentTasks}</div>
            <p className="text-xs text-gray-400">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Progression et répartition */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Taux de progression */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-gaming-cyan" />
              Progression Globale
            </CardTitle>
            <CardDescription className="text-gray-400">
              Pourcentage de tâches terminées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Taux de completion</span>
              <span className="text-2xl font-bold text-white">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-semibold">{completedTasks}</div>
                <div className="text-gray-400">Terminées</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">{inProgressTasks}</div>
                <div className="text-gray-400">En cours</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold">{pendingTasks}</div>
                <div className="text-gray-400">En attente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type de produit */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-gaming-purple" />
              Répartition par Produit
            </CardTitle>
            <CardDescription className="text-gray-400">
              Types de produits dans vos tâches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(tasksByProductType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getProductTypeIcon(type)}</span>
                    <span className="text-gray-300 text-sm">{getProductTypeText(type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{count}</span>
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gaming-cyan h-2 rounded-full" 
                        style={{ width: `${(count / totalTasks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des tâches */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-gaming-green" />
            Mes Tâches Actives
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gérez vos tâches assignées - Cliquez sur les boutons pour changer le statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userAssignments.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucune tâche assignée</p>
              <p className="text-gray-500 text-sm">Vous n'avez actuellement aucune tâche assignée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userAssignments.map((task) => (
                <div key={task.id} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-lg ${
                  isOverdue(task) ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-700/50 border-gray-600'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getProductTypeIcon(task.product_type)}</span>
                        <h3 className="text-white font-semibold text-lg">{task.task_title}</h3>
                        {isOverdue(task) && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                            En retard
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">Produit:</span>
                          <span className="text-white">{task.product_name}</span>
                        </div>
                        {task.task_description && (
                          <div className="flex items-start gap-4">
                            <span className="text-gray-400">Description:</span>
                            <span className="text-gray-300 flex-1">{task.task_description}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">Assigné le:</span>
                          <span className="text-gray-300">{formatDate(task.assigned_date)}</span>
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">Échéance:</span>
                            <span className={`${isOverdue(task) ? 'text-red-400' : 'text-gray-300'}`}>
                              {formatDate(task.due_date)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <Badge className={`${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                      </Badge>
                      
                      <Badge className={`${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{getStatusText(task.status)}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewTaskDetails(task)}
                        className="border-gray-600 text-gray-300 hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewProductDetails(task)}
                        className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-gray-900"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir le produit
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      {task.status === 'en_attente' && (
                        <Button
                          onClick={() => startTask(task.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Commencer
                        </Button>
                      )}
                      
                      {task.status === 'en_cours' && (
                        <Button
                          onClick={() => completeTask(task.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terminer
                        </Button>
                      )}
                      
                      {['terminee', 'validee'].includes(task.status) && (
                        <div className="flex items-center text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tâche complétée
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Répartition par priorité */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Répartition par Priorité
          </CardTitle>
          <CardDescription className="text-gray-400">
            Niveau de priorité de vos tâches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(tasksByPriority).map(([priority, count]) => (
              <div key={priority} className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(priority)}`}>
                  {getPriorityText(priority)}
                </div>
                <div className="text-2xl font-bold text-white mt-2">{count}</div>
                <div className="text-gray-400 text-sm">
                  {totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails de tâche */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Détails de la tâche
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Informations complètes sur cette tâche
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Titre de la tâche</label>
                  <p className="text-white mt-1">{selectedTask.task_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Produit concerné</label>
                  <p className="text-white mt-1 flex items-center gap-2">
                    <span>{getProductTypeIcon(selectedTask.product_type)}</span>
                    {selectedTask.product_name}
                  </p>
                </div>
              </div>

              {selectedTask.task_description && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Description</label>
                  <p className="text-gray-300 mt-1">{selectedTask.task_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Statut</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedTask.status)}`}>
                      {getStatusIcon(selectedTask.status)}
                      <span className="ml-1">{getStatusText(selectedTask.status)}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Priorité</label>
                  <div className="mt-1">
                    <Badge className={`${getPriorityColor(selectedTask.priority)}`}>
                      {getPriorityText(selectedTask.priority)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Assigné le</label>
                  <p className="text-white mt-1">{formatDate(selectedTask.assigned_date)}</p>
                </div>
                {selectedTask.due_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Échéance</label>
                    <p className={`mt-1 ${isOverdue(selectedTask) ? 'text-red-400' : 'text-white'}`}>
                      {formatDate(selectedTask.due_date)}
                    </p>
                  </div>
                )}
              </div>

              {selectedTask.started_date && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Démarrée le</label>
                  <p className="text-white mt-1">{formatDate(selectedTask.started_date)}</p>
                </div>
              )}

              {selectedTask.completed_date && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Terminée le</label>
                  <p className="text-white mt-1">{formatDate(selectedTask.completed_date)}</p>
                </div>
              )}

              {selectedTask.task_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Notes</label>
                  <p className="text-gray-300 mt-1">{selectedTask.task_notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-600">
                <Button
                  onClick={() => {
                    viewProductDetails(selectedTask);
                    setShowTaskDetails(false);
                  }}
                  className="bg-gaming-cyan text-gray-900 hover:bg-gaming-cyan/90"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir les détails du produit
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
