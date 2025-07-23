import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Box, 
  Zap, 
  Fan, 
  Monitor,
  Settings,
  UserPlus,
  AlertCircle,
  Clock,
  CheckCircle,
  Package,
  Loader2,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePCGamer, PCGamerConfig, NewPCGamerConfig, ConfigComposant } from "@/hooks/usePCGamer";
import { useComposantsPC } from "@/hooks/useComposantsPC";
import { useProductAssignments, type NewProductAssignment } from "@/hooks/useProductAssignments";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'actif' | 'inactif';
}

interface MonteurPCGamerDialogProps {
  trigger?: React.ReactNode;
  onPCGamerCreated?: () => void;
}

// Catégories de composants
const categories = [
  { value: "cpu", label: "Processeur", icon: Cpu, required: true, max: 1 },
  { value: "gpu", label: "Carte graphique", icon: Monitor, required: false, max: 1 },
  { value: "ram", label: "Mémoire RAM", icon: MemoryStick, required: true, max: 4 },
  { value: "disc", label: "Stockage", icon: HardDrive, required: true, max: 10 },
  { value: "case", label: "Boîtier", icon: Box, required: true, max: 1 },
  { value: "mother_board", label: "Carte mère", icon: Cpu, required: true, max: 1 },
  { value: "power", label: "Alimentation", icon: Zap, required: true, max: 1 },
  { value: "cooling", label: "Refroidissement", icon: Fan, required: true, max: 1 }
];

const garanties = ["Sans garantie", "3 mois", "6 mois", "9 mois", "12 mois"];

