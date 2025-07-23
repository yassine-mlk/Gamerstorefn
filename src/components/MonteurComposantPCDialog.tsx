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
  Upload,
  Camera,
  Loader2,
  XCircle,
  Eye,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// Catégories de composants PC avec leurs icônes
const categories = [
  { value: "cpu", label: "Processeur", icon: Cpu },
  { value: "gpu", label: "Carte graphique", icon: Monitor },
  { value: "ram", label: "Mémoire RAM", icon: MemoryStick },
  { value: "disc", label: "Stockage", icon: HardDrive },
  { value: "case", label: "Boîtier", icon: Box },
  { value: "mother_board", label: "Carte mère", icon: Cpu },
  { value: "power", label: "Alimentation", icon: Zap },
  { value: "cooling", label: "Refroidissement", icon: Fan }
];

const garanties = ["Sans garantie", "3 mois", "6 mois", "9 mois", "12 mois"];
const etats = ["Neuf", "Comme neuf", "Occasion"];

interface MonteurComposantPCDialogProps {
  trigger?: React.ReactNode;
  onComposantCreated?: () => void;
}

export function MonteurComposantPCDialog({ trigger, onComposantCreated }: MonteurComposantPCDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    nom_produit: "",
    categorie: "cpu" as any,
    code_barre: "",
    stock_actuel: 0,
    stock_minimum: 1,
    prix_achat: 0,
    prix_vente: 0,
    fournisseur_id: "none",
    etat: "Neuf" as any,
    garantie: "0",
    image_url: "",
    notes: ""
  });

  // Charger les fournisseurs
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (open) {
        setLoadingSuppliers(true);
        try {
          const { data, error } = await supabase
            .from('fournisseurs')
            .select('id, nom')
            .order('nom');

          if (error) {
            console.warn('Erreur lors du chargement des fournisseurs:', error);
            setSuppliers([]);
          } else {
            setSuppliers(data || []);
          }
        } catch (error) {
          console.warn('Erreur lors du chargement des fournisseurs:', error);
          setSuppliers([]);
        } finally {
          setLoadingSuppliers(false);
        }
      }
    };

    fetchSuppliers();
  }, [open]);

  const handleCreateComposant = async () => {
    if (!newProduct.nom_produit || !newProduct.categorie) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Générer un code-barres automatique si vide
      const codeBarre = newProduct.code_barre.trim() || `COMP${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const productToCreate = {
        ...newProduct,
        code_barre: codeBarre,
        fournisseur_id: newProduct.fournisseur_id === "none" ? null : newProduct.fournisseur_id,
        statut: 'Disponible'
      };

      const { data, error } = await supabase
        .from('composants_pc')
        .insert([productToCreate])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast({
          title: "Composant créé",
          description: "Le composant PC a été créé avec succès",
        });
        setOpen(false);
        resetForm();
        onComposantCreated?.();
      }
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      
      let errorMessage = "Impossible de créer le composant PC";
      
      // Messages d'erreur plus spécifiques
      if (error.code === '23505') {
        errorMessage = "Ce code-barres existe déjà. Veuillez en utiliser un autre.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      nom_produit: "",
      categorie: "cpu",
      code_barre: "",
      stock_actuel: 0,
      stock_minimum: 1,
      prix_achat: 0,
      prix_vente: 0,
      fournisseur_id: "none",
      etat: "Neuf",
      garantie: "0",
      image_url: "",
      notes: ""
    });
    setImagePreview("");
    setShowCamera(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : Cpu;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        // Pour l'instant, on utilise une URL temporaire
        const imageUrl = URL.createObjectURL(file);
        setImagePreview(imageUrl);
        setNewProduct(prev => ({ ...prev, image_url: imageUrl }));
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger l'image",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(imageDataUrl);
        setNewProduct(prev => ({ ...prev, image_url: imageDataUrl }));
        stopCamera();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Créer Composant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Créer un Composant PC
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau composant PC au stock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom_produit">Nom du produit *</Label>
                  <Input
                    id="nom_produit"
                    value={newProduct.nom_produit}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, nom_produit: e.target.value }))}
                    placeholder="Ex: Intel Core i7-12700K"
                  />
                </div>
                <div>
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select value={newProduct.categorie} onValueChange={(value) => setNewProduct(prev => ({ ...prev, categorie: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="code_barre">Code-barres</Label>
                  <Input
                    id="code_barre"
                    value={newProduct.code_barre}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, code_barre: e.target.value }))}
                    placeholder="Code-barres unique"
                  />
                </div>
                <div>
                  <Label htmlFor="fournisseur">Fournisseur</Label>
                  <Select value={newProduct.fournisseur_id} onValueChange={(value) => setNewProduct(prev => ({ ...prev, fournisseur_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Aucun fournisseur
                      </SelectItem>
                      {loadingSuppliers ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Chargement...
                        </SelectItem>
                      ) : suppliers.length === 0 ? (
                        <SelectItem value="no-suppliers" disabled>
                          Aucun fournisseur disponible
                        </SelectItem>
                      ) : (
                        suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id || `supplier-${supplier.nom}`}>
                            {supplier.nom}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock et prix */}
          <Card>
            <CardHeader>
              <CardTitle>Stock et prix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock_actuel">Stock actuel</Label>
                  <Input
                    id="stock_actuel"
                    type="number"
                    value={newProduct.stock_actuel}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock_actuel: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="stock_minimum">Stock minimum</Label>
                  <Input
                    id="stock_minimum"
                    type="number"
                    value={newProduct.stock_minimum}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock_minimum: parseInt(e.target.value) || 1 }))}
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="prix_achat">Prix d'achat (MAD)</Label>
                  <Input
                    id="prix_achat"
                    type="number"
                    value={newProduct.prix_achat}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, prix_achat: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="prix_vente">Prix de vente (MAD)</Label>
                  <Input
                    id="prix_vente"
                    type="number"
                    value={newProduct.prix_vente}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, prix_vente: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="etat">État</Label>
                  <Select value={newProduct.etat} onValueChange={(value) => setNewProduct(prev => ({ ...prev, etat: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {etats.map((etat) => (
                        <SelectItem key={etat} value={etat}>
                          {etat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="garantie">Garantie</Label>
                  <Select value={newProduct.garantie} onValueChange={(value) => setNewProduct(prev => ({ ...prev, garantie: value }))}>
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
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Image du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Télécharger une image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={showCamera ? stopCamera : startCamera}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {showCamera ? "Arrêter la caméra" : "Prendre une photo"}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Aperçu de l'image */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImagePreview("");
                      setNewProduct(prev => ({ ...prev, image_url: "" }));
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Caméra */}
              {showCamera && (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md rounded-lg border"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <Button onClick={takePhoto} className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Prendre la photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={newProduct.notes}
                onChange={(e) => setNewProduct(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes supplémentaires sur le composant..."
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateComposant} 
              disabled={!newProduct.nom_produit || !newProduct.categorie || uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Créer le composant
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 