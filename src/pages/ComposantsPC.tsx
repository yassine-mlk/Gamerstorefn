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
  Cpu,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  Camera,
  Loader2,
  HardDrive,
  MemoryStick,
  Monitor,
  Box,
  Zap,
  Fan,
  Eye,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useComposantsPC, ComposantPC, NewComposantPC } from "@/hooks/useComposantsPC";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useNavigate } from "react-router-dom";
import { AssignProductDialog } from "@/components/AssignProductDialog";
import { uploadImageByType, uploadImageFromBase64ByType } from "@/lib/imageUpload";

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

export default function ComposantsPC({ embedded = false }: { embedded?: boolean }) {
  const { composantsPC, loading, addComposantPC, updateComposantPC, deleteComposantPC } = useComposantsPC();
  const { suppliers, loading: loadingSuppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ComposantPC | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const [newProduct, setNewProduct] = useState<NewComposantPC>({
    nom_produit: "",
    categorie: "cpu",
    code_barre: "",
    stock_actuel: 0,
    stock_minimum: 1,
    prix_achat: 0,
    prix_vente: 0,
    fournisseur_id: "",
    etat: "Neuf",
    garantie: "0",
    image_url: "",
    notes: ""
  });
  
  const { toast } = useToast();

  const filteredProducts = composantsPC.filter(product => {
    const matchesSearch = product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.code_barre && product.code_barre.includes(searchTerm)) ||
      (product.notes && product.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategorie === "all" || product.categorie === filterCategorie;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async () => {
    if (!newProduct.nom_produit || !newProduct.categorie || !newProduct.prix_achat || !newProduct.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const statut = newProduct.stock_actuel === 0 
      ? "Rupture" 
      : newProduct.stock_actuel! <= (newProduct.stock_minimum || 1) 
        ? "Stock faible" 
        : "Disponible";

    const result = await addComposantPC({
      ...newProduct,
      code_barre: newProduct.code_barre || `COMP${Date.now()}`,
      statut,
    });

    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !newProduct.nom_produit || !newProduct.categorie || !newProduct.prix_achat || !newProduct.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const statut = newProduct.stock_actuel === 0 
      ? "Rupture" 
      : newProduct.stock_actuel! <= (newProduct.stock_minimum || 1) 
        ? "Stock faible" 
        : "Disponible";

    const result = await updateComposantPC(editingProduct.id, {
      ...newProduct,
      statut,
    });

    if (result) {
      resetForm();
      setEditingProduct(null);
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce composant PC ?")) {
      await deleteComposantPC(id);
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
      fournisseur_id: undefined,
      etat: "Neuf",
      garantie: "0",
      image_url: "",
      notes: ""
    });
    setImagePreview("");
    stopCamera();
  };

  const openEditDialog = (product: ComposantPC) => {
    setEditingProduct(product);
    setNewProduct({
      nom_produit: product.nom_produit,
      categorie: product.categorie,
      code_barre: product.code_barre || "",
      stock_actuel: product.stock_actuel,
      stock_minimum: product.stock_minimum,
      prix_achat: product.prix_achat,
      prix_vente: product.prix_vente,
      fournisseur_id: product.fournisseur_id,
      etat: product.etat,
      garantie: product.garantie,
      image_url: product.image_url || "",
      notes: product.notes || ""
    });
    setImagePreview(product.image_url || "");
    setIsAddDialogOpen(true);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-gaming-green';
      case 'Stock faible': return 'bg-yellow-600';
      case 'Rupture': return 'bg-red-600';
      case 'Réservé': return 'bg-blue-600';
      case 'Archivé': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'Disponible': return <CheckCircle className="w-4 h-4" />;
      case 'Stock faible': return <AlertTriangle className="w-4 h-4" />;
      case 'Rupture': return <XCircle className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
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

  // Fonctions de gestion caméra/upload d'image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const result = await uploadImageByType(file, 'composant-pc');
        if (result.success && result.url) {
          setImagePreview(result.url);
          setNewProduct({ ...newProduct, image_url: result.url });
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
          const result = await uploadImageFromBase64ByType(imageData, 'composant-pc');
          if (result.success && result.url) {
            setImagePreview(result.url);
            setNewProduct({ ...newProduct, image_url: result.url });
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

  const getStockStats = () => {
    return {
      total: composantsPC.length,
      disponible: composantsPC.filter(p => p.statut === 'Disponible').length,
      stockFaible: composantsPC.filter(p => p.statut === 'Stock faible').length,
      rupture: composantsPC.filter(p => p.statut === 'Rupture').length
    };
  };

  const getStatsParCategorie = () => {
    return categories.map(cat => ({
      ...cat,
      count: composantsPC.filter(p => p.categorie === cat.value).length
    }));
  };

  // Fonction pour calculer les statistiques de prix basées sur les produits filtrés
  const getPriceStats = (products: ComposantPC[]) => {
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
  const statsCategories = getStatsParCategorie();
  const priceStats = getPriceStats(filteredProducts);
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
              <SidebarTrigger className="text-white hover:text-gaming-cyan" />
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Cpu className="w-8 h-8 text-gaming-cyan" />
                  Composants PC
                </h1>
                <p className="text-gray-400">Gestion du stock des composants informatiques</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        {embedded && (
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Cpu className="w-6 h-6 text-gaming-cyan" />
              Composants PC
            </h2>
            <p className="text-gray-400">Gestion du stock des composants informatiques</p>
          </div>
        )}
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Composant
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Modifier le Composant PC" : "Ajouter un nouveau Composant PC"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Remplissez les informations du composant PC
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom_produit">Nom du produit *</Label>
                  <Input
                    id="nom_produit"
                    value={newProduct.nom_produit}
                    onChange={(e) => setNewProduct({ ...newProduct, nom_produit: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Ex: Intel Core i7-13700K"
                  />
                </div>
                <div>
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select value={newProduct.categorie} onValueChange={(value: any) => setNewProduct({ ...newProduct, categorie: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code_barre">Code-barres</Label>
                  <Input
                    id="code_barre"
                    value={newProduct.code_barre}
                    onChange={(e) => setNewProduct({ ...newProduct, code_barre: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Scannez ou saisissez le code-barres"
                  />
                </div>
                <div>
                  <Label htmlFor="fournisseur_id">Fournisseur</Label>
                  <Select value={newProduct.fournisseur_id || "none"} onValueChange={(value) => setNewProduct({ ...newProduct, fournisseur_id: value === "none" ? undefined : value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="none">Aucun fournisseur</SelectItem>
                      {activeFournisseurs.map((fournisseur) => (
                        <SelectItem key={fournisseur.id} value={fournisseur.id}>{fournisseur.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* État et garantie */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="etat">État *</Label>
                  <Select value={newProduct.etat} onValueChange={(value: any) => setNewProduct({ ...newProduct, etat: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner l'état" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {etats.map((etat) => (
                        <SelectItem key={etat} value={etat}>{etat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="garantie">Garantie *</Label>
                  <Select value={newProduct.garantie} onValueChange={(value: any) => setNewProduct({ ...newProduct, garantie: value })}>
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
              </div>

              {/* Informations commerciales */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Informations commerciales</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prix_achat">Prix d'achat (MAD) *</Label>
                    <Input
                      id="prix_achat"
                      type="number"
                      value={newProduct.prix_achat}
                      onChange={(e) => setNewProduct({ ...newProduct, prix_achat: parseFloat(e.target.value) || 0 })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prix_vente">Prix de vente (MAD) *</Label>
                    <Input
                      id="prix_vente"
                      type="number"
                      value={newProduct.prix_vente}
                      onChange={(e) => setNewProduct({ ...newProduct, prix_vente: parseFloat(e.target.value) || 0 })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Marge</Label>
                    <div className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gaming-green font-semibold">
                      {newProduct.prix_vente && newProduct.prix_achat 
                        ? `${((newProduct.prix_vente - newProduct.prix_achat) / newProduct.prix_achat * 100).toFixed(1)}%`
                        : "0%"
                      }
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="stock_actuel">Stock actuel *</Label>
                    <Input
                      id="stock_actuel"
                      type="number"
                      value={newProduct.stock_actuel}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_actuel: parseInt(e.target.value) || 0 })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_minimum">Stock minimum *</Label>
                    <Input
                      id="stock_minimum"
                      type="number"
                      value={newProduct.stock_minimum}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_minimum: parseInt(e.target.value) || 1 })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Image du produit</h3>
                
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
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Informations supplémentaires sur le composant..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                className="gaming-gradient"
              >
                {editingProduct ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-gaming-purple/20 border-gaming-purple/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-gaming-purple" />
              <div>
                <p className="text-sm text-gray-400">Total Composants</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
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
                <p className="text-2xl font-bold text-white">{stats.disponible}</p>
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
                <p className="text-2xl font-bold text-white">{stats.stockFaible}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-600/20 border-red-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-400">En rupture</p>
                <p className="text-2xl font-bold text-white">{stats.rupture}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-600/20 border-blue-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Prix Total Achat</p>
                <p className="text-2xl font-bold text-white">{priceStats.totalAchat.toLocaleString()} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600/20 border-emerald-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Prix Total Vente</p>
                <p className="text-2xl font-bold text-white">{priceStats.totalVente.toLocaleString()} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Stats */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Répartition par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div key={cat.value} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <IconComponent className="w-6 h-6 text-gaming-cyan" />
                  <div>
                    <p className="text-sm text-gray-400">{cat.label}</p>
                    <p className="text-lg font-bold text-white">{cat.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, catégorie, code-barres ou notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600"
              />
            </div>
            <Select value={filterCategorie} onValueChange={setFilterCategorie}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Composants PC
          </CardTitle>
          <CardDescription className="text-gray-400">
            {filteredProducts.length} composant(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const IconComponent = getCategoryIcon(product.categorie);
              return (
                <Card key={product.id} className="bg-gray-800 border-gray-700 hover:border-gaming-purple/50 transition-all">
                  <CardContent className="p-4">
                    {/* Image */}
                    <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.nom_produit}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <IconComponent className="w-16 h-16 text-gray-500" />
                      )}
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg">{product.nom_produit}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <IconComponent className="w-4 h-4 text-gaming-cyan" />
                          <p className="text-gaming-cyan text-sm">{getCategoryLabel(product.categorie)}</p>
                        </div>
                        <Badge className="mt-1 text-xs bg-gray-600">{product.etat}</Badge>
                      </div>
                      <Badge className={`${getStatutColor(product.statut)} text-xs ml-2`}>
                        {product.statut}
                      </Badge>
                    </div>
                    
                    {/* Product Info */}
                    <div className="space-y-2 mb-4">
                      {product.code_barre && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Code-barres:</span>
                          <span className="text-white font-mono text-xs">{product.code_barre}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Garantie:</span>
                        <span className="text-white">
                          {product.garantie}
                        </span>
                      </div>
                      {product.notes && (
                        <div className="text-sm">
                          <span className="text-gray-400">Notes:</span>
                          <p className="text-gray-300 text-xs mt-1 line-clamp-2">{product.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                      <Button
                        onClick={() => navigate(`/composants-pc/${product.id}`)}
                        variant="outline"
                        size="sm"
                        className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir détails
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEditDialog(product)}
                          variant="ghost"
                          size="sm"
                          className="text-gaming-purple hover:bg-gaming-purple/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id!)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-400/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Cpu className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Aucun composant PC trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 