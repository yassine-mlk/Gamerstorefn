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
  productType: string;
  productName: string;
  productCode?: string;
  productEtat?: string; // État du produit (Neuf, Comme neuf, Occasion)
  trigger: React.ReactNode;
  onAssignmentCreated?: () => void;
}

export function AssignProductDialog({
  productId,
  productType,
  productName,
  productCode,
  productEtat,
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

  // Pour les assignations multiples
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [dueDateTime, setDueDateTime] = useState<string>("");

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
    if (!assignment.task_title || selectedMembers.length === 0) {
      return;
    }

    // Créer une assignation pour chaque membre sélectionné
    const assignments = selectedMembers.map(memberId => {
      const member = teamMembers.find(m => m.id === memberId);
      return {
        product_id: productId,
        product_type: productType,
        product_name: productName,
        product_code: productCode,
        product_etat: productEtat, // Inclure l'état du produit
        assigned_to_id: memberId,
        assigned_to_name: member?.name || member?.email || "",
        task_title: assignment.task_title,
        task_description: assignment.task_description,
        task_notes: assignment.task_notes,
        priority: assignment.priority as any,
        due_date: dueDateTime || undefined
      };
    });

    try {
      // Créer toutes les assignations
      const results = await Promise.all(
        assignments.map(assignment => createAssignment(assignment))
      );

      if (results.every(result => result)) {
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
        setSelectedMembers([]);
        setDueDateTime("");
        onAssignmentCreated?.();
      }
    } catch (error) {
      console.error('Erreur lors de la création des assignations:', error);
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

          {/* Assigner à (sélection multiple) */}
          <div>
            <Label>Assigner à *</Label>
            <div className="mt-1 space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers(prev => [...prev, member.id]);
                      } else {
                        setSelectedMembers(prev => prev.filter(id => id !== member.id));
                      }
                    }}
                    className="rounded border-gray-300 text-gaming-cyan focus:ring-gaming-cyan"
                  />
                  <label htmlFor={`member-${member.id}`} className="flex items-center gap-2 cursor-pointer">
                    <div>
                      <p className="font-medium">{member.name || member.email}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </label>
                </div>
              ))}
              {selectedMembers.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    {selectedMembers.length} membre(s) sélectionné(s)
                  </p>
                </div>
              )}
            </div>
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

          {/* Date et heure d'échéance */}
          <div>
            <Label>Date et heure d'échéance (optionnelle)</Label>
            <Input
              type="datetime-local"
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              className="mt-1"
              placeholder="Sélectionner date et heure"
            />
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
              disabled={!assignment.task_title || selectedMembers.length === 0}
            >
              <Package className="w-4 h-4 mr-2" />
              Créer les assignations ({selectedMembers.length})
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