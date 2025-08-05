import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Armchair,
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
import { useSuppliers } from "@/hooks/useSuppliers";
import { useChaisesGamingSupabase, type ChaiseGamingSupabase, type NewChaiseGamingSupabase } from "@/hooks/useChaisesGamingSupabase";
import { AssignProductDialog } from "@/components/AssignProductDialog";
import { uploadImageByType, uploadImageFromBase64ByType } from "@/lib/imageUpload";

// Marques de chaises gaming
const marques = ["DXRacer", "Secretlab", "Corsair", "Razer", "ASUS ROG", "MSI", "Noblechairs", "AKRacing", "Vertagear", "Cooler Master"];
const garanties = ["Sans garantie", "3 mois", "6 mois", "9 mois", "12 mois"];

export default function ChaisesGaming({ embedded = false }: { embedded?: boolean }) {
  const { suppliers, loading: loadingSuppliers } = useSuppliers();
  const { chaisesGaming, loading, addChaiseGaming, updateChaiseGaming, deleteChaiseGaming } = useChaisesGamingSupabase();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ChaiseGamingSupabase | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newProduct, setNewProduct] = useState<NewChaiseGamingSupabase>({
    nom_produit: "",
    code_barre: "",
    marque: "",
    prix_achat: 0,
    prix_vente: 0,
    stock_actuel: 0,
    stock_minimum: 1,
    image_url: "",
    fournisseur_id: "",
    garantie: "Sans garantie"
  });
  
  const { toast } = useToast();

  const filteredProducts = chaisesGaming.filter(product => 
    product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code_barre && product.code_barre.includes(searchTerm))
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-green-500';
      case 'Stock faible': return 'bg-yellow-500';
      case 'Rupture': return 'bg-red-500';
      case 'Réservé': return 'bg-blue-500';
      case 'Archivé': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Disponible': return <CheckCircle className="w-4 h-4" />;
      case 'Stock faible': return <AlertTriangle className="w-4 h-4" />;
      case 'Rupture': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.nom_produit || !newProduct.marque || !newProduct.prix_achat || !newProduct.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const success = await addChaiseGaming(newProduct);
    
    if (success) {
      resetForm();
      setIsAddDialogOpen(false);
    }
    setSubmitting(false);
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

    setSubmitting(true);
    const success = await updateChaiseGaming(editingProduct.id, newProduct);
    
    if (success) {
      resetForm();
      setEditingProduct(null);
      setIsAddDialogOpen(false);
    }
    setSubmitting(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette chaise gaming ?")) {
      await deleteChaiseGaming(id);
    }
  };

  const resetForm = () => {
    setNewProduct({
      nom_produit: "",
      code_barre: "",
      marque: "",
      prix_achat: 0,
      prix_vente: 0,
      stock_actuel: 0,
      stock_minimum: 1,
      image_url: "",
      fournisseur_id: "",
      garantie: "Sans garantie"
    });
    setImagePreview("");
    setShowCamera(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const result = await uploadImageByType(file, 'chaise-gaming');
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
          const result = await uploadImageFromBase64ByType(imageData, 'chaise-gaming');
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

  const openEditDialog = (product: ChaiseGamingSupabase) => {
    setEditingProduct(product);
    setNewProduct({
      nom_produit: product.nom_produit,
      code_barre: product.code_barre || "",
      marque: product.marque,
      prix_achat: product.prix_achat,
      prix_vente: product.prix_vente,
      stock_actuel: product.stock_actuel,
      stock_minimum: product.stock_minimum,
      image_url: product.image_url || "",
      fournisseur_id: product.fournisseur_id || "",
      garantie: product.garantie || "Sans garantie"
    });
    setImagePreview(product.image_url || "");
    setIsAddDialogOpen(true);
  };

  const getStockStats = () => {
    return {
      total: chaisesGaming.length,
      disponible: chaisesGaming.filter(p => p.statut === 'Disponible').length,
      stockFaible: chaisesGaming.filter(p => p.statut === 'Stock faible').length,
      rupture: chaisesGaming.filter(p => p.statut === 'Rupture').length
    };
  };

  // Fonction pour calculer les statistiques de prix basées sur les produits filtrés
  const getPriceStats = (products: ChaiseGamingSupabase[]) => {
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
    <div className={embedded ? "space-y-6" : "p-6 space-y-6 bg-background min-h-screen"}>
      {!embedded && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Armchair className="w-8 h-8 text-gaming-cyan" />
                  Chaises Gaming
                </h1>
                <p className="text-gray-600">Gestion du stock des chaises gaming</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* En-tête avec bouton d'ajout */}
      <div className={`flex items-center ${embedded ? 'justify-end' : 'justify-between'}`}>
        {!embedded && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Armchair className="w-5 h-5 text-gaming-cyan" />
              Gestion des Chaises Gaming
            </h2>
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
              Nouvelle Chaise Gaming
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Modifier la Chaise Gaming" : "Ajouter une nouvelle Chaise Gaming"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Remplissez les informations de la chaise gaming
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
                    className="bg-white border-gray-200"
                    placeholder="Ex: DXRacer Formula Series"
                  />
                </div>
                <div>
                  <Label htmlFor="code_barre">Code-barres</Label>
                  <Input
                    id="code_barre"
                    value={newProduct.code_barre}
                    onChange={(e) => setNewProduct({ ...newProduct, code_barre: e.target.value })}
                    className="bg-white border-gray-200"
                    placeholder="Scannez ou saisissez le code-barres"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="marque">Marque *</Label>
                <Select value={newProduct.marque} onValueChange={(value) => setNewProduct({ ...newProduct, marque: value })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Sélectionner une marque" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {marques.map((marque) => (
                      <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photo */}
              <div className="border-t border-gray-200 pt-4">
                <Label htmlFor="image">Photo du produit</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      className="bg-white border-gray-200 flex-1"
                      placeholder="URL de l'image"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
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
                      Upload
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="border-gray-600"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Photo
                    </Button>
                  </div>

                  {imagePreview && (
                    <div className="flex justify-center">
                      <img 
                        src={imagePreview} 
                        alt="Aperçu" 
                        className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}

                  {showCamera && (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-md mx-auto rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="flex justify-center gap-2">
                        <Button
                          type="button"
                          onClick={takePhoto}
                          className="gaming-gradient"
                        >
                          Capturer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={stopCamera}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations commerciales */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations commerciales</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prix_achat">Prix d'achat (MAD) *</Label>
                    <Input
                      id="prix_achat"
                      type="number"
                      value={newProduct.prix_achat || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, prix_achat: parseFloat(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
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
                      className="bg-white border-gray-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="stock_actuel">Stock actuel *</Label>
                    <Input
                      id="stock_actuel"
                      type="number"
                      value={newProduct.stock_actuel || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_actuel: parseInt(e.target.value) || 0 })}
                      className="bg-white border-gray-200"
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
                      className="bg-white border-gray-200"
                      placeholder="1"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="fournisseur_id">Fournisseur</Label>
                  <Select value={newProduct.fournisseur_id} onValueChange={(value) => setNewProduct({ ...newProduct, fournisseur_id: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>{supplier.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="garantie">Garantie</Label>
                  <Select value={newProduct.garantie} onValueChange={(value) => setNewProduct({ ...newProduct, garantie: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionner la garantie" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {garanties.map((garantie) => (
                        <SelectItem key={garantie} value={garantie}>{garantie}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="border-gray-600"
              >
                Annuler
              </Button>
              <Button
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                disabled={submitting}
                className="gaming-gradient"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
              <Armchair className="w-8 h-8 text-gaming-purple" />
              <div>
                <p className="text-sm text-gray-600">Total Chaises</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gaming-green/20 border-gaming-green/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-gaming-green" />
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disponible}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-600/20 border-yellow-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-gray-900">{stats.stockFaible}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-600/20 border-red-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">En rupture</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rupture}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-600/20 border-blue-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-600">Prix Total Achat</p>
                <p className="text-2xl font-bold text-gray-900">{priceStats.totalAchat.toLocaleString()} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600/20 border-emerald-600/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-600">Prix Total Vente</p>
                <p className="text-2xl font-bold text-gray-900">{priceStats.totalVente.toLocaleString()} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, marque ou code-barres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 text-gray-900"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-gray-800 border-gray-200 hover:border-gaming-purple/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 mb-1">{product.nom_produit}</CardTitle>
                  <CardDescription className="text-gray-600">{product.marque}</CardDescription>
                </div>
                <Badge className={`${getStatusColor(product.statut)} text-gray-900 flex items-center gap-1`}>
                  {getStatusIcon(product.statut)}
                  {product.statut}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Image */}
              {product.image_url && (
                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.nom_produit}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Commercial Info */}
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Prix d'achat:</span>
                  <span className="text-gaming-green font-semibold">{product.prix_achat} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Prix de vente:</span>
                  <span className="text-gaming-green font-semibold">{product.prix_vente} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Stock:</span>
                  <span className="text-gray-900">{product.stock_actuel} / {product.stock_minimum}</span>
                </div>
                {product.code_barre && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Code-barres:</span>
                    <span className="text-gray-600 text-sm">{product.code_barre}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-600 hover:bg-gray-100"
                  onClick={() => openEditDialog(product)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-gray-900"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="bg-gray-800 border-gray-200">
          <CardContent className="p-8 text-center">
            <Armchair className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune chaise gaming trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Aucun résultat pour votre recherche" : "Commencez par ajouter votre première chaise gaming"}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="gaming-gradient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une chaise gaming
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 