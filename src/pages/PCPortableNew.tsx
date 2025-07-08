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

// Processeurs Intel
const processeursIntel = [
  // Intel Core i3
  "Intel Core i3-1115G4", "Intel Core i3-1125G4", "Intel Core i3-1215U", "Intel Core i3-1220P",
  "Intel Core i3-12100H", "Intel Core i3-13100H",
  // Intel Core i5
  "Intel Core i5-1135G7", "Intel Core i5-1155G7", "Intel Core i5-1235U", "Intel Core i5-1240P",
  "Intel Core i5-1245U", "Intel Core i5-12450H", "Intel Core i5-12500H", "Intel Core i5-1335U",
  "Intel Core i5-1340P", "Intel Core i5-13420H", "Intel Core i5-13500H", "Intel Core i5-1350P",
  // Intel Core i7
  "Intel Core i7-1165G7", "Intel Core i7-1185G7", "Intel Core i7-1255U", "Intel Core i7-1260P",
  "Intel Core i7-1265U", "Intel Core i7-12650H", "Intel Core i7-12700H", "Intel Core i7-1355U",
  "Intel Core i7-1360P", "Intel Core i7-1365U", "Intel Core i7-13620H", "Intel Core i7-13700H",
  "Intel Core i7-1370P", "Intel Core i7-13750H",
  // Intel Core i9
  "Intel Core i9-12900H", "Intel Core i9-12900HK", "Intel Core i9-13900H", "Intel Core i9-13900HK",
  "Intel Core i9-13950HX", "Intel Core i9-13980HX"
];

// Processeurs AMD
const processeursAMD = [
  // AMD Ryzen 3
  "AMD Ryzen 3 5300U", "AMD Ryzen 3 7320U", "AMD Ryzen 3 7330U",
  // AMD Ryzen 5
  "AMD Ryzen 5 5500U", "AMD Ryzen 5 5600U", "AMD Ryzen 5 5625U", "AMD Ryzen 5 6600H",
  "AMD Ryzen 5 6600HS", "AMD Ryzen 5 7520U", "AMD Ryzen 5 7530U", "AMD Ryzen 5 7535HS",
  "AMD Ryzen 5 7535U", "AMD Ryzen 5 7540U", "AMD Ryzen 5 7600X", "AMD Ryzen 5 7640HS",
  "AMD Ryzen 5 7640U",
  // AMD Ryzen 7
  "AMD Ryzen 7 5700U", "AMD Ryzen 7 5800H", "AMD Ryzen 7 5800HS", "AMD Ryzen 7 6800H",
  "AMD Ryzen 7 6800HS", "AMD Ryzen 7 6800U", "AMD Ryzen 7 7730U", "AMD Ryzen 7 7735HS",
  "AMD Ryzen 7 7735U", "AMD Ryzen 7 7736U", "AMD Ryzen 7 7740HS", "AMD Ryzen 7 7840HS",
  "AMD Ryzen 7 7840U",
  // AMD Ryzen 9
  "AMD Ryzen 9 5900HX", "AMD Ryzen 9 5980HX", "AMD Ryzen 9 6900HX", "AMD Ryzen 9 6980HX",
  "AMD Ryzen 9 7940HS", "AMD Ryzen 9 7945HX"
];

// Processeurs Apple (pour MacBook)
const processeursApple = [
  "Apple M1", "Apple M1 Pro", "Apple M1 Max", "Apple M1 Ultra",
  "Apple M2", "Apple M2 Pro", "Apple M2 Max", "Apple M2 Ultra",
  "Apple M3", "Apple M3 Pro", "Apple M3 Max"
];

// Combiner tous les processeurs
const processeurs = [
  ...processeursIntel,
  ...processeursAMD,
  ...processeursApple
].sort();

