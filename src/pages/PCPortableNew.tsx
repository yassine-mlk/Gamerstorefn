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
  Laptop,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  Camera,
  Loader2,
  Eye,
  UserPlus,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePcPortables, PcPortable, NewPcPortable } from "@/hooks/usePcPortables";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useNavigate } from "react-router-dom";
import { AssignProductDialog } from "@/components/AssignProductDialog";
import { uploadImageByType, uploadImageFromBase64ByType } from "@/lib/imageUpload";

// Marques par défaut - seront gérées via les paramètres plus tard
const marques = ["ASUS", "Apple", "HP", "Dell", "Lenovo", "Acer", "MSI", "Alienware", "Razer", "Samsung"];
const garanties = ["Sans garantie", "3 mois", "6 mois", "9 mois", "12 mois"];
const etats = ["Neuf", "Comme neuf", "Occasion"];

export default function PCPortableNew() {
  const { pcPortables, loading, addPcPortable, updatePcPortable, deletePcPortable } = usePcPortables();
  const { suppliers, loading: loadingSuppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PcPortable | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState<NewPcPortable>({
    nom_produit: "",
    code_barre: "",
    marque: "",
    modele: "",
    processeur: "",
    ram: "",
    stockage: "",
    carte_graphique: "",
    ecran: "",
    etat: "Neuf",
    prix_achat: 0,
    prix_vente: 0,
    stock_actuel: 0,
    stock_minimum: 1,
    image_url: "",
    fournisseur_id: "",
    garantie: ""
  });
  
  const { toast } = useToast();

  const filteredProducts = pcPortables.filter(product => 
    product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.modele && product.modele.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.code_barre && product.code_barre.includes(searchTerm))
  );

  const handleAddProduct = async () => {
    if (!newProduct.nom_produit || !newProduct.marque || !newProduct.prix_achat || !newProduct.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const statut = newProduct.stock_actuel === 0 
      ? "Rupture" 
      : newProduct.stock_actuel <= (newProduct.stock_minimum || 1) 
        ? "Stock faible" 
        : "Disponible";

    const result = await addPcPortable({
      ...newProduct,
      code_barre: newProduct.code_barre || `PC${Date.now()}`,
      statut,
    });

    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !newProduct.nom_produit || !newProduct.marque || !newProduct.prix_achat || !newProduct.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const statut = newProduct.stock_actuel === 0 
      ? "Rupture" 
      : newProduct.stock_actuel <= (newProduct.stock_minimum || 1) 
        ? "Stock faible" 
        : "Disponible";

    const result = await updatePcPortable(editingProduct.id, {
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
    if (confirm("Êtes-vous sûr de vouloir supprimer ce PC portable ?")) {
      await deletePcPortable(id);
    }
  };

  const resetForm = () => {
    setNewProduct({
      nom_produit: "",
      code_barre: "",
      marque: "",
      modele: "",
      processeur: "",
      ram: "",
      stockage: "",
      carte_graphique: "",
      ecran: "",
      etat: "Neuf",
      prix_achat: 0,
      prix_vente: 0,
      stock_actuel: 0,
      stock_minimum: 1,
      image_url: "",
      fournisseur_id: "",
      garantie: ""
    });
    setImagePreview("");
    stopCamera();
  };

  const openEditDialog = (product: PcPortable) => {
    setEditingProduct(product);
    setNewProduct({
      nom_produit: product.nom_produit,
      code_barre: product.code_barre || "",
      marque: product.marque,
      modele: product.modele || "",
      processeur: product.processeur,
      ram: product.ram,
      stockage: product.stockage,
      carte_graphique: product.carte_graphique || "",
      ecran: product.ecran || "",
      etat: product.etat,
      prix_achat: product.prix_achat,
      prix_vente: product.prix_vente,
      stock_actuel: product.stock_actuel,
      stock_minimum: product.stock_minimum,
      image_url: product.image_url || "",
      fournisseur_id: product.fournisseur_id || "",
      garantie: product.garantie || ""
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
      default: return <Laptop className="w-4 h-4" />;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const result = await uploadImageByType(file, 'pc-portable');
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
          const result = await uploadImageFromBase64ByType(imageData, 'pc-portable');
          if (result.success && result.url) {
            setImagePreview(result.url);
            setNewProduct({ ...newProduct, image_url: result.url });
            stopCamera();
            toast({
              title: "Photo capturée",
              description: "La photo a été ajoutée au produit",
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
      total: pcPortables.length,
      disponible: pcPortables.filter(p => p.statut === 'Disponible').length,
      stockFaible: pcPortables.filter(p => p.statut === 'Stock faible').length,
      rupture: pcPortables.filter(p => p.statut === 'Rupture').length
    };
  };

  // Nouvelle fonction pour calculer les statistiques de prix basées sur les produits filtrés
  const getPriceStats = (products: PcPortable[]) => {
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
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Laptop className="w-8 h-8 text-gaming-cyan" />
              PC Portables
            </h1>
            <p className="text-gray-400">Gestion du stock des ordinateurs portables</p>
          </div>
        </div>
        
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
              Nouveau PC Portable
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Modifier le PC Portable" : "Ajouter un nouveau PC Portable"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Remplissez les informations du PC portable
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
                    placeholder="Ex: ASUS ROG Strix G15"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marque">Marque *</Label>
                  <Select value={newProduct.marque} onValueChange={(value) => setNewProduct({ ...newProduct, marque: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Sélectionner une marque" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {marques.map((marque) => (
                        <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="modele">Modèle</Label>
                  <Input
                    id="modele"
                    value={newProduct.modele}
                    onChange={(e) => setNewProduct({ ...newProduct, modele: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Ex: ROG Strix G15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ecran">Écran</Label>
                  <Input
                    id="ecran"
                    value={newProduct.ecran}
                    onChange={(e) => setNewProduct({ ...newProduct, ecran: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Ex: 15.6'' Full HD"
                  />
                </div>
                <div>
                  <Label htmlFor="etat">État *</Label>
                  <Select value={newProduct.etat} onValueChange={(value: 'Neuf' | 'Comme neuf' | 'Occasion') => setNewProduct({ ...newProduct, etat: value })}>
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
              </div>

              {/* Spécifications techniques */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Spécifications techniques</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="processeur">Processeur *</Label>
                    <Input
                      id="processeur"
                      value={newProduct.processeur}
                      onChange={(e) => setNewProduct({ ...newProduct, processeur: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: Intel Core i7-12700H"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ram">Mémoire RAM *</Label>
                    <Input
                      id="ram"
                      value={newProduct.ram}
                      onChange={(e) => setNewProduct({ ...newProduct, ram: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: 16 GB DDR5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="stockage">Stockage *</Label>
                    <Input
                      id="stockage"
                      value={newProduct.stockage}
                      onChange={(e) => setNewProduct({ ...newProduct, stockage: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: 512 GB SSD NVMe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carte_graphique">Carte graphique</Label>
                    <Input
                      id="carte_graphique"
                      value={newProduct.carte_graphique}
                      onChange={(e) => setNewProduct({ ...newProduct, carte_graphique: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: NVIDIA RTX 4060 8GB"
                    />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="border-t border-gray-700 pt-4">
                <Label>Image du produit</Label>
                <div className="flex flex-col gap-4 mt-2">
                  {imagePreview && (
                    <div className="w-full max-w-md">
                      <img 
                        src={imagePreview} 
                        alt="Aperçu" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
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
                      className="border-gray-600"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="border-gray-600"
                      onClick={showCamera ? stopCamera : startCamera}
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

              {/* Informations commerciales */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Informations commerciales</h3>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="prix_achat">Prix d'achat (MAD) *</Label>
                    <Input
                      id="prix_achat"
                      type="number"
                      value={newProduct.prix_achat || ""}
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
                      value={newProduct.prix_vente || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, prix_vente: parseFloat(e.target.value) || 0 })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_actuel">Stock actuel *</Label>
                    <Input
                      id="stock_actuel"
                      type="number"
                      value={newProduct.stock_actuel || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_actuel: parseInt(e.target.value) || 0 })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_minimum">Stock minimum</Label>
                    <Input
                      id="stock_minimum"
                      type="number"
                      value={newProduct.stock_minimum || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_minimum: parseInt(e.target.value) || 1 })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Select 
                      value={newProduct.fournisseur_id} 
                      onValueChange={(value) => setNewProduct({ ...newProduct, fournisseur_id: value })}
                      disabled={loadingSuppliers}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
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
                    <Label htmlFor="garantie">Garantie</Label>
                    <Select value={newProduct.garantie} onValueChange={(value) => setNewProduct({ ...newProduct, garantie: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue placeholder="Sélectionner la garantie" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {garanties.map((garantie) => (
                          <SelectItem key={garantie} value={garantie}>{garantie}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
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
              <Laptop className="w-8 h-8 text-gaming-purple" />
              <div>
                <p className="text-sm text-gray-400">Total PC Portables</p>
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

      {/* Search Bar */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, marque, modèle ou code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Laptop className="w-5 h-5" />
            PC Portables
          </CardTitle>
          <CardDescription className="text-gray-400">
            {filteredProducts.length} PC portable(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
                      <ImageIcon className="w-16 h-16 text-gray-500" />
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg">{product.nom_produit}</h3>
                      <p className="text-gaming-cyan text-sm">{product.marque} {product.modele}</p>
                      <Badge className="mt-1 text-xs bg-gray-600">{product.etat}</Badge>
                    </div>
                    <Badge className={`${getStatutColor(product.statut)} text-xs ml-2`}>
                      {product.statut}
                    </Badge>
                  </div>
                  
                  {/* Specs */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processeur:</span>
                      <span className="text-white truncate ml-2">{product.processeur}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">RAM:</span>
                      <span className="text-white">{product.ram}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Stockage:</span>
                      <span className="text-white">{product.stockage}</span>
                    </div>
                    {product.carte_graphique && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">GPU:</span>
                        <span className="text-white truncate ml-2">{product.carte_graphique}</span>
                      </div>
                    )}
                    {product.ecran && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Écran:</span>
                        <span className="text-white">{product.ecran}</span>
                      </div>
                    )}
                  </div>

                  {/* Commercial Info */}
                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prix d'achat:</span>
                      <span className="text-gaming-green font-semibold">{product.prix_achat} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prix de vente:</span>
                      <span className="text-gaming-green font-semibold">{product.prix_vente} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Stock:</span>
                      <span className="text-white">{product.stock_actuel} / {product.stock_minimum}</span>
                    </div>
                    {product.garantie && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Garantie:</span>
                        <span className="text-gray-300 text-sm">{product.garantie}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-700 pt-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => navigate(`/pc-portable/${product.id}`)}
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
                    
                    {/* Bouton d'assignation */}
                    <AssignProductDialog
                      productId={product.id!}
                      productType="pc_portable"
                      productName={product.nom_produit}
                      productCode={product.code_barre}
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
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Laptop className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Aucun PC portable trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 