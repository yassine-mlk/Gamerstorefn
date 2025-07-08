import { useState, useRef } from "react";
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
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMoniteurs, Moniteur, NewMoniteur } from "@/hooks/useMoniteurs";
import { useSuppliers } from "@/hooks/useSuppliers";
import { uploadImage, uploadImageFromBase64 } from "@/lib/imageUpload";
import { GARANTIE_OPTIONS, ETAT_OPTIONS } from "@/lib/constants";

// Données par défaut
const marques = ["Dell", "ASUS", "LG", "Samsung", "AOC", "BenQ", "Acer", "HP", "Philips", "MSI", "ViewSonic"];
const tailles = ["19\"", "21.5\"", "24\"", "27\"", "28\"", "32\"", "34\"", "35\"", "38\"", "43\"", "49\""];
const resolutions = ["1920x1080", "2560x1440", "3840x2160", "2560x1080", "3440x1440", "5120x1440"];
const frequences = ["60Hz", "75Hz", "100Hz", "120Hz", "144Hz", "165Hz", "180Hz", "240Hz", "280Hz", "360Hz"];

export default function MoniteursNew({ embedded = false }: { embedded?: boolean }) {
  const { moniteurs, loading, addMoniteur, updateMoniteur, deleteMoniteur } = useMoniteurs();
  const { suppliers, loading: loadingSuppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMoniteur, setEditingMoniteur] = useState<Moniteur | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [newMoniteur, setNewMoniteur] = useState<NewMoniteur>({
    nom_produit: "",
    code_barre: "",
    marque: "",
    taille: "",
    resolution: "",
    frequence_affichage: "",
    etat: "Neuf",
    garantie: "12 mois",
    prix_achat: 0,
    prix_vente: 0,
    stock_actuel: 0,
    stock_minimum: 1,
    image_url: "",
    fournisseur_id: "",
    emplacement: "",
    description: "",
    notes: ""
  });
  
  const { toast } = useToast();

  const filteredMoniteurs = moniteurs.filter(moniteur => 
    moniteur.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moniteur.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moniteur.taille.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moniteur.resolution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (moniteur.code_barre && moniteur.code_barre.includes(searchTerm))
  );

  const handleAddMoniteur = async () => {
    if (!newMoniteur.nom_produit || !newMoniteur.marque || !newMoniteur.taille || !newMoniteur.resolution || !newMoniteur.frequence_affichage) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const result = await addMoniteur(newMoniteur);
    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEditMoniteur = async () => {
    if (!editingMoniteur || !newMoniteur.nom_produit || !newMoniteur.marque || !newMoniteur.taille || !newMoniteur.resolution || !newMoniteur.frequence_affichage) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const result = await updateMoniteur(editingMoniteur.id, newMoniteur);
    if (result) {
      setEditingMoniteur(null);
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleDeleteMoniteur = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce moniteur ?")) {
      await deleteMoniteur(id);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const result = await uploadImage(file);
        if (result.success && result.url) {
          setImagePreview(result.url);
          setNewMoniteur({ ...newMoniteur, image_url: result.url });
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
          const result = await uploadImageFromBase64(imageData);
          if (result.success && result.url) {
            setImagePreview(result.url);
            setNewMoniteur({ ...newMoniteur, image_url: result.url });
            stopCamera();
            toast({
              title: "Photo capturée",
              description: "La photo a été ajoutée au moniteur",
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

  const resetForm = () => {
    setNewMoniteur({
      nom_produit: "",
      code_barre: "",
      marque: "",
      taille: "",
      resolution: "",
      frequence_affichage: "",
      etat: "Neuf",
      garantie: "12 mois",
      prix_achat: 0,
      prix_vente: 0,
      stock_actuel: 0,
      stock_minimum: 1,
      image_url: "",
      fournisseur_id: "",
      emplacement: "",
      description: "",
      notes: ""
    });
    setImagePreview("");
    stopCamera();
  };

  const openEditDialog = (moniteur: Moniteur) => {
    setEditingMoniteur(moniteur);
    setNewMoniteur({
      nom_produit: moniteur.nom_produit,
      code_barre: moniteur.code_barre || "",
      marque: moniteur.marque,
      taille: moniteur.taille,
      resolution: moniteur.resolution,
      frequence_affichage: moniteur.frequence_affichage,
      etat: moniteur.etat,
      garantie: moniteur.garantie,
      prix_achat: moniteur.prix_achat,
      prix_vente: moniteur.prix_vente,
      stock_actuel: moniteur.stock_actuel,
      stock_minimum: moniteur.stock_minimum,
      image_url: moniteur.image_url || "",
      fournisseur_id: moniteur.fournisseur_id || "",
      emplacement: moniteur.emplacement || "",
      description: moniteur.description || "",
      notes: moniteur.notes || ""
    });
    setImagePreview(moniteur.image_url || "");
    setIsAddDialogOpen(true);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-gaming-green';
      case 'Stock faible': return 'bg-yellow-600';
      case 'Rupture': return 'bg-red-600';
      case 'Réservé': return 'bg-blue-600';
      case 'Archivé': return 'bg-gray-200';
      default: return 'bg-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'Disponible': return <CheckCircle className="w-4 h-4" />;
      case 'Stock faible': return <AlertTriangle className="w-4 h-4" />;
      case 'Rupture': return <XCircle className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getStockStats = () => {
    return {
      total: moniteurs.length,
      disponible: moniteurs.filter(m => m.statut === 'Disponible').length,
      stockFaible: moniteurs.filter(m => m.statut === 'Stock faible').length,
      rupture: moniteurs.filter(m => m.statut === 'Rupture').length
    };
  };

  // Fonction pour calculer les statistiques de prix basées sur les produits filtrés
  const getPriceStats = (products: Moniteur[]) => {
    const totalAchat = products.reduce((sum, product) => sum + (product.prix_achat * product.stock_actuel), 0);
    const totalVente = products.reduce((sum, product) => sum + (product.prix_vente * product.stock_actuel), 0);
    const beneficePotentiel = totalVente - totalAchat;
    
    return {
      totalAchat,
      totalVente,
      beneficePotentiel,
      margeGlobale: totalAchat > 0 ? ((beneficePotentiel / totalAchat) * 100) : 0
    };
  };

  const stats = getStockStats();
  const priceStats = getPriceStats(filteredMoniteurs);
  const activeFournisseurs = suppliers.filter(s => s.statut === 'Actif' || s.statut === 'Privilégié');

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gaming-cyan" />
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-6" : "p-6 space-y-6 bg-background min-h-screen"}>
      {!embedded && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Moniteurs</h1>
                <p className="text-gray-600">Gérer l'inventaire des moniteurs</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        {embedded && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Monitor className="w-6 h-6 text-gaming-cyan" />
              Moniteurs
            </h2>
            <p className="text-gray-600">Gérer l'inventaire des moniteurs</p>
          </div>
        )}
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un moniteur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {editingMoniteur ? "Modifier le moniteur" : "Ajouter un nouveau moniteur"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Remplissez les informations du moniteur
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Informations de base
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom_produit">Nom du produit *</Label>
                    <Input
                      id="nom_produit"
                      value={newMoniteur.nom_produit}
                      onChange={(e) => setNewMoniteur({ ...newMoniteur, nom_produit: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Ex: Dell UltraSharp U2720Q"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code_barre">Code-barres</Label>
                    <Input
                      id="code_barre"
                      value={newMoniteur.code_barre}
                      onChange={(e) => setNewMoniteur({ ...newMoniteur, code_barre: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Code-barres du produit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marque">Marque *</Label>
                    <Select value={newMoniteur.marque} onValueChange={(value) => setNewMoniteur({ ...newMoniteur, marque: value })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la marque" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {marques.map((marque) => (
                          <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taille">Taille *</Label>
                    <Select value={newMoniteur.taille} onValueChange={(value) => setNewMoniteur({ ...newMoniteur, taille: value })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la taille" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {tailles.map((taille) => (
                          <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="resolution">Résolution *</Label>
                    <Select value={newMoniteur.resolution} onValueChange={(value) => setNewMoniteur({ ...newMoniteur, resolution: value })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la résolution" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {resolutions.map((resolution) => (
                          <SelectItem key={resolution} value={resolution}>{resolution}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequence_affichage">Fréquence d'affichage *</Label>
                    <Select value={newMoniteur.frequence_affichage} onValueChange={(value) => setNewMoniteur({ ...newMoniteur, frequence_affichage: value })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la fréquence" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {frequences.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="etat">État *</Label>
                    <Select value={newMoniteur.etat} onValueChange={(value: 'Neuf' | 'Comme neuf' | 'Occasion') => setNewMoniteur({ ...newMoniteur, etat: value })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner l'état" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {ETAT_OPTIONS.map((etat) => (
                          <SelectItem key={etat} value={etat}>{etat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="garantie">Garantie</Label>
                    <Select value={newMoniteur.garantie} onValueChange={(value: string) => setNewMoniteur({ ...newMoniteur, garantie: value })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la garantie" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {GARANTIE_OPTIONS.map((garantie) => (
                          <SelectItem key={garantie} value={garantie}>{garantie}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Image du produit */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Image du produit
                </h3>
                
                <div className="flex flex-col gap-4">
                  {imagePreview && (
                    <div className="w-full max-w-md">
                      <img 
                        src={imagePreview} 
                        alt="Aperçu" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      className="border-gray-200"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Upload..." : "Choisir un fichier"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="border-gray-200"
                      onClick={showCamera ? stopCamera : startCamera}
                      disabled={uploading}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {showCamera ? "Arrêter caméra" : "Prendre photo"}
                    </Button>
                  </div>

                  {showCamera && (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <Button 
                        type="button"
                        onClick={takePhoto}
                        className="gaming-gradient"
                        disabled={uploading}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {uploading ? "Upload..." : "Capturer"}
                      </Button>
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              {/* Informations commerciales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Informations commerciales
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prix_achat">Prix d'achat (MAD)</Label>
                    <Input
                      id="prix_achat"
                      type="number"
                      step="0.01"
                      value={newMoniteur.prix_achat || ""}
                      onChange={(e) => setNewMoniteur({ ...newMoniteur, prix_achat: parseFloat(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prix_vente">Prix de vente (MAD)</Label>
                    <Input
                      id="prix_vente"
                      type="number"
                      step="0.01"
                      value={newMoniteur.prix_vente || ""}
                      onChange={(e) => setNewMoniteur({ ...newMoniteur, prix_vente: parseFloat(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock_actuel">Stock actuel</Label>
                    <Input
                      id="stock_actuel"
                      type="number"
                      value={newMoniteur.stock_actuel || ""}
                      onChange={(e) => setNewMoniteur({ ...newMoniteur, stock_actuel: parseInt(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_minimum">Stock minimum</Label>
                    <Input
                      id="stock_minimum"
                      type="number"
                      value={newMoniteur.stock_minimum || ""}
                      onChange={(e) => setNewMoniteur({ ...newMoniteur, stock_minimum: parseInt(e.target.value) || 1 })}
                      className="bg-white border-gray-200"
                      placeholder="1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Select 
                      value={newMoniteur.fournisseur_id} 
                      onValueChange={(value) => setNewMoniteur({ ...newMoniteur, fournisseur_id: value })}
                      disabled={loadingSuppliers}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {activeFournisseurs.map((fournisseur) => (
                          <SelectItem key={fournisseur.id} value={fournisseur.id}>
                            {fournisseur.nom}
                            {fournisseur.statut === 'Privilégié' && (
                              <Badge className="ml-2 bg-gaming-purple text-xs">Privilégié</Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="emplacement">Emplacement</Label>
                    <Input
                      id="emplacement"
                      value={newMoniteur.emplacement}
                      onChange={(e) => setNewMoniteur({ ...newMoniteur, emplacement: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Ex: Rayon A1, Étagère 2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMoniteur.description}
                    onChange={(e) => setNewMoniteur({ ...newMoniteur, description: e.target.value })}
                    className="bg-white border-gray-200"
                    placeholder="Description détaillée du moniteur..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes internes</Label>
                  <Textarea
                    id="notes"
                    value={newMoniteur.notes}
                    onChange={(e) => setNewMoniteur({ ...newMoniteur, notes: e.target.value })}
                    className="bg-white border-gray-200"
                    placeholder="Notes internes..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingMoniteur(null);
                  resetForm();
                }}
                className="border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button 
                onClick={editingMoniteur ? handleEditMoniteur : handleAddMoniteur} 
                className="gaming-gradient"
                disabled={uploading}
              >
                {editingMoniteur ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Moniteurs</p>
                <p className="text-gray-900 text-3xl font-bold">{stats.total}</p>
              </div>
              <Monitor className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Disponibles</p>
                <p className="text-gray-900 text-3xl font-bold">{stats.disponible}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Stock Faible</p>
                <p className="text-gray-900 text-3xl font-bold">{stats.stockFaible}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-600 to-red-700 border-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Rupture</p>
                <p className="text-gray-900 text-3xl font-bold">{stats.rupture}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 border-cyan-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Prix Total Achat</p>
                <p className="text-gray-900 text-3xl font-bold">{priceStats.totalAchat.toLocaleString()} MAD</p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Prix Total Vente</p>
                <p className="text-gray-900 text-3xl font-bold">{priceStats.totalVente.toLocaleString()} MAD</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Recherche et filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom, marque, taille, résolution ou code-barres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moniteurs List */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Liste des Moniteurs</CardTitle>
          <CardDescription className="text-gray-600">
            {filteredMoniteurs.length} moniteur(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMoniteurs.map((moniteur) => (
              <Card key={moniteur.id} className="bg-white border-gray-200 hover:border-gaming-cyan transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Image */}
                    {moniteur.image_url && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={moniteur.image_url} 
                          alt={moniteur.nom_produit}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-semibold text-sm line-clamp-2">
                          {moniteur.nom_produit}
                        </h3>
                        <p className="text-gaming-cyan text-xs">{moniteur.marque}</p>
                      </div>
                      <Badge className={`${getStatutColor(moniteur.statut)} text-gray-900 text-xs`}>
                        <div className="flex items-center gap-1">
                          {getStatutIcon(moniteur.statut)}
                          {moniteur.statut}
                        </div>
                      </Badge>
                    </div>

                    {/* Specs */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Taille:</span>
                        <span className="text-gray-900">{moniteur.taille}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Résolution:</span>
                        <span className="text-gray-900">{moniteur.resolution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fréquence:</span>
                        <span className="text-gray-900">{moniteur.frequence_affichage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>État:</span>
                        <span className="text-gray-900">{moniteur.etat}</span>
                      </div>
                    </div>

                    {/* Prix et Stock */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Prix vente:</span>
                        <span className="text-gaming-green font-medium">{moniteur.prix_vente.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Stock:</span>
                        <span className="text-gray-900 font-medium">{moniteur.stock_actuel}</span>
                      </div>
                      {moniteur.code_barre && (
                        <div className="flex justify-between text-gray-600">
                          <span>Code-barres:</span>
                          <span className="text-gray-900 text-xs">{moniteur.code_barre}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(moniteur)}
                        className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-100"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMoniteur(moniteur.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-gray-900"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredMoniteurs.length === 0 && (
            <div className="text-center py-12">
              <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucun moniteur trouvé</p>
              <p className="text-gray-500">Commencez par ajouter votre premier moniteur</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 