// Cartes graphiques NVIDIA
const cartesGraphiquesNVIDIA = [
  // RTX 40 Series
  "NVIDIA GeForce RTX 4090", "NVIDIA GeForce RTX 4080", "NVIDIA GeForce RTX 4070 Ti",
  "NVIDIA GeForce RTX 4070", "NVIDIA GeForce RTX 4060 Ti", "NVIDIA GeForce RTX 4060",
  "NVIDIA GeForce RTX 4050",
  // RTX 30 Series
  "NVIDIA GeForce RTX 3080 Ti", "NVIDIA GeForce RTX 3080", "NVIDIA GeForce RTX 3070 Ti",
  "NVIDIA GeForce RTX 3070", "NVIDIA GeForce RTX 3060", "NVIDIA GeForce RTX 3050 Ti",
  "NVIDIA GeForce RTX 3050",
  // GTX Series
  "NVIDIA GeForce GTX 1660 Ti", "NVIDIA GeForce GTX 1650 Ti", "NVIDIA GeForce GTX 1650",
  // MX Series
  "NVIDIA GeForce MX570", "NVIDIA GeForce MX550", "NVIDIA GeForce MX450", "NVIDIA GeForce MX350"
];

// Cartes graphiques AMD
const cartesGraphiquesAMD = [
  // RX 7000 Series
  "AMD Radeon RX 7900M", "AMD Radeon RX 7800M", "AMD Radeon RX 7700S", "AMD Radeon RX 7600M XT",
  "AMD Radeon RX 7600M", "AMD Radeon RX 7500M",
  // RX 6000 Series
  "AMD Radeon RX 6850M XT", "AMD Radeon RX 6800M", "AMD Radeon RX 6700M", "AMD Radeon RX 6650M XT",
  "AMD Radeon RX 6650M", "AMD Radeon RX 6600M", "AMD Radeon RX 6500M", "AMD Radeon RX 6300M",
  // Vega et anciennes
  "AMD Radeon RX Vega 8", "AMD Radeon RX Vega 11"
];

// Graphiques intégrés
const graphiquesIntegres = [
  "Intel Iris Xe Graphics", "Intel UHD Graphics", "Intel HD Graphics 620",
  "AMD Radeon Graphics", "Apple GPU (intégré)"
];

// Combiner toutes les cartes graphiques
const cartesGraphiques = [
  "Aucune (Graphiques intégrés)",
  ...cartesGraphiquesNVIDIA,
  ...cartesGraphiquesAMD,
  ...graphiquesIntegres
].sort();

// Tailles d'écran
const taillesEcran = [
  '11.6"', '12.3"', '13.3"', '13.4"', '13.5"', '14"', '14.2"',
  '15.6"', '16"', '16.2"', '17.3"', '18.4"'
];

// Résolutions d'écran
const resolutionsEcran = [
  "HD (1366x768)", "Full HD (1920x1080)", "2K (2560x1440)", 
  "4K (3840x2160)", "Retina", "Touch Screen"
];

// Types de RAM
const typesRAM = [
  // DDR3
  "DDR3 4GB", "DDR3 8GB", "DDR3 16GB",
  // DDR4
  "DDR4 4GB", "DDR4 8GB", "DDR4 16GB", "DDR4 32GB", "DDR4 64GB",
  // DDR5
  "DDR5 8GB", "DDR5 16GB", "DDR5 32GB", "DDR5 64GB", "DDR5 128GB",
  // Configurations mixtes
  "8GB DDR4 (4GB x2)", "16GB DDR4 (8GB x2)", "32GB DDR4 (16GB x2)",
  "16GB DDR5 (8GB x2)", "32GB DDR5 (16GB x2)", "64GB DDR5 (32GB x2)"
];

// Types de stockage
const typesStockage = [
  "SSD 128GB", "SSD 256GB", "SSD 512GB", "SSD 1TB", "SSD 2TB",
  "NVMe 256GB", "NVMe 512GB", "NVMe 1TB", "NVMe 2TB",
  "HDD 500GB", "HDD 1TB", "HDD 2TB",
  "SSD 256GB + HDD 1TB", "SSD 512GB + HDD 1TB", "SSD 1TB + HDD 1TB"
];

