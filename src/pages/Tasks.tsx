
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: "basse" | "moyenne" | "haute" | "urgente";
  status: "en_attente" | "en_cours" | "terminee" | "validee";
  dueDate: string;
  createdDate: string;
  completedDate?: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "TSK001",
      title: "Inventaire section Gaming",
      description: "Vérifier et compter tous les périphériques gaming en stock",
      assignedTo: "Pierre Leblanc",
      assignedBy: "Marie Martin",
      priority: "haute",
      status: "en_cours",
      dueDate: "2024-01-20",
      createdDate: "2024-01-15"
    },
    {
      id: "TSK002",
      title: "Livraison CMD001",
      description: "Livrer la commande PC Gamer chez M. Dupont",
      assignedTo: "Pierre Leblanc",
      assignedBy: "Admin",
      priority: "urgente",
      status: "terminee",
      dueDate: "2024-01-16",
      createdDate: "2024-01-15",
      completedDate: "2024-01-16"
    },
    {
      id: "TSK003",
      title: "Formation nouveau système",
      description: "Former l'équipe sur le nouveau système de gestion",
      assignedTo: "Marie Martin",
      assignedBy: "Admin",
      priority: "moyenne",
      status: "en_attente",
      dueDate: "2024-01-25",
      createdDate: "2024-01-14"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "moyenne" as Task["priority"],
    dueDate: ""
  });

  const teamMembers = [
    "Jean Dupont",
    "Marie Martin", 
    "Pierre Leblanc"
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "basse": return "bg-gray-500";
      case "moyenne": return "bg-blue-500";
      case "haute": return "bg-orange-500";
      case "urgente": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_attente": return "bg-yellow-500";
      case "en_cours": return "bg-blue-500";
      case "terminee": return "bg-orange-500";
      case "validee": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "basse": return "Basse";
      case "moyenne": return "Moyenne";
      case "haute": return "Haute";
      case "urgente": return "Urgente";
      default: return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "en_attente": return "En attente";
      case "en_cours": return "En cours";
      case "terminee": return "Terminée";
      case "validee": return "Validée";
      default: return status;
    }
  };

  const addTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      return;
    }

    const task: Task = {
      id: `TSK${String(tasks.length + 1).padStart(3, '0')}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: "Admin",
      priority: newTask.priority,
      status: "en_attente",
      dueDate: newTask.dueDate,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
      priority: "moyenne",
      dueDate: ""
    });
    setIsAddDialogOpen(false);
  };

  const updateTask = () => {
    if (!editingTask) return;

    setTasks(tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    ));
    setEditingTask(null);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedDate: newStatus === "terminee" ? new Date().toISOString().split('T')[0] : task.completedDate
          }
        : task
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_attente": return <Clock className="w-4 h-4" />;
      case "en_cours": return <AlertCircle className="w-4 h-4" />;
      case "terminee": case "validee": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-gaming-cyan" />
            Gestion des Tâches
          </h1>
          <p className="text-gray-400 mt-2">Assignez et suivez les tâches de votre équipe</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="tech-gradient border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Nouvelle Tâche</DialogTitle>
              <DialogDescription className="text-gray-400">
                Créer et assigner une nouvelle tâche à un membre de l'équipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Titre de la tâche</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Titre de la tâche"
                />
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Description détaillée de la tâche..."
                />
              </div>
              <div>
                <Label className="text-gray-300">Assigner à</Label>
                <Select 
                  value={newTask.assignedTo} 
                  onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Priorité</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value: Task["priority"]) => setNewTask({...newTask, priority: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Date limite</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={addTask}
                  className="gaming-gradient text-white flex-1"
                >
                  Créer la tâche
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tasks.filter(t => t.status === "en_attente").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tasks.filter(t => t.status === "en_cours").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Terminées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tasks.filter(t => t.status === "terminee").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Validées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tasks.filter(t => t.status === "validee").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card className="tech-gradient border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Liste des Tâches</CardTitle>
          <CardDescription className="text-gray-400">
            Suivez et gérez toutes les tâches assignées à votre équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Titre</TableHead>
                <TableHead className="text-gray-300">Assigné à</TableHead>
                <TableHead className="text-gray-300">Priorité</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Date limite</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{task.id}</TableCell>
                  <TableCell className="text-gray-300">{task.title}</TableCell>
                  <TableCell className="text-gray-300">{task.assignedTo}</TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                      {getPriorityText(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(task.status)} text-white flex items-center gap-1`}>
                        {getStatusIcon(task.status)}
                        {getStatusText(task.status)}
                      </Badge>
                      <Select 
                        value={task.status} 
                        onValueChange={(value: Task["status"]) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="en_cours">En cours</SelectItem>
                          <SelectItem value="terminee">Terminée</SelectItem>
                          <SelectItem value="validee">Validée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{task.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="tech-gradient border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Modifier la tâche</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Modifier les détails de la tâche
                            </DialogDescription>
                          </DialogHeader>
                          {editingTask && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-gray-300">Titre</Label>
                                <Input
                                  value={editingTask.title}
                                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Description</Label>
                                <Textarea
                                  value={editingTask.description}
                                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Assigné à</Label>
                                <Select 
                                  value={editingTask.assignedTo} 
                                  onValueChange={(value) => setEditingTask({...editingTask, assignedTo: value})}
                                >
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teamMembers.map(member => (
                                      <SelectItem key={member} value={member}>{member}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-gray-300">Priorité</Label>
                                <Select 
                                  value={editingTask.priority} 
                                  onValueChange={(value: Task["priority"]) => setEditingTask({...editingTask, priority: value})}
                                >
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="basse">Basse</SelectItem>
                                    <SelectItem value="moyenne">Moyenne</SelectItem>
                                    <SelectItem value="haute">Haute</SelectItem>
                                    <SelectItem value="urgente">Urgente</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-gray-300">Date limite</Label>
                                <Input
                                  type="date"
                                  value={editingTask.dueDate}
                                  onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={updateTask}
                                  className="gaming-gradient text-white flex-1"
                                >
                                  Sauvegarder
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingTask(null)}
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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

export default Tasks;
