import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserPlus, AlertCircle, Clock, CheckCircle, Package } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProductAssignments, type NewProductAssignment } from "@/hooks/useProductAssignments";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'actif' | 'inactif';
}

interface AssignProductDialogProps {
  productId: string;
  productType: 'pc_portable' | 'pc_gamer' | 'moniteur' | 'chaise_gaming' | 'peripherique' | 'composant_pc';
  productName: string;
  productCode?: string;
  trigger?: React.ReactNode;
  onAssignmentCreated?: () => void;
}

export function AssignProductDialog({
  productId,
  productType,
  productName,
  productCode,
  trigger,
  onAssignmentCreated
}: AssignProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [date, setDate] = useState<Date>();
  
  const { createAssignment } = useProductAssignments();

  const [assignment, setAssignment] = useState<Partial<NewProductAssignment>>({
    task_title: "",
    task_description: "",
    task_notes: "",
    assigned_to_id: "",
    assigned_to_name: "",
    priority: "moyenne",
    due_date: ""
  });

  // Charger les membres de l'équipe
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoadingMembers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, status')
          .eq('status', 'actif')
          .neq('role', 'admin'); // Exclure les admins si nécessaire

        if (error) throw error;
        
        setTeamMembers(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const handleMemberSelect = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setAssignment(prev => ({
        ...prev,
        assigned_to_id: memberId,
        assigned_to_name: member.name || member.email
      }));
    }
  };

  const handleSubmit = async () => {
    if (!assignment.task_title || !assignment.assigned_to_id) {
      return;
    }

    const newAssignment: NewProductAssignment = {
      product_id: productId,
      product_type: productType,
      product_name: productName,
      product_code: productCode,
      assigned_to_id: assignment.assigned_to_id,
      assigned_to_name: assignment.assigned_to_name || "",
      task_title: assignment.task_title,
      task_description: assignment.task_description,
      task_notes: assignment.task_notes,
      priority: assignment.priority as any,
      due_date: date ? format(date, 'yyyy-MM-dd') : undefined
    };

    const result = await createAssignment(newAssignment);
    if (result) {
      setOpen(false);
      setAssignment({
        task_title: "",
        task_description: "",
        task_notes: "",
        assigned_to_id: "",
        assigned_to_name: "",
        priority: "moyenne",
        due_date: ""
      });
      setDate(undefined);
      onAssignmentCreated?.();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'basse': return <CheckCircle className="w-4 h-4" />;
      case 'moyenne': return <Clock className="w-4 h-4" />;
      case 'haute': return <AlertCircle className="w-4 h-4" />;
      case 'urgente': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'basse': return 'text-green-400';
      case 'moyenne': return 'text-blue-400';
      case 'haute': return 'text-orange-400';
      case 'urgente': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getProductTypeIcon = () => {
    switch (productType) {
      case 'pc_portable': return '💻';
      case 'pc_gamer': return '🖥️';
      case 'moniteur': return '📺';
      case 'chaise_gaming': return '🪑';
      case 'peripherique': return '🖱️';
      case 'composant_pc': return '🔧';
      default: return '📦';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gaming-gradient">
            <UserPlus className="w-4 h-4 mr-2" />
            Assigner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gaming-cyan" />
            Assigner le produit
          </DialogTitle>
          <DialogDescription>
            Créer une tâche liée à ce produit et l'assigner à un membre de l'équipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations du produit */}
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getProductTypeIcon()}</div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{productName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {productType.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {productCode && (
                    <Badge variant="outline" className="text-xs text-gray-400">
                      {productCode}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Titre de la tâche */}
          <div>
            <Label htmlFor="task_title">Titre de la tâche *</Label>
            <Input
              id="task_title"
              value={assignment.task_title}
              onChange={(e) => setAssignment(prev => ({ ...prev, task_title: e.target.value }))}
              placeholder="Ex: Vérifier le stock, Tester le produit..."
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="task_description">Description</Label>
            <Textarea
              id="task_description"
              value={assignment.task_description}
              onChange={(e) => setAssignment(prev => ({ ...prev, task_description: e.target.value }))}
              placeholder="Description détaillée de ce qui doit être fait..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Assigner à */}
          <div>
            <Label>Assigner à *</Label>
            <Select 
              value={assignment.assigned_to_id} 
              onValueChange={handleMemberSelect}
              disabled={loadingMembers}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={loadingMembers ? "Chargement..." : "Sélectionner un membre"} />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{member.name || member.email}</p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priorité */}
          <div>
            <Label>Priorité</Label>
            <Select 
              value={assignment.priority} 
              onValueChange={(value) => setAssignment(prev => ({ ...prev, priority: value as any }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basse">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Basse
                  </div>
                </SelectItem>
                <SelectItem value="moyenne">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Moyenne
                  </div>
                </SelectItem>
                <SelectItem value="haute">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    Haute
                  </div>
                </SelectItem>
                <SelectItem value="urgente">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Urgente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date limite */}
          <div>
            <Label>Date limite (optionnelle)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="task_notes">Notes additionnelles</Label>
            <Textarea
              id="task_notes"
              value={assignment.task_notes}
              onChange={(e) => setAssignment(prev => ({ ...prev, task_notes: e.target.value }))}
              placeholder="Instructions spéciales, remarques..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit}
              className="gaming-gradient flex-1"
              disabled={!assignment.task_title || !assignment.assigned_to_id}
            >
              <Package className="w-4 h-4 mr-2" />
              Créer l'assignation
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 