export default function PCPortableNew({ embedded = false }: { embedded?: boolean }) {
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

  // États pour la saisie manuelle des spécifications
  const [customSpecs, setCustomSpecs] = useState({
    processeur: { isCustom: false, value: "" },
    ram: { isCustom: false, value: "" },
    stockage: { isCustom: false, value: "" },
    carte_graphique: { isCustom: false, value: "" },
    ecran: { isCustom: false, value: "" }
  });

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

    // Utiliser les valeurs personnalisées si elles sont définies
    const finalProduct: NewPcPortable = {
      ...newProduct,
      processeur: customSpecs.processeur.isCustom ? customSpecs.processeur.value : newProduct.processeur,
      ram: customSpecs.ram.isCustom ? customSpecs.ram.value : newProduct.ram,
      stockage: customSpecs.stockage.isCustom ? customSpecs.stockage.value : newProduct.stockage,
      carte_graphique: customSpecs.carte_graphique.isCustom ? customSpecs.carte_graphique.value : newProduct.carte_graphique,
      ecran: customSpecs.ecran.isCustom ? customSpecs.ecran.value : newProduct.ecran,
      code_barre: newProduct.code_barre || `PC${Date.now()}`,
      statut: statut as "Disponible" | "Stock faible" | "Rupture" | "Réservé" | "Archivé",
    };

    const result = await addPcPortable(finalProduct);

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

    // Utiliser les valeurs personnalisées si elles sont définies
    const finalProduct = {
      ...newProduct,
      processeur: customSpecs.processeur.isCustom ? customSpecs.processeur.value : newProduct.processeur,
      ram: customSpecs.ram.isCustom ? customSpecs.ram.value : newProduct.ram,
      stockage: customSpecs.stockage.isCustom ? customSpecs.stockage.value : newProduct.stockage,
      carte_graphique: customSpecs.carte_graphique.isCustom ? customSpecs.carte_graphique.value : newProduct.carte_graphique,
      ecran: customSpecs.ecran.isCustom ? customSpecs.ecran.value : newProduct.ecran,
      statut: statut as "Disponible" | "Stock faible" | "Rupture" | "Réservé" | "Archivé",
    };

    const result = await updatePcPortable(editingProduct.id, finalProduct);

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
    setCustomSpecs({
      processeur: { isCustom: false, value: "" },
      ram: { isCustom: false, value: "" },
      stockage: { isCustom: false, value: "" },
      carte_graphique: { isCustom: false, value: "" },
      ecran: { isCustom: false, value: "" }
    });
    setImagePreview("");
    stopCamera();
  };

  const openEditDialog = (product: PcPortable) => {
    setEditingProduct(product);
    
    // Vérifier si les valeurs existent dans les listes prédéfinies
    const processeurIsCustom = !processeurs.includes(product.processeur);
    const ramIsCustom = !typesRAM.includes(product.ram);
    const stockageIsCustom = !typesStockage.includes(product.stockage);
    const carteGraphiqueIsCustom = product.carte_graphique && !cartesGraphiques.includes(product.carte_graphique);
    const ecranIsCustom = product.ecran && ![...taillesEcran, ...resolutionsEcran].includes(product.ecran);

    setCustomSpecs({
      processeur: { isCustom: processeurIsCustom, value: processeurIsCustom ? product.processeur : "" },
      ram: { isCustom: ramIsCustom, value: ramIsCustom ? product.ram : "" },
      stockage: { isCustom: stockageIsCustom, value: stockageIsCustom ? product.stockage : "" },
      carte_graphique: { isCustom: carteGraphiqueIsCustom, value: carteGraphiqueIsCustom ? product.carte_graphique || "" : "" },
      ecran: { isCustom: ecranIsCustom, value: ecranIsCustom ? product.ecran || "" : "" }
    });

    setNewProduct({
      nom_produit: product.nom_produit,
      code_barre: product.code_barre || "",
      marque: product.marque,
      modele: product.modele || "",
      processeur: processeurIsCustom ? "CUSTOM" : product.processeur,
      ram: ramIsCustom ? "CUSTOM" : product.ram,
      stockage: stockageIsCustom ? "CUSTOM" : product.stockage,
      carte_graphique: carteGraphiqueIsCustom ? "CUSTOM" : (product.carte_graphique || ""),
      ecran: ecranIsCustom ? "CUSTOM" : (product.ecran || ""),
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
      case 'Archivé': return 'bg-gray-200';
      default: return 'bg-gray-200';
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

  // Fonction pour gérer les changements de spécifications
  const handleSpecChange = (field: keyof typeof customSpecs, value: string) => {
    if (value === "CUSTOM") {
      setCustomSpecs(prev => ({
        ...prev,
        [field]: { isCustom: true, value: "" }
      }));
      setNewProduct(prev => ({ ...prev, [field]: "CUSTOM" }));
    } else {
      setCustomSpecs(prev => ({
        ...prev,
        [field]: { isCustom: false, value: "" }
      }));
      setNewProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  // Fonction pour gérer les changements de valeurs personnalisées
  const handleCustomValueChange = (field: keyof typeof customSpecs, value: string) => {
    setCustomSpecs(prev => ({
      ...prev,
      [field]: { ...prev[field], value }
    }));
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
                  <Laptop className="w-8 h-8 text-gaming-cyan" />
                  PC Portables
                </h1>
                <p className="text-gray-600">Gestion du stock des ordinateurs portables</p>
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
              <Laptop className="w-6 h-6 text-gaming-cyan" />
              PC Portables
            </h2>
            <p className="text-gray-600">Gestion du stock des ordinateurs portables</p>
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
              Nouveau PC Portable
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Modifier le PC Portable" : "Ajouter un nouveau PC Portable"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
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
                    className="bg-white border-gray-200"
                    placeholder="Ex: ASUS ROG Strix G15"
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

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="modele">Modèle</Label>
                  <Input
                    id="modele"
                    value={newProduct.modele}
                    onChange={(e) => setNewProduct({ ...newProduct, modele: e.target.value })}
                    className="bg-white border-gray-200"
                    placeholder="Ex: ROG Strix G15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ecran">Écran</Label>
                  <Select value={newProduct.ecran} onValueChange={(value) => handleSpecChange('ecran', value)}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionner la taille d'écran" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                      {taillesEcran.map((taille) => (
                        <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                      ))}
                      <div className="border-t border-gray-200 my-1"></div>
                      {resolutionsEcran.map((resolution) => (
                        <SelectItem key={resolution} value={resolution}>{resolution}</SelectItem>
                      ))}
                      <div className="border-t border-gray-200 my-1"></div>
                      <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                        ✏️ Autre - Saisie manuelle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {customSpecs.ecran.isCustom && (
                    <Input
                      className="mt-2 bg-white border-gray-200"
                      placeholder="Saisissez l'écran personnalisé"
                      value={customSpecs.ecran.value}
                      onChange={(e) => handleCustomValueChange('ecran', e.target.value)}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="etat">État *</Label>
                  <Select value={newProduct.etat} onValueChange={(value: 'Neuf' | 'Comme neuf' | 'Occasion') => setNewProduct({ ...newProduct, etat: value })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionner l'état" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {etats.map((etat) => (
                        <SelectItem key={etat} value={etat}>{etat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Spécifications techniques */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spécifications techniques</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="processeur">Processeur *</Label>
                    <Select value={newProduct.processeur} onValueChange={(value) => handleSpecChange('processeur', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner un processeur" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {processeurs.map((processeur) => (
                          <SelectItem key={processeur} value={processeur}>{processeur}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.processeur.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez le processeur personnalisé"
                        value={customSpecs.processeur.value}
                        onChange={(e) => handleCustomValueChange('processeur', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ram">Mémoire RAM *</Label>
                    <Select value={newProduct.ram} onValueChange={(value) => handleSpecChange('ram', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la RAM" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {typesRAM.map((ram) => (
                          <SelectItem key={ram} value={ram}>{ram}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.ram.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez la RAM personnalisée"
                        value={customSpecs.ram.value}
                        onChange={(e) => handleCustomValueChange('ram', e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="stockage">Stockage *</Label>
                    <Select value={newProduct.stockage} onValueChange={(value) => handleSpecChange('stockage', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner le stockage" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {typesStockage.map((stockage) => (
                          <SelectItem key={stockage} value={stockage}>{stockage}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.stockage.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez le stockage personnalisé"
                        value={customSpecs.stockage.value}
                        onChange={(e) => handleCustomValueChange('stockage', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="carte_graphique">Carte graphique</Label>
                    <Select value={newProduct.carte_graphique} onValueChange={(value) => handleSpecChange('carte_graphique', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la carte graphique" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {cartesGraphiques.map((carte) => (
                          <SelectItem key={carte} value={carte}>{carte}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.carte_graphique.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez la carte graphique personnalisée"
                        value={customSpecs.carte_graphique.value}
                        onChange={(e) => handleCustomValueChange('carte_graphique', e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="border-t border-gray-200 pt-4">
                <Label>Image du produit</Label>
                <div className="flex flex-col gap-4 mt-2">
                  {imagePreview && (
                    <div className="w-full max-w-md">
                      <img 
                        src={imagePreview} 
                        alt="Aperçu" 
                        className="w-full h-48 object-contain rounded-lg border border-gray-600"
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
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations commerciales</h3>
                
                <div className="grid grid-cols-4 gap-4">
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
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Select 
                      value={newProduct.fournisseur_id} 
                      onValueChange={(value) => setNewProduct({ ...newProduct, fournisseur_id: value })}
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
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
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
                <p className="text-sm text-gray-600">Total PC Portables</p>
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

      {/* Search Bar */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, marque, modèle ou code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Laptop className="w-5 h-5" />
            PC Portables
          </CardTitle>
          <CardDescription className="text-gray-600">
            {filteredProducts.length} PC portable(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white border-gray-200 hover:border-gaming-purple/50 transition-all">
                <CardContent className="p-4">
                  {/* Image */}
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.nom_produit}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-gray-500" />
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-medium text-lg">{product.nom_produit}</h3>
                      <p className="text-gaming-cyan text-sm">{product.marque} {product.modele}</p>
                      <Badge className="mt-1 text-xs bg-gray-200">{product.etat}</Badge>
                    </div>
                    <Badge className={`${getStatutColor(product.statut)} text-xs ml-2`}>
                      {product.statut}
                    </Badge>
                  </div>
                  
                  {/* Specs */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processeur:</span>
                      <span className="text-gray-900 truncate ml-2">{product.processeur}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">RAM:</span>
                      <span className="text-gray-900">{product.ram}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stockage:</span>
                      <span className="text-gray-900">{product.stockage}</span>
                    </div>
                    {product.carte_graphique && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">GPU:</span>
                        <span className="text-gray-900 truncate ml-2">{product.carte_graphique}</span>
                      </div>
                    )}
                    {product.ecran && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Écran:</span>
                        <span className="text-gray-900">{product.ecran}</span>
                      </div>
                    )}
                  </div>

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
                    {product.garantie && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Garantie:</span>
                        <span className="text-gray-600 text-sm">{product.garantie}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 pt-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => navigate(`/pc-portable-details/${product.id}`)}
                        variant="outline"
                        size="sm"
                        className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-gray-900"
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
                          className="w-full border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-gray-900"
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
                <p className="text-gray-600">Aucun PC portable trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 