export function MonteurPCGamerDialog({ trigger, onPCGamerCreated }: MonteurPCGamerDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'create' | 'assign'>('create');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedComposants, setSelectedComposants] = useState<Array<{
    type: string;
    composant_id: string;
    quantite: number;
  }>>([]);
  const [createdPCGamer, setCreatedPCGamer] = useState<PCGamerConfig | null>(null);
  
  const { addPCGamerConfig, calculateStockPossible } = usePCGamer();
  const { createAssignment } = useProductAssignments();
  const { toast } = useToast();
  
  const [composantsPC, setComposantsPC] = useState<any[]>([]);
  const [loadingComposants, setLoadingComposants] = useState(false);

  const [newConfig, setNewConfig] = useState<NewPCGamerConfig>({
    nom_config: "",
    description: "",
    prix_vente: 0,
    code_barre: "",
    image_url: "",
    notes: "",
    garantie: "6",
    statut: "Actif"
  });

  const [assignment, setAssignment] = useState<Partial<NewProductAssignment>>({
    task_title: "",
    task_description: "",
    task_notes: "",
    assigned_to_id: "",
    assigned_to_name: "",
    priority: "moyenne",
    due_date: ""
  });

  // Charger les composants PC
  useEffect(() => {
    const fetchComposantsPC = async () => {
      if (open && step === 'create') {
        setLoadingComposants(true);
        try {
          const { data, error } = await supabase
            .from('composants_pc')
            .select('*')
            .order('nom_produit');

          if (error) {
            console.warn('Erreur lors du chargement des composants PC:', error);
            setComposantsPC([]);
          } else {
            console.log('Composants PC chargés:', data);
            setComposantsPC(data || []);
          }
        } catch (error) {
          console.warn('Erreur lors du chargement des composants PC:', error);
          setComposantsPC([]);
        } finally {
          setLoadingComposants(false);
        }
      }
    };

    fetchComposantsPC();
  }, [open, step]);

  // Charger les membres de l'équipe
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoadingMembers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, status')
          .eq('status', 'actif')
          .in('role', ['designer', 'developper', 'vendeur', 'livreur']); // Membres qui peuvent recevoir des tâches

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (open && step === 'assign') {
      fetchTeamMembers();
    }
  }, [open, step]);

  const handleCreatePCGamer = async () => {
    if (!newConfig.nom_config || selectedComposants.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un composant",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que tous les composants sélectionnés ont un stock suffisant
    const composantsAvecStockInsuffisant = selectedComposants.filter(comp => {
      const composant = composantsPC.find(c => c.id === comp.composant_id);
      return !composant || composant.stock_actuel < comp.quantite;
    });

    if (composantsAvecStockInsuffisant.length > 0) {
      const nomsComposants = composantsAvecStockInsuffisant.map(comp => {
        const composant = composantsPC.find(c => c.id === comp.composant_id);
        return composant ? composant.nom_produit : 'Composant inconnu';
      });
      
      toast({
        title: "Stock insuffisant",
        description: `Les composants suivants n'ont pas assez de stock : ${nomsComposants.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const composants = selectedComposants.map(comp => ({
        type_composant: comp.type as any,
        composant_id: comp.composant_id,
        quantite: comp.quantite
      }));

      const result = await addPCGamerConfig(newConfig, composants);
      if (result) {
        setCreatedPCGamer(result);
        setStep('assign');
        toast({
          title: "PC Bureau créé",
          description: "Le PC bureau a été créé avec succès. Vous pouvez maintenant l'assigner.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le PC bureau",
        variant: "destructive",
      });
    }
  };

  const handleAssignPCGamer = async () => {
    if (!assignment.task_title || !assignment.assigned_to_id || !createdPCGamer) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAssignment: NewProductAssignment = {
        product_id: createdPCGamer.id,
        product_type: 'pc_gamer',
        product_name: createdPCGamer.nom_config,
        product_code: createdPCGamer.code_barre,
        assigned_to_id: assignment.assigned_to_id,
        assigned_to_name: assignment.assigned_to_name,
        task_title: assignment.task_title,
        task_description: assignment.task_description || "",
        task_notes: assignment.task_notes || "",
        priority: assignment.priority || "moyenne",
        due_date: assignment.due_date || ""
      };

      const result = await createAssignment(newAssignment);
      if (result) {
        toast({
          title: "Tâche assignée",
          description: "Le PC bureau a été assigné avec succès",
        });
        setOpen(false);
        resetForm();
        onPCGamerCreated?.();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le PC bureau",
        variant: "destructive",
      });
    }
  };

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

  const addComposant = (type: string) => {
    const existingCount = selectedComposants.filter(c => c.type === type).length;
    const category = categories.find(c => c.value === type);
    
    if (category && existingCount < category.max) {
      setSelectedComposants(prev => [...prev, {
        type,
        composant_id: "",
        quantite: 1
      }]);
    }
  };

  const updateComposant = (index: number, field: string, value: any) => {
    setSelectedComposants(prev => prev.map((comp, i) => {
      if (i === index) {
        if (field === 'quantite') {
          // Si on met à jour la quantité, vérifier le stock disponible
          const composant = composantsPC.find(c => c.id === comp.composant_id);
          if (composant) {
            const quantiteMax = composant.stock_actuel;
            const nouvelleQuantite = Math.min(parseInt(value) || 1, quantiteMax);
            return { ...comp, [field]: nouvelleQuantite };
          }
        }
        return { ...comp, [field]: value };
      }
      return comp;
    }));
  };

  const removeComposant = (index: number) => {
    setSelectedComposants(prev => prev.filter((_, i) => i !== index));
  };

  const getComposantsByType = (type: string) => {
    console.log('Filtrage par type:', type, 'Composants disponibles:', composantsPC);
    // Filtrer les composants par type et qui ont un stock suffisant (au moins 1)
    return composantsPC.filter(c => c.categorie === type && c.stock_actuel > 0);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : Package;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgente": return <AlertCircle className="w-4 h-4" />;
      case "haute": return <Clock className="w-4 h-4" />;
      case "moyenne": return <CheckCircle className="w-4 h-4" />;
      case "basse": return <Package className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente": return "bg-red-100 text-red-800 border-red-200";
      case "haute": return "bg-orange-100 text-orange-800 border-orange-200";
      case "moyenne": return "bg-blue-100 text-blue-800 border-blue-200";
      case "basse": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const resetForm = () => {
    setNewConfig({
      nom_config: "",
      description: "",
      prix_vente: 0,
      code_barre: "",
      image_url: "",
      notes: "",
      garantie: "6",
      statut: "Actif"
    });
    setSelectedComposants([]);
    setAssignment({
      task_title: "",
      task_description: "",
      task_notes: "",
      assigned_to_id: "",
      assigned_to_name: "",
      priority: "moyenne",
      due_date: ""
    });
    setCreatedPCGamer(null);
    setStep('create');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Créer PC Bureau
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {step === 'create' ? 'Créer un PC Bureau' : 'Assigner le PC Bureau'}
          </DialogTitle>
          <DialogDescription>
            {step === 'create' 
              ? 'Créez une nouvelle configuration PC bureau avec ses composants'
              : 'Assignez ce PC bureau à un membre de l\'équipe'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'create' ? (
          <div className="space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom_config">Nom de la configuration *</Label>
                    <Input
                      id="nom_config"
                      value={newConfig.nom_config}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, nom_config: e.target.value }))}
                      placeholder="Ex: PC Gaming RTX 4070"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code_barre">Code-barres</Label>
                    <Input
                      id="code_barre"
                      value={newConfig.code_barre}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, code_barre: e.target.value }))}
                      placeholder="Code-barres unique"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prix_vente">Prix de vente (MAD) *</Label>
                    <Input
                      id="prix_vente"
                      type="number"
                      value={newConfig.prix_vente}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, prix_vente: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="garantie">Garantie</Label>
                    <Select value={newConfig.garantie} onValueChange={(value) => setNewConfig(prev => ({ ...prev, garantie: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {garanties.map((garantie) => (
                          <SelectItem key={garantie} value={garantie === "Sans garantie" ? "0" : garantie.split(" ")[0]}>
                            {garantie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée de la configuration"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Composants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Composants
                  {loadingComposants && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Boutons d'ajout de composants */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    const existingCount = selectedComposants.filter(c => c.type === category.value).length;
                    const availableComposants = getComposantsByType(category.value);
                    const canAdd = existingCount < category.max && availableComposants.length > 0;
                    
                    return (
                      <Button
                        key={category.value}
                        variant="outline"
                        size="sm"
                        onClick={() => addComposant(category.value)}
                        disabled={!canAdd}
                        className="flex flex-col items-center gap-1 h-auto p-3"
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs">{category.label}</span>
                        <div className="flex gap-1">
                          {existingCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {existingCount}/{category.max}
                            </Badge>
                          )}
                          <Badge 
                            variant={availableComposants.length > 0 ? "outline" : "destructive"} 
                            className="text-xs"
                          >
                            {availableComposants.length > 0 ? `${availableComposants.length} dispo` : 'Rupture'}
                          </Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Message si aucun composant disponible */}
                {!loadingComposants && composantsPC.length === 0 && (
                  <div className="text-center py-8">
                    <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun composant disponible</h4>
                    <p className="text-gray-600 mb-4">Vous devez d'abord créer des composants PC avec du stock avant de pouvoir créer une configuration.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Créer des composants
                    </Button>
                  </div>
                )}

                {/* Message si composants existent mais pas de stock */}
                {!loadingComposants && composantsPC.length > 0 && (() => {
                  const composantsAvecStock = composantsPC.filter(c => c.stock_actuel > 0);
                  if (composantsAvecStock.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Stock insuffisant</h4>
                        <p className="text-gray-600 mb-4">Tous les composants PC sont en rupture de stock. Veuillez ajouter du stock avant de créer une configuration.</p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Liste des composants sélectionnés */}
                {selectedComposants.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Composants sélectionnés</h4>
                    {selectedComposants.map((composant, index) => {
                      const IconComponent = getCategoryIcon(composant.type);
                      const composantsDisponibles = getComposantsByType(composant.type);
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <IconComponent className="w-5 h-5 text-gaming-cyan" />
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Select
                              value={composant.composant_id}
                              onValueChange={(value) => updateComposant(index, 'composant_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Sélectionner ${getCategoryLabel(composant.type)}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {composantsDisponibles.length === 0 ? (
                                  <SelectItem value="no-composants" disabled>
                                    Aucun composant disponible pour cette catégorie
                                  </SelectItem>
                                ) : (
                                  composantsDisponibles.map((comp) => (
                                    <SelectItem key={comp.id} value={comp.id}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{comp.nom_produit}</span>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span>{comp.prix_vente} MAD</span>
                                          <Badge variant="outline" className="text-xs">
                                            Stock: {comp.stock_actuel}
                                          </Badge>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <div className="space-y-1">
                              <Input
                                type="number"
                                value={composant.quantite}
                                onChange={(e) => updateComposant(index, 'quantite', parseInt(e.target.value) || 1)}
                                placeholder="Quantité"
                                min="1"
                                max={(() => {
                                  const comp = composantsPC.find(c => c.id === composant.composant_id);
                                  return comp ? comp.stock_actuel : 1;
                                })()}
                              />
                              {composant.composant_id && (() => {
                                const comp = composantsPC.find(c => c.id === composant.composant_id);
                                if (comp) {
                                  const stockRestant = comp.stock_actuel - composant.quantite;
                                  return (
                                    <div className="text-xs text-gray-500">
                                      Stock restant: {stockRestant}
                                      {stockRestant < 0 && (
                                        <span className="text-red-500 ml-1">(Insuffisant!)</span>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComposant(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreatePCGamer} disabled={!newConfig.nom_config || selectedComposants.length === 0}>
                Créer PC Bureau
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Résumé du PC Bureau créé */}
            {createdPCGamer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    PC Bureau créé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom</Label>
                      <p className="font-medium">{createdPCGamer.nom_config}</p>
                    </div>
                    <div>
                      <Label>Prix de vente</Label>
                      <p className="font-medium">{createdPCGamer.prix_vente} MAD</p>
                    </div>
                    <div>
                      <Label>Code-barres</Label>
                      <p className="font-medium">{createdPCGamer.code_barre || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Composants</Label>
                      <p className="font-medium">{selectedComposants.length} composants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulaire d'assignation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Assigner à un membre
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task_title">Titre de la tâche *</Label>
                    <Input
                      id="task_title"
                      value={assignment.task_title}
                      onChange={(e) => setAssignment(prev => ({ ...prev, task_title: e.target.value }))}
                      placeholder="Ex: Configuration et test du PC bureau"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assigned_to">Assigner à *</Label>
                    <Select value={assignment.assigned_to_id} onValueChange={handleMemberSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un membre" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingMembers ? (
                          <SelectItem value="loading" disabled>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Chargement...
                          </SelectItem>
                        ) : (
                          teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <span>{member.name || member.email}</span>
                                <Badge variant="outline" className="text-xs">
                                  {member.role}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Select value={assignment.priority} onValueChange={(value) => setAssignment(prev => ({ ...prev, priority: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basse">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon("basse")}
                            <span>Basse</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="moyenne">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon("moyenne")}
                            <span>Moyenne</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="haute">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon("haute")}
                            <span>Haute</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="urgente">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon("urgente")}
                            <span>Urgente</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="due_date">Date d'échéance</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={assignment.due_date}
                      onChange={(e) => setAssignment(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="task_description">Description de la tâche</Label>
                  <Textarea
                    id="task_description"
                    value={assignment.task_description}
                    onChange={(e) => setAssignment(prev => ({ ...prev, task_description: e.target.value }))}
                    placeholder="Description détaillée de la tâche à effectuer"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="task_notes">Notes</Label>
                  <Textarea
                    id="task_notes"
                    value={assignment.task_notes}
                    onChange={(e) => setAssignment(prev => ({ ...prev, task_notes: e.target.value }))}
                    placeholder="Notes supplémentaires"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep('create')}>
                Retour
              </Button>
              <Button onClick={handleAssignPCGamer} disabled={!assignment.task_title || !assignment.assigned_to_id}>
                Assigner la tâche
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 