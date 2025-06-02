import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Camera,
  Loader2,
  Cpu,
  HardDrive,
  MemoryStick,
  Box,
  Zap,
  Fan,
  Settings,
  Package,
  Calculator,
  Eye,
  Minus,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePCGamer, PCGamerConfig, NewPCGamerConfig, ConfigComposant } from "@/hooks/usePCGamer";
import { useComposantsPC } from "@/hooks/useComposantsPC";
import { AssignProductDialog } from "@/components/AssignProductDialog";
import { uploadImageByType, uploadImageFromBase64ByType } from "@/lib/imageUpload";

// Catégories de composants avec leurs icônes et labels
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

export default function PCGamer() {
  const { pcGamerConfigs, loading, addPCGamerConfig, updatePCGamerConfig, deletePCGamerConfig, getConfigComposants, calculateStockPossible } = usePCGamer();
  const { composantsPC, loading: loadingComposants } = useComposantsPC();
  

  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PCGamerConfig | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedComposants, setSelectedComposants] = useState<ConfigComposant[]>([]);
  const [stockPossible, setStockPossible] = useState<number>(0);
  const [prixCoutant, setPrixCoutant] = useState<number>(0);
  const [showComposantsDetails, setShowComposantsDetails] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [newConfig, setNewConfig] = useState<NewPCGamerConfig>({
    nom_config: "",
    description: "",
    prix_vente: 0,
    code_barre: "",
    image_url: "",
    notes: "",
    garantie: "0",
    statut: "Actif"
  });

  const { toast } = useToast();

  // Filtrer les configurations
  const filteredConfigs = pcGamerConfigs.filter(config =>
    config.nom_config.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (config.code_barre && config.code_barre.includes(searchTerm))
  );

  // Calculer le prix coûtant et stock possible en temps réel
  useEffect(() => {
    const calculateStats = async () => {
      if (selectedComposants.length > 0) {
        let total = 0;
        for (const comp of selectedComposants) {
          const composant = composantsPC.find(c => c.id === comp.composant_id);
          if (composant) {
            total += composant.prix_achat * comp.quantite;
          }
        }
        setPrixCoutant(total);

        const stock = await calculateStockPossible(selectedComposants);
        setStockPossible(stock);
      } else {
        setPrixCoutant(0);
        setStockPossible(0);
      }
    };

    calculateStats();
  }, [selectedComposants, composantsPC, calculateStockPossible]);

  const handleAddConfig = async () => {
    if (!newConfig.nom_config || !newConfig.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom et le prix de vente",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que les composants obligatoires sont sélectionnés
    const composantsAvecID = selectedComposants.filter(c => c.composant_id !== "");
    if (composantsAvecID.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un composant",
        variant: "destructive",
      });
      return;
    }

    const result = await addPCGamerConfig({
      ...newConfig,
      code_barre: newConfig.code_barre || `PCG${Date.now()}`,
    }, composantsAvecID);

    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEditConfig = async () => {
    if (!editingConfig || !newConfig.nom_config || !newConfig.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const result = await updatePCGamerConfig(editingConfig.id, newConfig, selectedComposants);

    if (result) {
      resetForm();
      setEditingConfig(null);
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette configuration PC Gamer ?")) {
      await deletePCGamerConfig(id);
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
      garantie: "0",
      statut: "Actif"
    });
    
    // Initialiser avec les composants obligatoires
    const composantsObligatoires = categories
      .filter(cat => cat.required)
      .map(cat => ({
        composant_id: "",
        quantite: 1,
        type_composant: cat.value as any
      }));
    
    setSelectedComposants(composantsObligatoires);
    setImagePreview("");
    setPrixCoutant(0);
    setStockPossible(0);
    stopCamera();
  };

  const openEditDialog = async (config: PCGamerConfig) => {
    setEditingConfig(config);
    setNewConfig({
      nom_config: config.nom_config,
      description: config.description || "",
      prix_vente: config.prix_vente,
      code_barre: config.code_barre || "",
      image_url: config.image_url || "",
      notes: config.notes || "",
      garantie: config.garantie,
      statut: config.statut
    });
    setImagePreview(config.image_url || "");

    // Charger les composants de la configuration
    const composants = await getConfigComposants(config.id);
    const configComposants = composants.map(c => ({
      composant_id: c.composant_id,
      quantite: c.quantite,
      type_composant: c.type_composant
    }));
    setSelectedComposants(configComposants);
    setIsAddDialogOpen(true);
  };

  const addComposant = (type: string) => {
    const category = categories.find(c => c.value === type);
    const currentCount = selectedComposants.filter(c => c.type_composant === type).length;
    
    if (category && currentCount < category.max) {
      setSelectedComposants(prev => [...prev, {
        composant_id: "",
        quantite: 1, // Toujours 1 par défaut
        type_composant: type as any
      }]);
    }
  };

  const updateComposant = (index: number, field: string, value: any) => {
    setSelectedComposants(prev => prev.map((comp, i) => {
      if (i === index) {
        // Pour les composants uniques, empêcher de modifier la quantité
        if (field === 'quantite') {
          const category = categories.find(c => c.value === comp.type_composant);
          if (category && category.max === 1) {
            return comp; // Ne pas modifier la quantité pour les composants uniques
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
    // Filtrer par catégorie et statut disponible
    const filtered = composantsPC.filter(c => c.categorie === type && c.statut === 'Disponible');
    
    // Si aucun composant disponible, retourner tous les composants de cette catégorie
    if (filtered.length === 0) {
      return composantsPC.filter(c => c.categorie === type);
    }
    
    return filtered;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : Package;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getStatutColor = (stockPossible: number) => {
    if (stockPossible === 0) return 'bg-red-600';
    if (stockPossible <= 3) return 'bg-yellow-600';
    return 'bg-gaming-green';
  };

  const getStatutIcon = (stockPossible: number) => {
    if (stockPossible === 0) return <XCircle className="w-4 h-4" />;
    if (stockPossible <= 3) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  // Fonctions de gestion caméra/upload d'image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const result = await uploadImageByType(file, 'pc-gamer');
        if (result.success && result.url) {
          setImagePreview(result.url);
          setNewConfig({ ...newConfig, image_url: result.url });
          toast({
            title: "Image téléchargée",
            description: "L'image a été téléchargée avec succès",
          });
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Erreur lors du téléchargement",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors du téléchargement de l'image",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        setUploading(true);
        try {
          const result = await uploadImageFromBase64ByType(imageData, 'pc-gamer');
          if (result.success && result.url) {
            setImagePreview(result.url);
            setNewConfig({ ...newConfig, image_url: result.url });
            stopCamera();
            toast({
              title: "Photo capturée",
              description: "La photo a été capturée avec succès",
            });
          } else {
            toast({
              title: "Erreur",
              description: result.error || "Erreur lors de l'upload de la photo",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Erreur lors de l'upload de la photo",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const showConfigDetails = async (configId: string) => {
    setShowComposantsDetails(configId);
  };

  if (loading || loadingComposants) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gaming-cyan" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-gaming-cyan" />
              PC Gamer - Configurations
            </h1>
            <p className="text-gray-400">Créez des configurations PC complètes à partir des composants en stock</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingConfig(null);
            resetForm();
          } else if (!editingConfig) {
            // Initialiser automatiquement les composants obligatoires pour une nouvelle config
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? "Modifier la Configuration PC" : "Créer une nouvelle Configuration PC"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Assemblez une configuration PC complète à partir des composants en stock
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom_config">Nom de la configuration *</Label>
                  <Input
                    id="nom_config"
                    value={newConfig.nom_config}
                    onChange={(e) => setNewConfig({ ...newConfig, nom_config: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Ex: Gaming Pro RTX 4080"
                  />
                </div>
                <div>
                  <Label htmlFor="code_barre">Code-barres</Label>
                  <Input
                    id="code_barre"
                    value={newConfig.code_barre}
                    onChange={(e) => setNewConfig({ ...newConfig, code_barre: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Auto-généré si vide"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newConfig.description}
                  onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Configuration gaming haut de gamme..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="garantie">Garantie (mois) *</Label>
                  <Select value={newConfig.garantie} onValueChange={(value: any) => setNewConfig({ ...newConfig, garantie: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner la garantie" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {garanties.map((garantie) => (
                        <SelectItem key={garantie} value={garantie}>
                          {garantie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statut">Statut</Label>
                  <Select value={newConfig.statut} onValueChange={(value: any) => setNewConfig({ ...newConfig, statut: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                      <SelectItem value="Archivé">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sélection des composants */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Composants de la configuration</h3>
                  <div className="text-sm text-gray-400">
                    Configuration PC complète
                  </div>
                </div>

                {/* Composants par catégorie */}
                {loadingComposants ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gaming-cyan mx-auto mb-4" />
                    <p className="text-gray-400">Chargement des composants...</p>
                  </div>
                ) : composantsPC.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Aucun composant PC trouvé</p>
                    <p className="text-gray-500 text-sm">Ajoutez d'abord des composants dans la section "Composants PC"</p>
                  </div>
                ) : (
                <div className="space-y-6">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const availableComposants = getComposantsByType(category.value);
                    const categoryComposants = selectedComposants.filter(c => c.type_composant === category.value);
                    
                    return (
                      <Card key={category.value} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Icon className="w-6 h-6 text-gaming-cyan" />
                              <div>
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                  {category.label}
                                  {category.required && <span className="text-red-400 text-sm">*</span>}
                                </h4>
                                <p className="text-xs text-gray-400">
                                  {category.required ? 'Obligatoire' : 'Optionnel'} 
                                  {category.max > 1 && ` - Maximum ${category.max}`}
                                </p>
                              </div>
                            </div>
                            
                            {categoryComposants.length < category.max && (
                              <Button
                                onClick={() => addComposant(category.value)}
                                disabled={availableComposants.length === 0}
                                variant="outline"
                                size="sm"
                                className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan/20"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Ajouter
                              </Button>
                            )}
                          </div>

                          {/* Liste des composants de cette catégorie */}
                          <div className="space-y-3">
                            {categoryComposants.map((comp, index) => {
                              const globalIndex = selectedComposants.findIndex(c => c === comp);
                              const selectedComposant = composantsPC.find(c => c.id === comp.composant_id);
                              
                              return (
                                <div key={globalIndex} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                                  <div className="flex-1 grid grid-cols-4 gap-4">
                                    <div className="col-span-2">
                                      <Label className="text-xs text-gray-300">Composant</Label>
                                      <Select 
                                        value={comp.composant_id || ""} 
                                        onValueChange={(value) => updateComposant(globalIndex, 'composant_id', value)}
                                      >
                                        <SelectTrigger className="bg-gray-600 border-gray-500 h-8">
                                          <SelectValue placeholder="Choisir un composant" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600">
                                          {availableComposants.map((composant) => (
                                            <SelectItem key={composant.id} value={composant.id}>
                                              <div className="flex items-center justify-between w-full">
                                                <span className="truncate">{composant.nom_produit}</span>
                                                <span className="text-gaming-green ml-2 text-xs">
                                                  Stock: {composant.stock_actuel}
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-300">Quantité</Label>
                                      {category.max === 1 ? (
                                        <div className="bg-gray-600 rounded px-2 py-1 h-8 flex items-center text-gray-300 text-sm">
                                          1 (fixe)
                                        </div>
                                      ) : (
                                        <Input
                                          type="number"
                                          min="1"
                                          max={category.max}
                                          value={comp.quantite}
                                          onChange={(e) => updateComposant(globalIndex, 'quantite', parseInt(e.target.value) || 1)}
                                          className="bg-gray-600 border-gray-500 h-8"
                                        />
                                      )}
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-300">Sous-total</Label>
                                      <div className="text-gaming-green font-semibold text-sm bg-gray-600 rounded px-2 py-1 h-8 flex items-center">
                                        {selectedComposant ? `${(selectedComposant.prix_achat * comp.quantite).toFixed(2)} MAD` : '0 MAD'}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeComposant(globalIndex)}
                                    className="text-red-400 hover:bg-red-400/20 h-8 w-8 p-0 flex-shrink-0"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })}
                            
                            {/* Message si aucun composant dans cette catégorie */}
                            {categoryComposants.length === 0 && category.required && (
                              <div className="text-center py-4 text-orange-400 bg-orange-400/10 rounded-lg">
                                <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Veuillez ajouter un {category.label.toLowerCase()}</p>
                              </div>
                            )}
                            
                            {categoryComposants.length === 0 && !category.required && (
                              <div className="text-center py-4 text-gray-500 bg-gray-700/50 rounded-lg">
                                <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Aucun {category.label.toLowerCase()} ajouté</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                )}

                {/* Résumé des coûts */}
                {selectedComposants.length > 0 && (
                  <Card className="bg-gaming-purple/20 border-gaming-purple/50 mt-6">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm text-gray-400">Prix coûtant total</div>
                          <div className="text-2xl font-bold text-gaming-green">{prixCoutant.toFixed(2)} MAD</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Prix de vente</div>
                          <Input
                            type="number"
                            value={newConfig.prix_vente}
                            onChange={(e) => setNewConfig({ ...newConfig, prix_vente: parseFloat(e.target.value) || 0 })}
                            className="bg-gray-800 border-gray-600 text-center font-bold"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Marge</div>
                          <div className="text-2xl font-bold text-gaming-cyan">
                            {newConfig.prix_vente && prixCoutant 
                              ? `${(((newConfig.prix_vente - prixCoutant) / prixCoutant) * 100).toFixed(1)}%`
                              : "0%"
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Stock possible</div>
                          <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            {getStatutIcon(stockPossible)}
                            {stockPossible}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Image */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Image de la configuration</h3>
                
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="w-32 h-32 bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-gray-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={showCamera ? stopCamera : startCamera}
                      className="border-gray-600"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {showCamera ? "Arrêter" : "Caméra"}
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {showCamera && (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-600"
                      />
                      <Button 
                        type="button"
                        onClick={takePhoto}
                        className="gaming-gradient"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capturer
                      </Button>
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-gray-700 pt-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newConfig.notes}
                  onChange={(e) => setNewConfig({ ...newConfig, notes: e.target.value })}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Informations supplémentaires sur cette configuration..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={editingConfig ? handleEditConfig : handleAddConfig}
                className="gaming-gradient"
                disabled={selectedComposants.length === 0}
              >
                {editingConfig ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gaming-purple/20 border-gaming-purple/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-gaming-purple" />
              <div>
                <p className="text-sm text-gray-400">Total Configurations</p>
                <p className="text-2xl font-bold text-white">{pcGamerConfigs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gaming-green/20 border-gaming-green/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-gaming-green" />
              <div>
                <p className="text-sm text-gray-400">Disponibles</p>
                <p className="text-2xl font-bold text-white">
                  {pcGamerConfigs.filter(c => c.stock_possible > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-600/20 border-yellow-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-400">Stock faible</p>
                <p className="text-2xl font-bold text-white">
                  {pcGamerConfigs.filter(c => c.stock_possible > 0 && c.stock_possible <= 3).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-600/20 border-red-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-400">Rupture</p>
                <p className="text-2xl font-bold text-white">
                  {pcGamerConfigs.filter(c => c.stock_possible === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une configuration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurations Grid */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurations PC Gamer
          </CardTitle>
          <CardDescription className="text-gray-400">
            {filteredConfigs.length} configuration(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConfigs.map((config) => (
              <Card key={config.id} className="bg-gray-800 border-gray-700 hover:border-gaming-purple/50 transition-all">
                <CardContent className="p-4">
                  {/* Image */}
                  <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {config.image_url ? (
                      <img 
                        src={config.image_url} 
                        alt={config.nom_config}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Settings className="w-16 h-16 text-gray-500" />
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg">{config.nom_config}</h3>
                      {config.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{config.description}</p>
                      )}
                      <Badge className="mt-2 text-xs bg-gaming-purple/20 text-gaming-purple">
                        {config.statut}
                      </Badge>
                    </div>
                    <Badge className={`${getStatutColor(config.stock_possible)} text-xs ml-2`}>
                      Stock: {config.stock_possible}
                    </Badge>
                  </div>
                  
                  {/* Config Info */}
                  <div className="space-y-2 mb-4">
                    {config.code_barre && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Code-barres:</span>
                        <span className="text-white font-mono text-xs">{config.code_barre}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Garantie:</span>
                      <span className="text-white">
                        {config.garantie}
                      </span>
                    </div>
                  </div>

                  {/* Commercial Info */}
                  <div className="border-t border-gray-700 pt-3 space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prix coûtant:</span>
                      <span className="text-gaming-green font-semibold">{config.prix_coutant} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prix de vente:</span>
                      <span className="text-gaming-green font-semibold">{config.prix_vente} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Marge:</span>
                      <span className="text-gaming-cyan font-semibold">
                        {config.prix_coutant > 0 
                          ? `${(((config.prix_vente - config.prix_coutant) / config.prix_coutant) * 100).toFixed(1)}%`
                          : "0%"
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="border-t border-gray-700 pt-3 space-y-3">
                    <div className="flex justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showConfigDetails(config.id)}
                        className="text-gaming-cyan hover:bg-gaming-cyan/20 h-8 flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Détails
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(config)}
                        className="text-gaming-purple hover:bg-gaming-purple/20 h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConfig(config.id)}
                        className="text-red-400 hover:bg-red-400/20 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Bouton d'assignation */}
                    <AssignProductDialog
                      productId={config.id}
                      productType="pc_gamer"
                      productName={config.nom_config}
                      productCode={config.code_barre}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assigner à l'équipe
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredConfigs.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Aucune configuration PC Gamer trouvée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 