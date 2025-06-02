import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ClipboardList, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, Package, UserPlus, User, Building2 } from "lucide-react";
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
import { useProductAssignments } from "@/hooks/useProductAssignments";

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedProductType, setSelectedProductType] = useState("all");

  const { 
    assignments, 
    loading, 
    updateAssignmentStatus, 
    deleteAssignment,
    getStatusText,
    getPriorityText,
    getProductTypeText,
    getAssignmentStats
  } = useProductAssignments();

  // Filtrer les assignations
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.task_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || assignment.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || assignment.priority === selectedPriority;
    const matchesProductType = selectedProductType === "all" || assignment.product_type === selectedProductType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProductType;
  });

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
      case "annulee": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_attente": return <Clock className="w-4 h-4" />;
      case "en_cours": return <AlertCircle className="w-4 h-4" />;
      case "terminee": case "validee": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    await updateAssignmentStatus(assignmentId, newStatus as any);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette assignation ?")) {
      await deleteAssignment(assignmentId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const stats = getAssignmentStats();

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-cyan"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-gaming-cyan" />
              Gestion des Assignations
            </h1>
            <p className="text-gray-400 mt-2">Assignez des produits aux membres et suivez les tâches</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gaming-cyan text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.en_attente}</div>
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
            <div className="text-2xl font-bold text-white">{stats.en_cours}</div>
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
            <div className="text-2xl font-bold text-white">{stats.terminee}</div>
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
            <div className="text-2xl font-bold text-white">{stats.validee}</div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              En retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.en_retard}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="tech-gradient border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
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

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedProductType} onValueChange={setSelectedProductType}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Type de produit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="pc_portable">PC Portable</SelectItem>
                <SelectItem value="pc_gamer">PC Gamer</SelectItem>
                <SelectItem value="moniteur">Moniteur</SelectItem>
                <SelectItem value="chaise_gaming">Chaise Gaming</SelectItem>
                <SelectItem value="peripherique">Périphérique</SelectItem>
                <SelectItem value="composant_pc">Composant PC</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-400 flex items-center">
              {filteredAssignments.length} assignation(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Assignations */}
      <Card className="tech-gradient border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Assignations de Produits</CardTitle>
          <CardDescription className="text-gray-400">
            Suivez et gérez toutes les assignations de produits à votre équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Aucune assignation trouvée</p>
              <p className="text-gray-500 text-sm">
                Utilisez les boutons "Assigner à l'équipe" dans les pages de produits pour créer des tâches
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Produit</TableHead>
                  <TableHead className="text-gray-300">Tâche</TableHead>
                  <TableHead className="text-gray-300">Assigné à</TableHead>
                  <TableHead className="text-gray-300">Priorité</TableHead>
                  <TableHead className="text-gray-300">Statut</TableHead>
                  <TableHead className="text-gray-300">Échéance</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id} className="border-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getProductTypeIcon(assignment.product_type)}</span>
                        <div>
                          <p className="text-white font-medium">{assignment.product_name}</p>
                          <p className="text-xs text-gray-400">{getProductTypeText(assignment.product_type)}</p>
                          {assignment.product_code && (
                            <p className="text-xs text-gray-500">{assignment.product_code}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{assignment.task_title}</p>
                        {assignment.task_description && (
                          <p className="text-sm text-gray-400 line-clamp-2">{assignment.task_description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{assignment.assigned_to_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(assignment.priority)} text-white`}>
                        {getPriorityText(assignment.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(assignment.status)} text-white flex items-center gap-1`}>
                          {getStatusIcon(assignment.status)}
                          {getStatusText(assignment.status)}
                        </Badge>
                        <Select 
                          value={assignment.status} 
                          onValueChange={(value) => handleStatusUpdate(assignment.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-600 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en_attente">En attente</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="terminee">Terminée</SelectItem>
                            <SelectItem value="validee">Validée</SelectItem>
                            <SelectItem value="annulee">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {assignment.due_date ? formatDate(assignment.due_date) : 'Aucune'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
