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
  Mouse,
  Keyboard,
  Headphones,
  Backpack,
  FileX,
  HardDrive,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePeripheriques, Peripherique, NewPeripherique } from "@/hooks/usePeripheriques";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useSettings } from "@/hooks/useSettings";
import { uploadImage, uploadImageFromBase64 } from "@/lib/imageUpload";

// Données par défaut
const categories = [
  { value: "claviers", label: "Claviers", icon: Keyboard },
  { value: "casque", label: "Casques", icon: Headphones },
  { value: "sac_a_dos", label: "Sacs à dos", icon: Backpack },
  { value: "souris", label: "Souris", icon: Mouse },
  { value: "tapis_de_souris", label: "Tapis de souris", icon: FileX },
  { value: "stockage", label: "Stockage", icon: HardDrive },
  { value: "webcam", label: "Webcams", icon: Camera }
];

const garanties = ["Sans garantie", "3 mois", "6 mois", "9 mois", "12 mois"];
const etats = ["Neuf", "Comme neuf", "Occasion"];

export default function Peripheriques({ embedded = false }: { embedded?: boolean }) {
  const { peripheriques, loading, addPeripherique, updatePeripherique, deletePeripherique } = usePeripheriques();
  const { suppliers, loading: loadingSuppliers } = useSuppliers();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPeripherique, setEditingPeripherique] = useState<Peripherique | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [newPeripherique, setNewPeripherique] = useState<NewPeripherique>({
    nom_produit: "",
    code_barre: "",
    prix_achat: 0,
    prix_vente: 0,
    image_url: "",
    categorie: "souris",
    fournisseur_id: "",
    marque: "",
    modele: "",
    reference: "",
    etat: "Neuf",
    garantie: "12 mois",
    stock_actuel: 0,
    stock_minimum: 1,
    emplacement: "",
    description: "",
    notes: ""
  });
  
  const { toast } = useToast();

  const filteredPeripheriques = peripheriques.filter(peripherique => 
    peripherique.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (peripherique.marque && peripherique.marque.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (peripherique.modele && peripherique.modele.toLowerCase().includes(searchTerm.toLowerCase())) ||
    peripherique.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (peripherique.code_barre && peripherique.code_barre.includes(searchTerm))
  );

  const handleAddPeripherique = async () => {
    if (!newPeripherique.nom_produit || !newPeripherique.categorie) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le nom du produit et la catégorie",
        variant: "destructive",
      });
      return;
    }

    const result = await addPeripherique(newPeripherique);
    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEditPeripherique = async () => {
    if (!editingPeripherique || !newPeripherique.nom_produit || !newPeripherique.categorie) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le nom du produit et la catégorie",
        variant: "destructive",
      });
      return;
    }

    const result = await updatePeripherique(editingPeripherique.id, newPeripherique);
    if (result) {
      setEditingPeripherique(null);
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleDeletePeripherique = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce périphérique ?")) {
      await deletePeripherique(id);
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
          setNewPeripherique({ ...newPeripherique, image_url: result.url });
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
            setNewPeripherique({ ...newPeripherique, image_url: result.url });
            stopCamera();
            toast({
              title: "Photo prise",
              description: "La photo a été prise et téléchargée avec succès",
            });
          } else {
            toast({
              title: "Erreur",
              description: result.error || "Erreur lors du téléchargement de la photo",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Erreur lors du téléchargement de la photo",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const resetForm = () => {
    setNewPeripherique({
      nom_produit: "",
      code_barre: "",
      prix_achat: 0,
      prix_vente: 0,
      image_url: "",
      categorie: "souris",
      fournisseur_id: "",
      marque: "",
      modele: "",
      reference: "",
      etat: "Neuf",
      garantie: "12 mois",
      stock_actuel: 0,
      stock_minimum: 1,
      emplacement: "",
      description: "",
      notes: ""
    });
    setImagePreview("");
    setEditingPeripherique(null);
    stopCamera();
  };

  const openEditDialog = (peripherique: Peripherique) => {
    setEditingPeripherique(peripherique);
    setNewPeripherique({
      nom_produit: peripherique.nom_produit,
      code_barre: peripherique.code_barre || "",
      prix_achat: peripherique.prix_achat,
      prix_vente: peripherique.prix_vente,
      image_url: peripherique.image_url || "",
      categorie: peripherique.categorie,
      fournisseur_id: peripherique.fournisseur_id || "",
      marque: peripherique.marque || "",
      modele: peripherique.modele || "",
      reference: peripherique.reference || "",
      etat: peripherique.etat,
      garantie: peripherique.garantie || "12 mois",
      stock_actuel: peripherique.stock_actuel,
      stock_minimum: peripherique.stock_minimum,
      emplacement: peripherique.emplacement || "",
      description: peripherique.description || "",
      notes: peripherique.notes || ""
    });
    setImagePreview(peripherique.image_url || "");
    setIsAddDialogOpen(true);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'rupture': return 'bg-red-100 text-red-800';
      case 'commande': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'disponible': return <CheckCircle className="h-4 w-4" />;
      case 'rupture': return <XCircle className="h-4 w-4" />;
      case 'commande': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCategorieIcon = (categorie: string) => {
    const cat = categories.find(c => c.value === categorie);
    return cat ? <cat.icon className="h-4 w-4" /> : null;
  };

  const getCategorieLabel = (categorie: string) => {
    const cat = categories.find(c => c.value === categorie);
    return cat ? cat.label : categorie;
  };

  const getStockStats = () => {
    const total = peripheriques.length;
    const disponibles = peripheriques.filter(p => p.statut === 'disponible').length;
    const rupture = peripheriques.filter(p => p.statut === 'rupture').length;
    const commande = peripheriques.filter(p => p.statut === 'commande').length;
    
    return { total, disponibles, rupture, commande };
  };

  // Fonction pour calculer les statistiques de prix basées sur les produits filtrés
  const getPriceStats = (products: Peripherique[]) => {
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
  const priceStats = getPriceStats(filteredPeripheriques);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des périphériques...</span>
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
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Périphériques</h1>
                <p className="text-gray-600">Gérer l'inventaire des périphériques</p>
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
              <Mouse className="w-6 h-6 text-gaming-cyan" />
              Périphériques
            </h2>
            <p className="text-gray-600">Gérer l'inventaire des périphériques</p>
          </div>
        )}
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un périphérique
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {editingPeripherique ? "Modifier le périphérique" : "Ajouter un nouveau périphérique"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingPeripherique 
                  ? "Modifiez les informations du périphérique ci-dessous."
                  : "Remplissez les informations du nouveau périphérique."
                }
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
                      value={newPeripherique.nom_produit}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, nom_produit: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Ex: Clavier Gaming RGB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code_barre">Code barre</Label>
                    <Input
                      id="code_barre"
                      value={newPeripherique.code_barre}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, code_barre: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Ex: 1234567890123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categorie">Catégorie *</Label>
                    <Select
                      value={newPeripherique.categorie}
                      onValueChange={(value: any) => setNewPeripherique({ ...newPeripherique, categorie: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center space-x-2">
                              <cat.icon className="h-4 w-4" />
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="marque">Marque</Label>
                    <Select
                      value={newPeripherique.marque}
                      onValueChange={(value) => setNewPeripherique({ ...newPeripherique, marque: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner une marque" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {settings.marquesPeripheriques.map((marque) => (
                          <SelectItem key={marque} value={marque}>
                            {marque}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modele">Modèle</Label>
                    <Input
                      id="modele"
                      value={newPeripherique.modele}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, modele: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Ex: K95 RGB Platinum"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Référence</Label>
                    <Input
                      id="reference"
                      value={newPeripherique.reference}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, reference: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Référence interne"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="etat">État</Label>
                    <Select
                      value={newPeripherique.etat}
                      onValueChange={(value: any) => setNewPeripherique({ ...newPeripherique, etat: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
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
                    <Select
                      value={newPeripherique.garantie}
                      onValueChange={(value) => setNewPeripherique({ ...newPeripherique, garantie: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {garanties.map((garantie) => (
                          <SelectItem key={garantie} value={garantie}>
                            {garantie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Prix et Stock */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Prix et stock
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prix_achat">Prix d'achat (MAD)</Label>
                    <Input
                      id="prix_achat"
                      type="number"
                      step="0.01"
                      value={newPeripherique.prix_achat}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, prix_achat: parseFloat(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prix_vente">Prix de vente (MAD)</Label>
                    <Input
                      id="prix_vente"
                      type="number"
                      step="0.01"
                      value={newPeripherique.prix_vente}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, prix_vente: parseFloat(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock_actuel">Stock actuel</Label>
                    <Input
                      id="stock_actuel"
                      type="number"
                      value={newPeripherique.stock_actuel}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, stock_actuel: parseInt(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_minimum">Stock minimum</Label>
                    <Input
                      id="stock_minimum"
                      type="number"
                      value={newPeripherique.stock_minimum}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, stock_minimum: parseInt(e.target.value) || 1 })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Select
                      value={newPeripherique.fournisseur_id}
                      onValueChange={(value) => setNewPeripherique({ ...newPeripherique, fournisseur_id: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="emplacement">Emplacement</Label>
                    <Input
                      id="emplacement"
                      value={newPeripherique.emplacement}
                      onChange={(e) => setNewPeripherique({ ...newPeripherique, emplacement: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Ex: Étagère A-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newPeripherique.description}
                    onChange={(e) => setNewPeripherique({ ...newPeripherique, description: e.target.value })}
                    className="bg-white border-gray-200"
                    placeholder="Description du produit..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes internes</Label>
                  <Textarea
                    id="notes"
                    value={newPeripherique.notes}
                    onChange={(e) => setNewPeripherique({ ...newPeripherique, notes: e.target.value })}
                    className="bg-white border-gray-200"
                    placeholder="Notes internes..."
                    rows={2}
                  />
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
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
                      {showCamera ? "Fermer caméra" : "Prendre une photo"}
                    </Button>
                  </div>

                  {showCamera && (
                    <div className="flex flex-col items-center space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="max-w-md rounded-lg border border-gray-200"
                      />
                      <Button onClick={takePhoto} disabled={uploading} className="gaming-gradient">
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                        Capturer la photo
                      </Button>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
                className="border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                onClick={editingPeripherique ? handleEditPeripherique : handleAddPeripherique}
                disabled={uploading}
                className="gaming-gradient"
              >
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPeripherique ? "Modifier" : "Ajouter"}
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
                <p className="text-blue-100 text-sm font-medium">Total Périphériques</p>
                <p className="text-gray-900 text-3xl font-bold">{stats.total}</p>
              </div>
              <Mouse className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Disponibles</p>
                <p className="text-gray-900 text-3xl font-bold">{stats.disponibles}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">À commander</p>
                <p className="text-gray-900 text-3xl font-bold">{stats.commande}</p>
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
                placeholder="Rechercher par nom, marque, modèle, catégorie ou code barre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Périphériques List */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Liste des Périphériques</CardTitle>
          <CardDescription className="text-gray-600">
            {filteredPeripheriques.length} périphérique(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeripheriques.map((peripherique) => (
              <Card key={peripherique.id} className="bg-white border-gray-200 hover:border-gaming-cyan transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Image */}
                    {peripherique.image_url ? (
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={peripherique.image_url} 
                          alt={peripherique.nom_produit}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getCategorieIcon(peripherique.categorie)}
                      </div>
                    )}
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-semibold text-sm line-clamp-2">
                          {peripherique.nom_produit}
                        </h3>
                        <p className="text-gaming-cyan text-xs">{peripherique.marque}</p>
                      </div>
                      <Badge className={`${getStatutColor(peripherique.statut)} text-gray-900 text-xs`}>
                        <div className="flex items-center gap-1">
                          {getStatutIcon(peripherique.statut)}
                          {peripherique.statut}
                        </div>
                      </Badge>
                    </div>

                    {/* Specs */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Catégorie:</span>
                        <div className="flex items-center gap-1">
                          {getCategorieIcon(peripherique.categorie)}
                          <span className="text-gray-900">{getCategorieLabel(peripherique.categorie)}</span>
                        </div>
                      </div>
                      {peripherique.modele && (
                        <div className="flex justify-between">
                          <span>Modèle:</span>
                          <span className="text-gray-900">{peripherique.modele}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>État:</span>
                        <span className="text-gray-900">{peripherique.etat}</span>
                      </div>
                    </div>

                    {/* Prix et Stock */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Prix vente:</span>
                        <span className="text-gaming-green font-medium">{peripherique.prix_vente.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Stock:</span>
                        <span className="text-gray-900 font-medium">{peripherique.stock_actuel}</span>
                      </div>
                      {peripherique.code_barre && (
                        <div className="flex justify-between text-gray-600">
                          <span>Code-barres:</span>
                          <span className="text-gray-900 text-xs">{peripherique.code_barre}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(peripherique)}
                        className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-100"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePeripherique(peripherique.id)}
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
          
          {filteredPeripheriques.length === 0 && (
            <div className="text-center py-12">
              <Mouse className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm
                  ? "Aucun périphérique ne correspond à votre recherche."
                  : "Aucun périphérique trouvé"}
              </p>
              <p className="text-gray-500">Commencez par ajouter votre premier périphérique</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 