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
import { Checkbox } from "@/components/ui/checkbox";
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
  TrendingUp,
  Barcode,
  ChevronDown,
  ChevronRight,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePcPortables, PcPortable, NewPcPortable } from "@/hooks/usePcPortables";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useNavigate } from "react-router-dom";
import { AssignProductDialog } from "@/components/AssignProductDialog";
import { AddSupplierDialog } from "@/components/AddSupplierDialog";
import { uploadImageByType, uploadImageFromBase64ByType } from "@/lib/imageUpload";

// Marques par défaut - seront gérées via les paramètres plus tard
const marques = ["Acemajic", "Acer", "Alienware", "Apple", "ASUS", "Clevo", "Dell", "Gigabyte", "HP", "Lenovo", "MSI", "Razer", "Samsung"];
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

// Taux de rafraîchissement
const tauxRafraichissement = [
  "60Hz", "75Hz", "90Hz", "120Hz", "144Hz", "165Hz", "240Hz", "300Hz", "360Hz"
];

// VRAM des cartes graphiques
const vramOptions = [
  "2GB", "3GB", "4GB", "6GB", "8GB", "10GB", "12GB", "16GB", "20GB", "24GB"
];

// Vitesses RAM
const vitessesRAM = [
  "2133MHz", "2400MHz", "2666MHz", "2933MHz", "3000MHz", "3200MHz", 
  "3600MHz", "4000MHz", "4400MHz", "4800MHz", "5200MHz", "5600MHz", "6000MHz"
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
  const { suppliers, loading: loadingSuppliers, refreshSuppliers } = useSuppliers();
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
    marque: { isCustom: false, value: "" },
    processeur: { isCustom: false, value: "" },
    ram: { isCustom: false, value: "" },
    vitesse_ram: { isCustom: false, value: "" },
    stockage: { isCustom: false, value: "" },
    carte_graphique: { isCustom: false, value: "" },
    ecran: { isCustom: false, value: "" },
    taille_ecran: { isCustom: false, value: "" },
    resolution_ecran: { isCustom: false, value: "" },
    taux_rafraichissement: { isCustom: false, value: "" },
    vram_carte_graphique: { isCustom: false, value: "" }
  });

  // États pour la saisie multiple de codes-barres
  const [isMultipleBarcodeMode, setIsMultipleBarcodeMode] = useState(false);
  const [multipleBarcodes, setMultipleBarcodes] = useState<string[]>([""]);
  const [multipleDepots, setMultipleDepots] = useState<('magasin principal' | 'depot')[]>(["magasin principal"]);
  const [multipleSuppliers, setMultipleSuppliers] = useState<string[]>(["none"]);
  
  // État pour gérer l'expansion des groupes de produits
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
    garantie: "",
    depot: "magasin principal"
  });
  
  const { toast } = useToast();

  // Fonction pour gérer l'ajout d'un nouveau fournisseur
  const handleSupplierAdded = async (supplierId: string) => {
    // Rafraîchir la liste des fournisseurs
    await refreshSuppliers();
    
    // Sélectionner automatiquement le nouveau fournisseur
    setNewProduct(prev => ({ ...prev, fournisseur_id: supplierId }));
    
    toast({
      title: "Fournisseur ajouté",
      description: "Le nouveau fournisseur a été ajouté et sélectionné",
    });
  };

  const filteredProducts = pcPortables.filter(product => 
    product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.modele && product.modele.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.code_barre && product.code_barre.includes(searchTerm))
  );

  const handleAddProduct = async () => {
    const finalMarqueForValidation = customSpecs.marque.isCustom ? customSpecs.marque.value.trim() : (newProduct.marque || "").trim();
    if (!newProduct.nom_produit || !finalMarqueForValidation || !newProduct.prix_achat || !newProduct.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Validation pour le mode multiple codes-barres
    if (isMultipleBarcodeMode) {
      const validBarcodes = multipleBarcodes.filter(code => code.trim() !== "");
      if (validBarcodes.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir au moins un code-barres valide",
          variant: "destructive",
        });
        return;
      }
      
      // Vérifier la duplication des codes-barres
      const uniqueBarcodes = new Set(validBarcodes);
      if (uniqueBarcodes.size !== validBarcodes.length) {
        toast({
          title: "Erreur",
          description: "Les codes-barres doivent être uniques",
          variant: "destructive",
        });
        return;
      }
    }

    const statut = newProduct.stock_actuel === 0 
      ? "Rupture" 
      : newProduct.stock_actuel < (newProduct.stock_minimum || 1) 
        ? "Stock faible" 
        : "Disponible";

    // Créer le produit de base
    const baseProduct: NewPcPortable = {
      ...newProduct,
      marque: customSpecs.marque.isCustom ? customSpecs.marque.value : newProduct.marque,
      processeur: customSpecs.processeur.isCustom ? customSpecs.processeur.value : newProduct.processeur,
      ram: customSpecs.ram.isCustom ? customSpecs.ram.value : newProduct.ram,
      vitesse_ram: customSpecs.vitesse_ram.isCustom ? customSpecs.vitesse_ram.value : newProduct.vitesse_ram,
      stockage: customSpecs.stockage.isCustom ? customSpecs.stockage.value : newProduct.stockage,
      carte_graphique: customSpecs.carte_graphique.isCustom ? customSpecs.carte_graphique.value : newProduct.carte_graphique,
      vram_carte_graphique: customSpecs.vram_carte_graphique.isCustom ? customSpecs.vram_carte_graphique.value : newProduct.vram_carte_graphique,
      ecran: customSpecs.ecran.isCustom ? customSpecs.ecran.value : newProduct.ecran,
      taille_ecran: customSpecs.taille_ecran.isCustom ? customSpecs.taille_ecran.value : newProduct.taille_ecran,
      resolution_ecran: customSpecs.resolution_ecran.isCustom ? customSpecs.resolution_ecran.value : newProduct.resolution_ecran,
      taux_rafraichissement: customSpecs.taux_rafraichissement.isCustom ? customSpecs.taux_rafraichissement.value : newProduct.taux_rafraichissement,
      statut: statut as "Disponible" | "Stock faible" | "Rupture" | "Réservé" | "Archivé",
    };

    try {
      if (isMultipleBarcodeMode) {
        // Mode multiple : créer un produit pour chaque code-barres
        const validBarcodes = multipleBarcodes.filter(code => code.trim() !== "");
        let successCount = 0;
        
        for (let i = 0; i < validBarcodes.length; i++) {
          const barcode = validBarcodes[i];
          const depot = multipleDepots[i] || "magasin principal";
          const supplier = multipleSuppliers[i] === "none" ? "" : (multipleSuppliers[i] || "");
          
          // Calculer le statut pour cet exemplaire individuel (stock = 1)
          const stockMinimum = newProduct.stock_minimum || 1;
          const exemplaireStat = 1 < stockMinimum ? "Stock faible" : "Disponible";
          
          const productWithBarcode = {
            ...baseProduct,
            code_barre: barcode.trim(),
            depot: depot,
            fournisseur_id: supplier,
            stock_actuel: 1, // Chaque exemplaire est unique
            statut: exemplaireStat as "Disponible" | "Stock faible" | "Rupture" | "Réservé" | "Archivé"
          };
          
          const result = await addPcPortable(productWithBarcode);
          if (result) {
            successCount++;
          }
        }
        
        if (successCount > 0) {
          toast({
            title: "Produits ajoutés avec succès",
            description: `${successCount} exemplaire(s) de ${newProduct.nom_produit} ajouté(s) avec des codes-barres différents`,
          });
          resetForm();
          setIsAddDialogOpen(false);
        } else {
          toast({
            title: "Erreur",
            description: "Aucun produit n'a pu être ajouté",
            variant: "destructive",
          });
        }
      } else {
        // Mode normal : un seul produit
        const finalProduct = {
          ...baseProduct,
          code_barre: newProduct.code_barre || `PC${Date.now()}`,
        };

        const result = await addPcPortable(finalProduct);

        if (result) {
          resetForm();
          setIsAddDialogOpen(false);
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du/des produit(s)",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async () => {
    const finalMarqueForValidation = customSpecs.marque.isCustom ? customSpecs.marque.value.trim() : (newProduct.marque || "").trim();
    if (!editingProduct || !newProduct.nom_produit || !finalMarqueForValidation || !newProduct.prix_achat || !newProduct.prix_vente) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const statut = newProduct.stock_actuel === 0 
      ? "Rupture" 
      : newProduct.stock_actuel < (newProduct.stock_minimum || 1) 
        ? "Stock faible" 
        : "Disponible";

    // Utiliser les valeurs personnalisées si elles sont définies
    const finalProduct = {
      ...newProduct,
      marque: customSpecs.marque.isCustom ? customSpecs.marque.value : newProduct.marque,
      processeur: customSpecs.processeur.isCustom ? customSpecs.processeur.value : newProduct.processeur,
      ram: customSpecs.ram.isCustom ? customSpecs.ram.value : newProduct.ram,
      vitesse_ram: customSpecs.vitesse_ram.isCustom ? customSpecs.vitesse_ram.value : newProduct.vitesse_ram,
      stockage: customSpecs.stockage.isCustom ? customSpecs.stockage.value : newProduct.stockage,
      carte_graphique: customSpecs.carte_graphique.isCustom ? customSpecs.carte_graphique.value : newProduct.carte_graphique,
      vram_carte_graphique: customSpecs.vram_carte_graphique.isCustom ? customSpecs.vram_carte_graphique.value : newProduct.vram_carte_graphique,
      ecran: customSpecs.ecran.isCustom ? customSpecs.ecran.value : newProduct.ecran,
      taille_ecran: customSpecs.taille_ecran.isCustom ? customSpecs.taille_ecran.value : newProduct.taille_ecran,
      resolution_ecran: customSpecs.resolution_ecran.isCustom ? customSpecs.resolution_ecran.value : newProduct.resolution_ecran,
      taux_rafraichissement: customSpecs.taux_rafraichissement.isCustom ? customSpecs.taux_rafraichissement.value : newProduct.taux_rafraichissement,
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
      vitesse_ram: "",
      stockage: "",
      carte_graphique: "",
      vram_carte_graphique: "",
      ecran: "",
      taille_ecran: "",
      resolution_ecran: "",
      taux_rafraichissement: "",
      etat: "Neuf",
      prix_achat: 0,
      prix_vente: 0,
      stock_actuel: 0,
      stock_minimum: 1,
      image_url: "",
      fournisseur_id: "",
      garantie: "",
      depot: "magasin principal"
    });
    setCustomSpecs({
      marque: { isCustom: false, value: "" },
      processeur: { isCustom: false, value: "" },
      ram: { isCustom: false, value: "" },
      vitesse_ram: { isCustom: false, value: "" },
      stockage: { isCustom: false, value: "" },
      carte_graphique: { isCustom: false, value: "" },
      ecran: { isCustom: false, value: "" },
      taille_ecran: { isCustom: false, value: "" },
      resolution_ecran: { isCustom: false, value: "" },
      taux_rafraichissement: { isCustom: false, value: "" },
      vram_carte_graphique: { isCustom: false, value: "" }
    });
    setIsMultipleBarcodeMode(false);
    setMultipleBarcodes([""]);
    setMultipleDepots(["magasin principal"]);
    setMultipleSuppliers(["none"]);
    setImagePreview("");
    stopCamera();
  };

  const openEditDialog = (product: PcPortable) => {
    setEditingProduct(product);
    
    // Vérifier si les valeurs existent dans les listes prédéfinies
    const marqueIsCustom = !marques.includes(product.marque);
    const processeurIsCustom = !processeurs.includes(product.processeur);
    const ramIsCustom = !typesRAM.includes(product.ram);
    const stockageIsCustom = !typesStockage.includes(product.stockage);
    const carteGraphiqueIsCustom = product.carte_graphique && !cartesGraphiques.includes(product.carte_graphique);
    const ecranIsCustom = product.ecran && ![...taillesEcran, ...resolutionsEcran].includes(product.ecran);
    const tailleEcranIsCustom = product.taille_ecran && !taillesEcran.includes(product.taille_ecran);
    const resolutionEcranIsCustom = product.resolution_ecran && !resolutionsEcran.includes(product.resolution_ecran);
    const tauxRafraichissementIsCustom = product.taux_rafraichissement && !tauxRafraichissement.includes(product.taux_rafraichissement);
    const vramIsCustom = product.vram_carte_graphique && !vramOptions.includes(product.vram_carte_graphique);

    setCustomSpecs({
      marque: { isCustom: marqueIsCustom, value: marqueIsCustom ? product.marque : "" },
      processeur: { isCustom: processeurIsCustom, value: processeurIsCustom ? product.processeur : "" },
      ram: { isCustom: ramIsCustom, value: ramIsCustom ? product.ram : "" },
      vitesse_ram: { isCustom: false, value: product.vitesse_ram || "" },
      stockage: { isCustom: stockageIsCustom, value: stockageIsCustom ? product.stockage : "" },
      carte_graphique: { isCustom: carteGraphiqueIsCustom, value: carteGraphiqueIsCustom ? product.carte_graphique || "" : "" },
      ecran: { isCustom: ecranIsCustom, value: ecranIsCustom ? product.ecran || "" : "" },
      taille_ecran: { isCustom: tailleEcranIsCustom, value: tailleEcranIsCustom ? product.taille_ecran || "" : "" },
      resolution_ecran: { isCustom: resolutionEcranIsCustom, value: resolutionEcranIsCustom ? product.resolution_ecran || "" : "" },
      taux_rafraichissement: { isCustom: tauxRafraichissementIsCustom, value: tauxRafraichissementIsCustom ? product.taux_rafraichissement || "" : "" },
      vram_carte_graphique: { isCustom: vramIsCustom, value: vramIsCustom ? product.vram_carte_graphique || "" : "" }
    });

    setNewProduct({
      nom_produit: product.nom_produit,
      code_barre: product.code_barre || "",
      marque: marqueIsCustom ? "CUSTOM" : product.marque,
      modele: product.modele || "",
      processeur: processeurIsCustom ? "CUSTOM" : product.processeur,
      ram: ramIsCustom ? "CUSTOM" : product.ram,
      vitesse_ram: product.vitesse_ram || "",
      stockage: stockageIsCustom ? "CUSTOM" : product.stockage,
      carte_graphique: carteGraphiqueIsCustom ? "CUSTOM" : (product.carte_graphique || ""),
      vram_carte_graphique: vramIsCustom ? "CUSTOM" : (product.vram_carte_graphique || ""),
      ecran: ecranIsCustom ? "CUSTOM" : (product.ecran || ""),
      taille_ecran: tailleEcranIsCustom ? "CUSTOM" : (product.taille_ecran || ""),
      resolution_ecran: resolutionEcranIsCustom ? "CUSTOM" : (product.resolution_ecran || ""),
      taux_rafraichissement: tauxRafraichissementIsCustom ? "CUSTOM" : (product.taux_rafraichissement || ""),
      etat: product.etat,
      prix_achat: product.prix_achat,
      prix_vente: product.prix_vente,
      stock_actuel: product.stock_actuel,
      stock_minimum: product.stock_minimum,
      image_url: product.image_url || "",
      fournisseur_id: product.fournisseur_id || "",
      garantie: product.garantie || "",
      depot: product.depot
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
      if (field === 'marque') {
        setNewProduct(prev => ({ ...prev, marque: 'CUSTOM' as any }));
      } else {
        setNewProduct(prev => ({ ...prev, [field]: "CUSTOM" } as any));
      }
    } else {
      setCustomSpecs(prev => ({
        ...prev,
        [field]: { isCustom: false, value: "" }
      }));
      if (field === 'marque') {
        setNewProduct(prev => ({ ...prev, marque: value }));
      } else {
        setNewProduct(prev => ({ ...prev, [field]: value } as any));
      }
    }
  };

  // Fonction pour gérer les changements de valeurs personnalisées
  const handleCustomValueChange = (field: keyof typeof customSpecs, value: string) => {
    setCustomSpecs(prev => ({
      ...prev,
      [field]: { ...prev[field], value }
    }));
  };

  // Fonctions pour gérer les codes-barres multiples
  const addBarcodeField = () => {
    setMultipleBarcodes([...multipleBarcodes, ""]);
    setMultipleDepots([...multipleDepots, "magasin principal"]);
    setMultipleSuppliers([...multipleSuppliers, "none"]);
  };

  const removeBarcodeField = (index: number) => {
    if (multipleBarcodes.length > 1) {
      setMultipleBarcodes(multipleBarcodes.filter((_, i) => i !== index));
      setMultipleDepots(multipleDepots.filter((_, i) => i !== index));
      setMultipleSuppliers(multipleSuppliers.filter((_, i) => i !== index));
    }
  };

  const updateBarcodeField = (index: number, value: string) => {
    const newBarcodes = [...multipleBarcodes];
    newBarcodes[index] = value;
    setMultipleBarcodes(newBarcodes);
  };

  const updateDepotField = (index: number, value: 'magasin principal' | 'depot') => {
    const newDepots = [...multipleDepots];
    newDepots[index] = value;
    setMultipleDepots(newDepots);
  };

  const updateSupplierField = (index: number, value: string) => {
    const newSuppliers = [...multipleSuppliers];
    newSuppliers[index] = value;
    setMultipleSuppliers(newSuppliers);
  };

  // Fonction pour gérer l'expansion des groupes
  const toggleGroupExpansion = (productKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(productKey)) {
      newExpanded.delete(productKey);
    } else {
      newExpanded.add(productKey);
    }
    setExpandedGroups(newExpanded);
  };

  const stats = getStockStats();
  const priceStats = getPriceStats(filteredProducts);

  // Fonction pour regrouper les produits par nom et modèle
  const getGroupedProducts = () => {
    const groups: { [key: string]: PcPortable[] } = {};
    
    filteredProducts.forEach(product => {
      const key = `${product.nom_produit}-${product.marque}-${product.modele || ''}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(product);
    });

    return Object.values(groups).map(group => {
      const representative = group[0]; // Premier produit comme représentant
      const totalStock = group.reduce((sum, p) => sum + p.stock_actuel, 0);
      const exemplaires = group.length;
      
      return {
        ...representative,
        groupedStock: totalStock,
        exemplairesCount: exemplaires,
        exemplaires: group
      };
    });
  };

  const groupedProducts = getGroupedProducts();

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
      <div className={`flex items-center ${embedded ? 'justify-end' : 'justify-between'}`}>
        {!embedded && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-gaming-cyan" />
              Gestion des PC Portables
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
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="code_barre">Code-barres</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="multiple_barcodes"
                        checked={isMultipleBarcodeMode}
                        onCheckedChange={(checked) => {
                          setIsMultipleBarcodeMode(checked as boolean);
                          if (checked) {
                            setMultipleBarcodes([""]);
                            setMultipleDepots(["magasin principal"]);
                            setMultipleSuppliers(["none"]);
                            setNewProduct({ ...newProduct, code_barre: "" });
                          } else {
                            setMultipleBarcodes([""]);
                            setMultipleDepots(["magasin principal"]);
                            setMultipleSuppliers(["none"]);
                          }
                        }}
                      />
                      <Label htmlFor="multiple_barcodes" className="text-sm text-gaming-cyan font-medium cursor-pointer">
                        Saisie multiple (traçabilité)
                      </Label>
                    </div>
                  </div>
                  
                  {isMultipleBarcodeMode ? (
                    <div className="space-y-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <Barcode className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-blue-800 font-medium">Mode traçabilité activé</p>
                            <p className="text-blue-600">Saisissez plusieurs codes-barres pour créer plusieurs exemplaires du même produit avec une traçabilité individuelle et des emplacements de stockage spécifiques.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 text-sm font-medium text-gray-700 px-1">
                        <div className="flex-1">Code-barres</div>
                        <div className="flex-1">Lieu de stockage</div>
                        <div className="flex-1">Fournisseur</div>
                        <div className="w-10"></div>
                      </div>
                      
                      {multipleBarcodes.map((barcode, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              value={barcode}
                              onChange={(e) => updateBarcodeField(index, e.target.value)}
                              className="bg-white border-gray-200"
                              placeholder={`Code-barres ${index + 1}`}
                            />
                          </div>
                          <div className="flex-1">
                            <Select 
                              value={multipleDepots[index] || "magasin principal"} 
                              onValueChange={(value: 'magasin principal' | 'depot') => updateDepotField(index, value)}
                            >
                              <SelectTrigger className="bg-white border-gray-200">
                                <SelectValue placeholder="Sélectionner le dépôt" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-200">
                                <SelectItem value="magasin principal">🏪 Magasin principal</SelectItem>
                                <SelectItem value="depot">📦 Dépôt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Select 
                              value={multipleSuppliers[index] || "none"} 
                              onValueChange={(value: string) => updateSupplierField(index, value)}
                            >
                              <SelectTrigger className="bg-white border-gray-200">
                                <SelectValue placeholder="Sélectionner un fournisseur" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-200">
                                <SelectItem value="none">Aucun fournisseur</SelectItem>
                                {suppliers.map((fournisseur) => (
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
                          {multipleBarcodes.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeBarcodeField(index)}
                              className="px-3 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBarcodeField}
                        className="w-full border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un code-barres
                      </Button>
                    </div>
                  ) : (
                    <Input
                      id="code_barre"
                      value={newProduct.code_barre}
                      onChange={(e) => setNewProduct({ ...newProduct, code_barre: e.target.value })}
                      className="bg-white border-gray-200"
                      placeholder="Scannez ou saisissez le code-barres"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marque">Marque *</Label>
                  <Select value={newProduct.marque} onValueChange={(value) => handleSpecChange('marque' as any, value)}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionner une marque" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {marques.map((marque) => (
                        <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                      ))}
                      <div className="border-t border-gray-200 my-1"></div>
                      <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                        ✏️ Autre - Saisie manuelle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {(customSpecs as any).marque?.isCustom && (
                    <Input
                      className="mt-2 bg-white border-gray-200"
                      placeholder="Saisissez la marque personnalisée"
                      value={(customSpecs as any).marque.value}
                      onChange={(e) => handleCustomValueChange('marque' as any, e.target.value)}
                    />
                  )}
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

              {/* Caractéristiques de l'écran */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques de l'écran</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="taille_ecran">Taille d'écran</Label>
                    <Select value={newProduct.taille_ecran} onValueChange={(value) => handleSpecChange('taille_ecran', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la taille" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {taillesEcran.map((taille) => (
                          <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.taille_ecran.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez la taille personnalisée"
                        value={customSpecs.taille_ecran.value}
                        onChange={(e) => handleCustomValueChange('taille_ecran', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="resolution_ecran">Résolution</Label>
                    <Select value={newProduct.resolution_ecran} onValueChange={(value) => handleSpecChange('resolution_ecran', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la résolution" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {resolutionsEcran.map((resolution) => (
                          <SelectItem key={resolution} value={resolution}>{resolution}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.resolution_ecran.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez la résolution personnalisée"
                        value={customSpecs.resolution_ecran.value}
                        onChange={(e) => handleCustomValueChange('resolution_ecran', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="taux_rafraichissement">Taux de rafraîchissement</Label>
                    <Select value={newProduct.taux_rafraichissement} onValueChange={(value) => handleSpecChange('taux_rafraichissement', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner le taux" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {tauxRafraichissement.map((taux) => (
                          <SelectItem key={taux} value={taux}>{taux}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.taux_rafraichissement.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez le taux personnalisé"
                        value={customSpecs.taux_rafraichissement.value}
                        onChange={(e) => handleCustomValueChange('taux_rafraichissement', e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Spécifications techniques */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spécifications techniques</h3>
                
                <div className="grid grid-cols-3 gap-4">
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
                  <div>
                    <Label htmlFor="vitesse_ram">Vitesse RAM</Label>
                    <Select value={newProduct.vitesse_ram} onValueChange={(value) => handleSpecChange('vitesse_ram', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la vitesse" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {vitessesRAM.map((vitesse) => (
                          <SelectItem key={vitesse} value={vitesse}>{vitesse}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.vitesse_ram.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez la vitesse personnalisée"
                        value={customSpecs.vitesse_ram.value}
                        onChange={(e) => handleCustomValueChange('vitesse_ram', e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
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
                  <div>
                    <Label htmlFor="vram_carte_graphique">VRAM</Label>
                    <Select value={newProduct.vram_carte_graphique} onValueChange={(value) => handleSpecChange('vram_carte_graphique', value)}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Sélectionner la VRAM" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-[200px]">
                        {vramOptions.map((vram) => (
                          <SelectItem key={vram} value={vram}>{vram}</SelectItem>
                        ))}
                        <div className="border-t border-gray-200 my-1"></div>
                        <SelectItem value="CUSTOM" className="text-gaming-cyan font-medium">
                          ✏️ Autre - Saisie manuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {customSpecs.vram_carte_graphique.isCustom && (
                      <Input
                        className="mt-2 bg-white border-gray-200"
                        placeholder="Saisissez la VRAM personnalisée"
                        value={customSpecs.vram_carte_graphique.value}
                        onChange={(e) => handleCustomValueChange('vram_carte_graphique', e.target.value)}
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
                    <Label htmlFor="stock_actuel">
                      Stock actuel *
                      {isMultipleBarcodeMode && (
                        <span className="text-sm text-gray-500 ml-1">
                          (Auto: {multipleBarcodes.filter(b => b.trim() !== "").length} exemplaires)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="stock_actuel"
                      type="number"
                      value={isMultipleBarcodeMode ? multipleBarcodes.filter(b => b.trim() !== "").length : (newProduct.stock_actuel || "")}
                      onChange={(e) => {
                        if (!isMultipleBarcodeMode) {
                          setNewProduct({ ...newProduct, stock_actuel: parseInt(e.target.value) || 0 });
                        }
                      }}
                      className="bg-white border-gray-200"
                      placeholder="0"
                      disabled={isMultipleBarcodeMode}
                    />
                    {isMultipleBarcodeMode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Le stock est calculé automatiquement selon le nombre de codes-barres saisis
                      </p>
                    )}
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
                  {!isMultipleBarcodeMode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fournisseur">Fournisseur</Label>
                        <AddSupplierDialog 
                          onSupplierAdded={handleSupplierAdded}
                          trigger={
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                              <Plus className="w-4 h-4 mr-1" />
                              Ajouter
                            </Button>
                          }
                        />
                      </div>
                      <Select 
                        value={newProduct.fournisseur_id} 
                        onValueChange={(value) => setNewProduct({ ...newProduct, fournisseur_id: value })}
                        disabled={loadingSuppliers}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {suppliers.map((fournisseur) => (
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
                  )}
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
                  {!isMultipleBarcodeMode && (
                    <div>
                      <Label htmlFor="depot">Dépôt de stockage</Label>
                      <Select value={newProduct.depot} onValueChange={(value: 'magasin principal' | 'depot') => setNewProduct({ ...newProduct, depot: value })}>
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Sélectionner le dépôt" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="magasin principal">🏪 Magasin principal</SelectItem>
                          <SelectItem value="depot">📦 Dépôt</SelectItem>
                        </SelectContent>
                      </Select>
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
            {groupedProducts.length} produit(s) trouvé(s) • {filteredProducts.length} exemplaire(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {groupedProducts.map((group) => {
              const productKey = `${group.nom_produit}-${group.marque}-${group.modele || ''}`;
              const isExpanded = expandedGroups.has(productKey);
              
              return (
                <div key={productKey}>
                  {/* Produit principal (regroupé) */}
                  <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                          {group.image_url ? (
                            <img 
                              src={group.image_url} 
                              alt={group.nom_produit}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        {/* Informations principales */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-gray-900 font-medium text-lg">{group.nom_produit}</h3>
                              <p className="text-gaming-cyan text-sm">{group.marque} {group.modele}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gray-100 text-gray-700">
                                <Package className="w-3 h-3 mr-1" />
                                {group.exemplairesCount} exemplaire{group.exemplairesCount > 1 ? 's' : ''}
                              </Badge>
                              <Badge className={getStatutColor(group.statut)}>
                                Stock: {group.groupedStock}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Spécifications résumées */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Processeur:</span>
                              <p className="text-gray-900 truncate">{group.processeur}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">RAM:</span>
                              <p className="text-gray-900">{group.ram}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Stockage:</span>
                              <p className="text-gray-900">{group.stockage}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Prix:</span>
                              <p className="text-gaming-green font-semibold">{group.prix_vente} MAD</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => toggleGroupExpansion(productKey)}
                              variant="outline"
                              size="sm"
                              className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-gray-900"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                              {isExpanded ? 'Masquer' : 'Voir'} exemplaires
                            </Button>

                            {group.exemplairesCount > 1 && (
                              <AssignProductDialog
                                productId={group.id!}
                                productType="pc_portable"
                                productName={`${group.nom_produit} - ${group.marque} ${group.modele} (Groupe de ${group.exemplairesCount} exemplaires)`}
                                productCode={group.code_barre}
                                productEtat={group.etat}
                                trigger={
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-gray-900"
                                  >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Assigner un exemplaire
                                  </Button>
                                }
                              />
                            )}
                            
                            {group.exemplairesCount === 1 && (
                              <>
                                <Button
                                  onClick={() => navigate(`/pc-portable/${group.id}`)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-gray-900"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Détails
                                </Button>
                                
                                <Button
                                  onClick={() => openEditDialog(group)}
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Modifier
                                </Button>

                                <AssignProductDialog
                                  productId={group.id!}
                                  productType="pc_portable"
                                  productName={`${group.nom_produit} - ${group.marque} ${group.modele}`}
                                  productCode={group.code_barre}
                                  productEtat={group.etat}
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-gray-900"
                                    >
                                      <UserPlus className="w-4 h-4 mr-2" />
                                      Assigner
                                    </Button>
                                  }
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Exemplaires individuels (quand expandu) */}
                  {isExpanded && (
                    <div className="ml-8 mt-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Exemplaires individuels :</h4>
                      {group.exemplaires.map((exemplaire, index) => (
                        <Card key={exemplaire.id} className="bg-gray-50 border-gray-200">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Barcode className="w-4 h-4 text-gray-500" />
                                  <span className="font-mono text-sm text-gray-900">
                                    {exemplaire.code_barre || 'Non défini'}
                                  </span>
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    {(exemplaire as any).depot || 'Non défini'}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                  Stock: {exemplaire.stock_actuel} • 
                                  Statut: <span className={`font-medium ${exemplaire.statut === 'Disponible' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {exemplaire.statut}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => navigate(`/pc-portable/${exemplaire.id}`)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gaming-cyan text-gaming-cyan hover:bg-gaming-cyan hover:text-gray-900 h-8 px-2"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                
                                <Button
                                  onClick={() => openEditDialog(exemplaire)}
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white h-8 px-2"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>

                                <AssignProductDialog
                                  productId={exemplaire.id!}
                                  productType="pc_portable"
                                  productName={`${exemplaire.nom_produit} - ${exemplaire.marque} ${exemplaire.modele} (${exemplaire.code_barre})`}
                                  productCode={exemplaire.code_barre}
                                  productEtat={exemplaire.etat}
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white h-8 px-2"
                                    >
                                      <UserPlus className="w-3 h-3" />
                                    </Button>
                                  }
                                />
                                
                                <Button
                                  onClick={() => handleDeleteProduct(exemplaire.id!)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-8 px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {groupedProducts.length === 0 && (
              <div className="text-center py-8">
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