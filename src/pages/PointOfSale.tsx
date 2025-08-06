import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  ShoppingCart,
  Plus,
  Scan,
  Trash2,
  Receipt,
  Banknote,
  Building,
  FileCheck,
  Package,
  Minus,
  Search,
  Grid3X3,
  Laptop,
  Monitor,
  Mouse,
  Armchair,
  Settings,
  Cpu,
  Percent,
  DollarSign,
  FileText,
  Check,
  Printer,
  RefreshCw,
  RotateCcw,
  User,
  UserPlus,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeProductId } from "@/utils/uuid";
import { usePcPortables } from "@/hooks/usePcPortables";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { usePeripheriques } from "@/hooks/usePeripheriques";
import { useChaisesGamingSupabase } from "@/hooks/useChaisesGamingSupabase";
import { usePCGamer } from "@/hooks/usePCGamer";
import { useComposantsPC } from "@/hooks/useComposantsPC";
import { useVentes, type VenteArticle, type PaiementDetaille } from "@/hooks/useVentes";
import { useClients } from "@/hooks/useClients";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { RepriseSystem } from "@/components/RepriseSystem";

interface CartItem {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  codeBarre: string;
  categorie: string;
  type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  stock_disponible: number;
  image_url?: string; // Nouveau: URL de l'image du produit
}

type ProductType = 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc' | '';

const productTypes = [
  { value: 'pc_portable', label: 'PC Portable', icon: Laptop },
  { value: 'moniteur', label: 'Moniteur', icon: Monitor },
  { value: 'peripherique', label: 'Périphérique', icon: Mouse },
  { value: 'chaise_gaming', label: 'Chaise Gaming', icon: Armchair },
  { value: 'pc_gamer', label: 'PC Gamer', icon: Settings },
  { value: 'composant_pc', label: 'Composants PC', icon: Cpu }
];

export default function PointOfSale() {
  // Hooks de données
  const { pcPortables, loading: loadingPC, refreshPcPortables } = usePcPortables();
  const { moniteurs, loading: loadingMoniteurs, refreshMoniteurs } = useMoniteurs();
  const { peripheriques, loading: loadingPeripheriques, fetchPeripheriques } = usePeripheriques();
  const { chaisesGaming, loading: loadingChaises, refreshChaisesGaming } = useChaisesGamingSupabase();
  const { pcGamerConfigs, loading: loadingPCGamer, refreshPCGamerConfigs } = usePCGamer();
  const { composantsPC, loading: loadingComposants, refreshComposantsPC } = useComposantsPC();
  const { createVente, loading: loadingVente } = useVentes();
  const { clients, loading: loadingClients, addClient, refreshClients } = useClients();
  const { comptes: bankAccounts, loading: loadingBankAccounts } = useBankAccounts();

  // États
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<ProductType>("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("especes");
  const [saleType, setSaleType] = useState("magasin");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [taxMode, setTaxMode] = useState<"with_tax" | "without_tax">("with_tax"); // Nouveau: mode de taxe
  
  // États pour les paiements avancés
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeEcheance, setChequeEcheance] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [mixedPayments, setMixedPayments] = useState([
    { type: "especes", amount: 0 },
    { type: "virement", amount: 0, account: "" }
  ]);
  
  // Nouveaux états pour les fonctionnalités demandées
  const [reductionMontant, setReductionMontant] = useState(0);
  const [showRecapitulatif, setShowRecapitulatif] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [venteFinalise, setVenteFinalise] = useState<any>(null);
  const [showRepriseSystem, setShowRepriseSystem] = useState(false);
  const [operationType, setOperationType] = useState<'vente' | 'reprise' | 'retour' | null>(null);
  
  // États pour l'ajout de client
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    statut: 'Actif',
    notes: '',
    type_client: 'particulier' as 'particulier' | 'societe',
    ice: ''
  });
  const [loadingAddClient, setLoadingAddClient] = useState(false);
  
  const { toast } = useToast();

  // Vérifier si les données sont en cours de chargement
  const isLoading = loadingPC || loadingMoniteurs || loadingPeripheriques || loadingChaises || loadingPCGamer || loadingComposants || loadingVente || loadingClients;

  // Mise à jour des filtres quand le type de produit change
  useEffect(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setShowProductSearch(false);
  }, [selectedProductType]);

  // Obtenir tous les produits selon le type sélectionné
  const getAllProducts = () => {
    let products: any[] = [];
    
    if (selectedProductType === 'pc_portable') {
      products = pcPortables.map(pc => ({
        id: pc.id,
        nom: pc.nom_produit,
        prix: pc.prix_vente,
        codeBarre: pc.code_barre || '',
        stock: pc.stock_actuel,
        categorie: 'PC Portable',
        type: 'pc_portable' as const,
        marque: pc.marque
      }));
    } else if (selectedProductType === 'moniteur') {
      products = moniteurs.map(moniteur => ({
        id: moniteur.id,
        nom: moniteur.nom_produit,
        prix: moniteur.prix_vente,
        codeBarre: moniteur.code_barre || '',
        stock: moniteur.stock_actuel,
        categorie: 'Moniteur',
        type: 'moniteur' as const,
        marque: moniteur.marque
      }));
    } else if (selectedProductType === 'peripherique') {
      products = peripheriques.map(periph => ({
        id: periph.id,
        nom: periph.nom_produit,
        prix: periph.prix_vente,
        codeBarre: periph.code_barre || '',
        stock: periph.stock_actuel,
        categorie: periph.categorie,
        type: 'peripherique' as const,
        marque: periph.marque || 'Non défini'
      }));
    } else if (selectedProductType === 'chaise_gaming') {
      products = chaisesGaming.map(chaise => ({
        id: chaise.id,
        nom: chaise.nom_produit,
        prix: chaise.prix_vente,
        codeBarre: chaise.code_barre || '',
        stock: chaise.stock_actuel,
        categorie: 'Chaise Gaming',
        type: 'chaise_gaming' as const,
        marque: chaise.marque
      }));
    } else if (selectedProductType === 'pc_gamer') {
      products = pcGamerConfigs
        .filter(config => config.statut === 'Actif' && config.stock_possible > 0)
        .map(config => ({
          id: config.id,
          nom: config.nom_config,
          prix: config.prix_vente,
          codeBarre: config.code_barre || '',
          stock: config.stock_possible,
          categorie: 'PC Gamer',
          type: 'pc_gamer' as const,
          marque: 'Configuration'
        }));
    } else if (selectedProductType === 'composant_pc') {
      products = composantsPC
        .filter(comp => comp.statut === 'Disponible' && comp.stock_actuel > 0)
        .map(comp => ({
          id: comp.id,
          nom: comp.nom_produit,
          prix: comp.prix_vente,
          codeBarre: comp.code_barre || '',
          stock: comp.stock_actuel,
          categorie: comp.categorie,
          type: 'composant_pc' as const,
          marque: 'Composant'
        }));
    }
    
    return products;
  };

  // Filtrer les produits selon la recherche et la catégorie
  const filteredProducts = getAllProducts().filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.codeBarre.includes(searchQuery);
    const matchesCategory = selectedCategory === "" || selectedCategory === "all" || product.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les catégories disponibles selon le type de produit
  const getAvailableCategories = () => {
    if (selectedProductType === 'pc_portable') {
      return ['PC Portable'];
    } else if (selectedProductType === 'moniteur') {
      return ['Moniteur'];
    } else if (selectedProductType === 'peripherique') {
      const categories = [...new Set(peripheriques.map(p => p.categorie))];
      return categories;
    } else if (selectedProductType === 'chaise_gaming') {
      return ['Chaise Gaming'];
    } else if (selectedProductType === 'pc_gamer') {
      return ['PC Gamer'];
    } else if (selectedProductType === 'composant_pc') {
      const categories = [...new Set(composantsPC.map(c => {
        // Convertir les catégories techniques en labels lisibles
        const labels: { [key: string]: string } = {
          'cpu': 'Processeur',
          'gpu': 'Carte graphique',
          'ram': 'Mémoire RAM',
          'disc': 'Stockage',
          'case': 'Boîtier',
          'mother_board': 'Carte mère',
          'power': 'Alimentation',
          'cooling': 'Refroidissement'
        };
        return labels[c.categorie] || c.categorie;
      }))];
      return categories;
    }
    return [];
  };

  const addToCartByBarcode = (barcode: string) => {
    if (!selectedProductType) {
      toast({
        title: "Type de produit requis",
        description: "Veuillez d'abord sélectionner un type de produit",
        variant: "destructive",
      });
      return;
    }

    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.codeBarre === barcode);
    
    if (!product) {
      toast({
        title: "Produit non trouvé",
        description: "Aucun produit trouvé avec ce code-barres",
        variant: "destructive",
      });
      return;
    }

    addProductToCart(product);
    setBarcodeInput("");
  };

  const addProductToCart = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "Stock insuffisant",
        description: "Ce produit n'est plus en stock",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantite >= product.stock) {
        toast({
          title: "Stock insuffisant",
          description: "Quantité maximum atteinte pour ce produit",
          variant: "destructive",
        });
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantite: item.quantite + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        nom: product.nom,
        prix: product.prix,
        quantite: 1,
        codeBarre: product.codeBarre,
        categorie: product.categorie,
        type: product.type,
        stock_disponible: product.stock,
        image_url: product.image_url // Ajouter l'image du produit
      }]);
    }

    toast({
      title: "Produit ajouté",
      description: `${product.nom} ajouté au panier`,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantite + change;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > product.stock) {
          toast({
            title: "Stock insuffisant",
            description: "Quantité maximum atteinte",
            variant: "destructive",
          });
          return item;
        }
        return { ...item, quantite: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.prix * item.quantite), 0);
  };

  const getTotalAvecReduction = () => {
    const sousTotal = getTotal();
    return Math.max(0, sousTotal - reductionMontant);
  };

  // Nouveau: Calculer le total selon le mode de taxe
  const getTotalWithTaxMode = () => {
    const totalAvecReduction = getTotalAvecReduction();
    
    if (taxMode === "with_tax") {
      // Si mode avec taxe, on ajoute 20% au prix HT du système
      return totalAvecReduction * 1.2;
    } else {
      // Si mode sans taxe, on garde le prix HT du système
      return totalAvecReduction;
    }
  };

  // Nouveau: Calculer le total HT (toujours le prix du système)
  const getTotalHT = () => {
    return getTotalAvecReduction();
  };

  // Nouveau: Calculer la TVA selon le mode de taxe
  const getTVA = () => {
    const totalAvecReduction = getTotalAvecReduction();
    
    if (taxMode === "with_tax") {
      // Si mode avec taxe, TVA = 20% du prix HT du système
      return totalAvecReduction * 0.2;
    } else {
      // Si mode sans taxe, pas de TVA
      return 0;
    }
  };

  const getPaymentIcon = (payment: string) => {
    switch (payment) {
      case 'carte': return <FileCheck className="w-4 h-4" />;
      case 'especes': return <Banknote className="w-4 h-4" />;
      case 'virement': return <Building className="w-4 h-4" />;
      case 'cheque': return <FileCheck className="w-4 h-4" />;
      case 'mixte': return <Building className="w-4 h-4" />;
      default: return <FileCheck className="w-4 h-4" />;
    }
  };

  // Fonctions pour les paiements avancés
  const updateMixedPayment = (index: number, field: string, value: any) => {
    const updated = [...mixedPayments];
    updated[index] = { ...updated[index], [field]: value };
    setMixedPayments(updated);
  };

  const addMixedPayment = () => {
    setMixedPayments([...mixedPayments, { type: "especes", amount: 0 }]);
  };

  const removeMixedPayment = (index: number) => {
    if (mixedPayments.length > 1) {
      setMixedPayments(mixedPayments.filter((_, i) => i !== index));
    }
  };

  const getMixedPaymentTotal = () => {
    return mixedPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
  };

  const validatePayment = () => {
    if (paymentMethod === "cheque") {
      if (!chequeNumber.trim()) {
        toast({
          title: "Numéro de chèque requis",
          description: "Veuillez saisir le numéro de chèque",
          variant: "destructive",
        });
        return false;
      }
      if (!chequeEcheance) {
        toast({
          title: "Date d'échéance requise",
          description: "Veuillez saisir la date d'échéance du chèque",
          variant: "destructive",
        });
        return false;
      }
    }

    if (paymentMethod === "virement" && !selectedAccount) {
      toast({
        title: "Compte bancaire requis",
        description: "Veuillez sélectionner le compte de réception",
        variant: "destructive",
      });
      return false;
    }

    if (paymentMethod === "mixte") {
      const totalAvecReduction = getTotalAvecReduction();
      const mixedTotal = getMixedPaymentTotal();
      
      if (Math.abs(totalAvecReduction - mixedTotal) > 0.01) {
        toast({
          title: "Montants incorrects",
          description: `Le total des paiements (${mixedTotal.toFixed(2)} MAD) ne correspond pas au total de la vente (${totalAvecReduction.toFixed(2)} MAD)`,
          variant: "destructive",
        });
        return false;
      }

      // Vérifier que les virements ont un compte sélectionné
      for (const payment of mixedPayments) {
        if (payment.type === "virement" && !payment.account) {
          toast({
            title: "Compte manquant",
            description: "Veuillez sélectionner un compte pour tous les virements",
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  // Fonctions pour l'ajout de client
  const handleAddClient = async () => {
    // Validation des champs obligatoires (seul le nom est obligatoire comme dans la page Clients)
    if (!newClientData.nom.trim()) {
      toast({
        title: "Champ obligatoire manquant",
        description: "Veuillez remplir au minimum le nom",
        variant: "destructive",
      });
      return;
    }

    // Validation de l'email si fourni
    if (newClientData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newClientData.email)) {
        toast({
          title: "Email invalide",
          description: "Veuillez saisir une adresse email valide",
          variant: "destructive",
        });
        return;
      }
    }

    setLoadingAddClient(true);
    try {
      // Utiliser la vraie fonction addClient du hook useClients
      const createdClient = await addClient({
        nom: newClientData.nom,
        prenom: newClientData.prenom,
        email: newClientData.email,
        telephone: newClientData.telephone,
        adresse: newClientData.adresse,
        statut: newClientData.statut as 'Actif' | 'Inactif' | 'VIP',
        notes: newClientData.notes,
        type_client: newClientData.type_client,
        ice: newClientData.ice
      });

      if (createdClient) {
        // Sélectionner automatiquement le nouveau client
        setSelectedClient(createdClient.id);
        
        // Fermer le dialog
        setShowAddClientDialog(false);
        
        // Réinitialiser les données
        resetNewClientForm();

        toast({
          title: "Client ajouté avec succès",
          description: `${createdClient.prenom} ${createdClient.nom} a été ajouté et sélectionné`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoadingAddClient(false);
    }
  };

  const resetNewClientForm = () => {
    setNewClientData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      statut: 'Actif',
      notes: '',
      type_client: 'particulier',
      ice: ''
    });
  };

  const handleSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de finaliser la vente",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClient) {
      toast({
        title: "Client requis",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    // Valider les informations de paiement
    if (!validatePayment()) {
      return;
    }

    // Afficher le récapitulatif avant de finaliser
    setShowRecapitulatif(true);
  };

  const confirmerVente = async () => {
    // Fermer le récapitulatif et afficher la confirmation
    setShowRecapitulatif(false);
    setShowConfirmation(true);
  };

  const finaliserVente = async () => {
    try {
      const selectedClientData = clients.find(c => c.id === selectedClient);
      if (!selectedClientData) {
        toast({
          title: "Client non trouvé",
          description: "Le client sélectionné n'existe plus",
          variant: "destructive",
        });
        return;
      }

      const clientName = `${selectedClientData.prenom} ${selectedClientData.nom}`;
      const clientEmail = selectedClientData.email;
      
      // Calculer les totaux avec réduction selon le mode de taxe
      const sousTotal = getTotal();
      const totalAvecReduction = getTotalAvecReduction();
      const totalHT = getTotalHT();
      const tva = getTVA();
      const totalTTC = getTotalWithTaxMode();

      // Préparer les données de la vente
      const venteData = {
        client_id: selectedClientData.id,
        client_nom: clientName,
        client_email: clientEmail,
        sous_total: totalHT,
        tva: tva,
        remise: reductionMontant,
        total_ht: totalHT,
        total_ttc: totalTTC,
        mode_paiement: paymentMethod,
        type_vente: saleType,
        statut: 'payee' as const,
        notes: `Vente effectuée depuis le point de vente`
      };

      // Préparer les articles selon le mode de taxe
      const articles: Omit<VenteArticle, 'id' | 'vente_id'>[] = cart.map(item => {
        const prixHT = item.prix; // Le prix du système est toujours HT
        
        let prixTTC: number;
        if (taxMode === "with_tax") {
          // Si mode avec taxe, on ajoute 20% au prix HT
          prixTTC = item.prix * 1.2;
        } else {
          // Si mode sans taxe, le prix TTC = prix HT (pas de TVA)
          prixTTC = item.prix;
        }
        
        return {
          produit_id: safeProductId(item.id), // Convertir l'ID en format sûr pour la base de données
          produit_type: item.type,
          nom_produit: item.nom,
          code_barre: item.codeBarre,
          marque: '', // À récupérer depuis les données produit si nécessaire
          modele: '',
          prix_unitaire_ht: prixHT,
          prix_unitaire_ttc: prixTTC,
          quantite: item.quantite,
          remise_unitaire: 0,
          total_ht: prixHT * item.quantite,
          total_ttc: prixTTC * item.quantite,
          image_url: item.image_url // Ajouter l'image du produit
        };
      });

      // Préparer les paiements détaillés
      let paiementsDetailles: PaiementDetaille[] = [];
      
      if (paymentMethod === "mixte") {
        // Paiements multiples
        paiementsDetailles = mixedPayments
          .filter(p => p.amount > 0)
          .map(p => ({
            mode_paiement: p.type as 'especes' | 'virement',
            montant: p.amount,
            compte_bancaire_id: p.type === 'virement' ? p.account : undefined
          }));
      } else {
        // Paiement unique
        const paiement: PaiementDetaille = {
          mode_paiement: paymentMethod as 'especes' | 'carte' | 'virement' | 'cheque',
          montant: totalAvecReduction
        };

        if (paymentMethod === "cheque") {
          paiement.numero_cheque = chequeNumber;
          paiement.date_echeance = chequeEcheance;
        } else if (paymentMethod === "virement") {
          paiement.compte_bancaire_id = selectedAccount;
        }

        paiementsDetailles = [paiement];
      }

      // Créer la vente
      const venteId = await createVente(venteData, articles, paiementsDetailles);

      if (venteId) {
        // Préparer les données pour le ticket
        const selectedClientData = clients.find(c => c.id === selectedClient);
        const clientName = `${selectedClientData?.prenom} ${selectedClientData?.nom}`;
        
        setVenteFinalise({
          numeroVente: venteId,
          clientNom: clientName,
          total: totalTTC,
          articles: cart,
          reduction: reductionMontant,
          modePaiement: paymentMethod
        });

        // Fermer la confirmation et afficher le ticket
        setShowConfirmation(false);
        setShowTicket(true);

        // Recharger les données de stock après la vente
        try {
          await Promise.all([
            refreshPcPortables(),
            refreshMoniteurs(),
            fetchPeripheriques(),
            refreshChaisesGaming(),
            refreshPCGamerConfigs(),
            refreshComposantsPC()
          ]);
        } catch (refreshError) {
          console.warn('Erreur lors du rechargement des données de stock:', refreshError);
          // Ne pas faire échouer la vente pour ça
        }

        toast({
          title: "Vente enregistrée",
          description: `Vente de ${totalAvecReduction.toLocaleString()} MAD enregistrée avec succès`,
        });
      } else {
        // Si createVente retourne null, cela signifie qu'il y a eu une erreur
        // mais elle a déjà été gérée dans le hook useVentes
        console.log("La vente n'a pas pu être créée - erreur déjà gérée");
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vente:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la vente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-blue-600 lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Point de vente</h1>
            <p className="text-gray-600 text-sm lg:text-base">
              {operationType === null ? "Choisissez le type d'opération" : 
               operationType === 'vente' ? "Scanner les produits et finaliser la vente" :
               operationType === 'reprise' ? "Système de reprise et échange" :
               "Gestion des retours clients"}
            </p>
          </div>
        </div>
        {operationType && (
          <Button
            variant="outline"
            onClick={() => {
              setOperationType(null);
              // Réinitialiser les états
              setCart([]);
              setSelectedClient("");
              setPaymentMethod("especes");
              setSelectedProductType("");
              setSearchQuery("");
              setSelectedCategory("all");
              setShowProductSearch(false);
              setReductionMontant(0);
              setShowRepriseSystem(false);
            }}
            className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            ← Retour au menu
          </Button>
        )}
      </div>

      {/* Interface de sélection du type d'opération */}
      {operationType === null && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-4xl w-full bg-white border-gray-200 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 mb-2">Type d'opération</CardTitle>
              <CardDescription className="text-gray-600">
                Choisissez le type d'opération à effectuer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Vente normale */}
                <Card 
                  className="cursor-pointer bg-white border-gray-200 hover:border-blue-500 transition-all duration-300 hover:scale-105 shadow-sm"
                  onClick={() => setOperationType('vente')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Vente</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Vente normale de produits aux clients
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Scanner les produits</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Choisir le mode de paiement</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Générer le ticket</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reprise/Échange */}
                <Card 
                  className="cursor-pointer bg-white border-gray-200 hover:border-purple-500 transition-all duration-300 hover:scale-105 shadow-sm"
                  onClick={() => {
                    setOperationType('reprise');
                    setShowRepriseSystem(true);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Reprise</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Échange d'un produit contre un autre (produits existants ou nouveaux)
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Produits existants ou nouveaux</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Échange avec calcul différence</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Gestion des paiements</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Retour */}
                <Card 
                  className="cursor-pointer bg-white border-gray-200 hover:border-red-500 transition-all duration-300 hover:scale-105 shadow-sm"
                  onClick={() => {
                    setOperationType('retour');
                    setShowRepriseSystem(true);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <RotateCcw className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Retour</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Retour simple de produits clients (produits existants uniquement)
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Produits existants seulement</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Création demande retour</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Traitement depuis gestion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interface de vente normale */}
      {operationType === 'vente' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Scanner et panier */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Caisse
                {selectedProductType && (
                  <Badge variant="outline" className="border-blue-500 text-blue-600 ml-2">
                    {productTypes.find(t => t.value === selectedProductType)?.label}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {selectedProductType 
                  ? `Scanner les produits ${productTypes.find(t => t.value === selectedProductType)?.label.toLowerCase()} et gérer le panier`
                  : "Sélectionnez le type de produit pour commencer"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Indicateur de chargement */}
              {isLoading && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                    <span className="text-yellow-400 text-sm">Chargement des produits...</span>
                  </div>
                </div>
              )}

              {/* Sélection du type de produit */}
              <div className="space-y-2">
                <Label className="text-gray-700">Type de produit *</Label>
                <Select value={selectedProductType} onValueChange={(value: ProductType) => {
                  setSelectedProductType(value);
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setBarcodeInput("");
                }} disabled={isLoading}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Sélectionnez d'abord le type de produit" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {productTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Scanner de code-barres - affiché seulement si un type est sélectionné */}
              {selectedProductType && (
                <div className="space-y-2">
                  <Label className="text-gray-700">Code-barres produit</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Scan className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Scanner ou saisir le code-barres"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addToCartByBarcode(barcodeInput);
                          }
                        }}
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <Button
                      onClick={() => addToCartByBarcode(barcodeInput)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!barcodeInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Séparateur avec option de recherche - affiché seulement si un type est sélectionné */}
              {selectedProductType && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProductSearch(!showProductSearch)}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {showProductSearch ? <Scan className="w-4 h-4 mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                    {showProductSearch ? "Scanner" : "Rechercher"}
                  </Button>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
              )}

              {/* Recherche de produits - affiché seulement si un type est sélectionné et la recherche activée */}
              {selectedProductType && showProductSearch && (
                <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Recherche par nom */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm">Rechercher un produit</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Nom du produit ou marque..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white border-gray-300 text-gray-900 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Filtre par catégorie */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm">Catégorie</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-white border-gray-300 text-sm text-gray-900">
                          <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="all">Toutes les catégories</SelectItem>
                          {getAvailableCategories().map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Résultats de recherche */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 text-sm">
                        Produits trouvés ({filteredProducts.length})
                      </Label>
                      {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                          }}
                          className="text-gray-600 hover:text-gray-900 text-xs h-6"
                        >
                          Effacer filtres
                        </Button>
                      )}
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto bg-white rounded border border-gray-200">
                      {filteredProducts.length === 0 ? (
                        <div className="text-center py-4">
                          <Grid3X3 className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                          <p className="text-gray-600 text-sm">
                            {(searchQuery || (selectedCategory && selectedCategory !== "all")) ? "Aucun produit trouvé" : "Utilisez la recherche pour trouver des produits"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 p-2">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => addProductToCart(product)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-900 font-medium text-sm truncate">{product.nom}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs border-blue-600 text-blue-600">
                                    {product.categorie}
                                  </Badge>
                                  <span className="text-green-600 text-xs font-medium">{product.prix} MAD</span>
                                  <span className="text-gray-600 text-xs">Stock: {product.stock}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0 ml-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addProductToCart(product);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message d'aide si aucun type sélectionné */}
              {!selectedProductType && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-blue-900 font-medium mb-1">Sélectionnez un type de produit</p>
                  <p className="text-blue-700 text-sm">Choisissez d'abord le type de produit pour commencer la vente</p>
                </div>
              )}

              {/* Panier */}
              <div className="space-y-2">
                <Label className="text-gray-700">Panier ({cart.length} articles)</Label>
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 lg:max-h-80 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Panier vide</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-medium text-sm truncate">{item.nom}</p>
                            <p className="text-blue-600 text-sm">{item.prix} MAD × {item.quantite}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-gray-900 w-8 text-center text-sm">{item.quantite}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Réduction */}
              <div className="space-y-2">
                <Label className="text-gray-700">Réduction (MAD)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="Montant de la réduction"
                      value={reductionMontant || ""}
                      onChange={(e) => setReductionMontant(parseFloat(e.target.value) || 0)}
                      min="0"
                      max={getTotal()}
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    onClick={() => setReductionMontant(0)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    disabled={reductionMontant === 0}
                  >
                    Reset
                  </Button>
                </div>
                {reductionMontant > 0 && (
                  <p className="text-sm text-blue-600">
                    Réduction appliquée : -{reductionMontant.toFixed(2)} MAD
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                {reductionMontant > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="text-gray-600">{getTotal().toFixed(2)} MAD</span>
                  </div>
                )}
                {reductionMontant > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-red-600">Réduction:</span>
                    <span className="text-red-600">-{reductionMontant.toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total:</span>
                  <span className="text-xl lg:text-2xl font-bold text-purple-600">{getTotalAvecReduction().toFixed(2)} MAD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de vente */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Finaliser la vente</CardTitle>
              <CardDescription className="text-gray-600">
                Informations client et paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection client */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700">Client</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddClientDialog(true)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Ajouter un client
                  </Button>
                </div>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 max-h-60">
                    {loadingClients ? (
                      <SelectItem value="loading" disabled>
                        Chargement des clients...
                      </SelectItem>
                    ) : clients.length === 0 ? (
                      <SelectItem value="no-clients" disabled>
                        Aucun client disponible
                      </SelectItem>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.prenom} {client.nom} ({client.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-gray-300" />

              {/* Mode de taxe */}
              <div className="space-y-3">
                <Label className="text-gray-700">Mode de facturation</Label>
                <div className="space-y-2">
                  {[
                    { value: "with_tax", label: "Prix avec TVA (TTC)", icon: DollarSign },
                    { value: "without_tax", label: "Prix hors taxe (HT)", icon: Percent }
                  ].map(({ value, label, icon: Icon }) => (
                    <div
                      key={value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        taxMode === value
                          ? 'border-green-600 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => setTaxMode(value as "with_tax" | "without_tax")}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="font-medium">{label}</span>
                      {taxMode === value && (
                        <div className="ml-auto w-2 h-2 bg-green-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
                                  <p className="text-sm text-gray-500">
                    {taxMode === "with_tax" 
                      ? "Les prix du système (HT) + 20% de TVA. La facture affichera 'Total TTC'."
                      : "Les prix du système (HT) sans TVA. La facture affichera juste 'Total'."
                    }
                  </p>
              </div>

              <Separator className="bg-gray-300" />

              {/* Mode de paiement */}
              <div className="space-y-3">
                <Label className="text-gray-700">Mode de paiement</Label>
                <div className="space-y-2">
                  {[
                    { value: "especes", label: "Espèces", icon: Banknote },
                    { value: "virement", label: "Virement bancaire", icon: Building },
                    { value: "cheque", label: "Chèque", icon: FileCheck },
                    { value: "mixte", label: "Paiement mixte", icon: Building }
                  ].map(({ value, label, icon: Icon }) => (
                    <div
                      key={value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        paymentMethod === value
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => setPaymentMethod(value)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="font-medium">{label}</span>
                      {paymentMethod === value && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Champs spécifiques selon le mode de paiement */}
                {paymentMethod === "cheque" && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div>
                      <Label className="text-gray-700 text-sm">Numéro de chèque *</Label>
                      <Input
                        placeholder="Saisir le numéro de chèque"
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                        className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 text-sm">Date d'échéance *</Label>
                      <Input
                        type="date"
                        value={chequeEcheance}
                        onChange={(e) => setChequeEcheance(e.target.value)}
                        className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "virement" && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-700 text-sm">Compte de réception *</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="mt-1 bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Sélectionner le compte" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {bankAccounts.filter(account => account.statut === 'Actif').map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.nom_compte} - {account.nom_banque}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {paymentMethod === "mixte" && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 text-sm">Répartition des paiements</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addMixedPayment}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                    
                    {mixedPayments.map((payment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                        <Select
                          value={payment.type}
                          onValueChange={(value) => updateMixedPayment(index, "type", value)}
                        >
                          <SelectTrigger className="w-32 bg-white border-gray-300 text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-300">
                            <SelectItem value="especes">Espèces</SelectItem>
                            <SelectItem value="virement">Virement</SelectItem>
                            <SelectItem value="cheque">Chèque</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="number"
                          placeholder="Montant"
                          value={payment.amount || ""}
                          onChange={(e) => updateMixedPayment(index, "amount", parseFloat(e.target.value) || 0)}
                          className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                        
                        {payment.type === "virement" && (
                          <Select
                            value={payment.account || ""}
                            onValueChange={(value) => updateMixedPayment(index, "account", value)}
                          >
                            <SelectTrigger className="w-40 bg-white border-gray-300 text-gray-900">
                              <SelectValue placeholder="Compte" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {bankAccounts.filter(account => account.statut === 'Actif').map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.numero_compte || account.nom_compte}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {mixedPayments.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMixedPayment(index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="text-gray-700 text-sm">Total saisi:</span>
                      <span className={`font-medium ${
                        Math.abs(getTotalAvecReduction() - getMixedPaymentTotal()) < 0.01 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {getMixedPaymentTotal().toFixed(2)} MAD
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">Total vente:</span>
                      <span className="text-blue-600 font-medium">{getTotalAvecReduction().toFixed(2)} MAD</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-300" />

              {/* Type de vente */}
              <div className="space-y-3">
                <Label className="text-gray-700">Type de vente</Label>
                <div className="space-y-2">
                  {[
                    { value: "magasin", label: "Magasin (sur place)", icon: Building },
                    { value: "commande", label: "Commande (livraison)", icon: Package }
                  ].map(({ value, label, icon: Icon }) => (
                    <div
                      key={value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        saleType === value
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => setSaleType(value)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="font-medium">{label}</span>
                      {saleType === value && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="space-y-3">
                <Button
                  onClick={handleSale}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform"
                  disabled={cart.length === 0 || !selectedClient || loadingVente}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Voir le récapitulatif
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de récapitulatif */}
      <Dialog open={showRecapitulatif} onOpenChange={setShowRecapitulatif}>
        <DialogContent className="max-w-2xl bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Récapitulatif de la vente
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Vérifiez les détails avant de finaliser la vente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informations client */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-2">Client</h3>
              <p className="text-gray-700">
                {clients.find(c => c.id === selectedClient)?.prenom} {clients.find(c => c.id === selectedClient)?.nom}
              </p>
              <p className="text-gray-600 text-sm">
                {clients.find(c => c.id === selectedClient)?.email}
              </p>
            </div>

            {/* Articles */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-3">Articles ({cart.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white border border-gray-200 rounded p-2">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm font-medium">{item.nom}</p>
                      <p className="text-gray-600 text-xs">{item.categorie}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 text-sm">{item.prix} MAD × {item.quantite}</p>
                      <p className="text-gray-900 text-sm font-medium">{(item.prix * item.quantite).toFixed(2)} MAD</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totaux */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-3">Totaux</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="text-gray-900">{getTotal().toFixed(2)} MAD</span>
                </div>
                {reductionMontant > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Réduction:</span>
                    <span className="text-red-600">-{reductionMontant.toFixed(2)} MAD</span>
                  </div>
                )}
                {taxMode === "with_tax" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (20%):</span>
                    <span className="text-gray-600">+{getTVA().toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span className="text-gray-900">
                    {taxMode === "with_tax" ? "Total TTC:" : "Total:"}
                  </span>
                  <span className="text-blue-600">{getTotalWithTaxMode().toFixed(2)} MAD</span>
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-2">Mode de paiement</h3>
              <div className="flex items-center gap-2">
                {getPaymentIcon(paymentMethod)}
                <span className="text-gray-700 capitalize">
                  {paymentMethod === 'especes' ? 'Espèces' : 
                   paymentMethod === 'virement' ? 'Virement bancaire' :
                   paymentMethod === 'cheque' ? 'Chèque' :
                   paymentMethod === 'mixte' ? 'Paiement mixte' : paymentMethod}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRecapitulatif(false)}
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Modifier
            </Button>
            <Button
              onClick={confirmerVente}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de vente */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Confirmer la vente
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Êtes-vous sûr de vouloir finaliser cette vente ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Résumé rapide */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client:</span>
                  <span className="text-gray-900 font-medium">
                    {clients.find(c => c.id === selectedClient)?.prenom} {clients.find(c => c.id === selectedClient)?.nom}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Articles:</span>
                  <span className="text-gray-900">{cart.length} produit(s)</span>
                </div>
                {reductionMontant > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Réduction:</span>
                    <span className="text-red-600">-{reductionMontant.toFixed(2)} MAD</span>
                  </div>
                )}
                {taxMode === "with_tax" && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">TVA (20%):</span>
                    <span className="text-gray-600">+{getTVA().toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold border-t border-gray-300 pt-2">
                  <span className="text-gray-900">Total à payer:</span>
                  <span className="text-blue-600">{getTotalWithTaxMode().toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paiement:</span>
                  <span className="text-gray-900 capitalize">
                    {paymentMethod === 'especes' ? 'Espèces' : 
                     paymentMethod === 'virement' ? 'Virement' :
                     paymentMethod === 'cheque' ? 'Chèque' :
                     paymentMethod === 'mixte' ? 'Mixte' : paymentMethod}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm text-center">
                ⚠️ Cette action est irréversible. La vente sera enregistrée définitivement.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                setShowRecapitulatif(true);
              }}
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Retour
            </Button>
            <Button
              onClick={finaliserVente}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loadingVente}
            >
              {loadingVente ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finalisation...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Finaliser la vente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de ticket de caisse */}
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent className="max-w-lg bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Ticket de caisse
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Vente finalisée avec succès
            </DialogDescription>
          </DialogHeader>
          
          {venteFinalise && (
            <div className="bg-white text-black p-6 rounded font-mono text-sm">
              <div className="text-center border-b border-gray-300 pb-3 mb-3">
                <h2 className="font-bold text-lg">GAMERSTORE</h2>
                <p className="text-xs">Point de vente gaming</p>
                <p className="text-xs">Date: {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR')}</p>
              </div>
              
              <div className="border-b border-gray-300 pb-2 mb-2">
                <p className="text-xs">N° Vente: {venteFinalise.numeroVente || 'N/A'}</p>
                <p className="text-xs">Client: {venteFinalise.clientNom}</p>
                <p className="text-xs">Vendeur: Point de vente</p>
              </div>
              
              <div className="space-y-1 border-b border-gray-300 pb-2 mb-2">
                {cart.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span className="text-xs truncate flex-1 mr-2">{item.nom}</span>
                      <span className="text-xs">{item.quantite}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{item.prix.toFixed(2)} MAD</span>
                      <span>{(item.prix * item.quantite).toFixed(2)} MAD</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>SOUS-TOTAL:</span>
                  <span>{getTotal().toFixed(2)} MAD</span>
                </div>
                {reductionMontant > 0 && (
                  <div className="flex justify-between">
                    <span>REDUCTION:</span>
                    <span>-{reductionMontant.toFixed(2)} MAD</span>
                  </div>
                )}
                {taxMode === "with_tax" && (
                  <div className="flex justify-between">
                    <span>TVA (20%):</span>
                    <span>+{getTVA().toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-300 pt-1 font-bold">
                  <span>TOTAL TTC:</span>
                  <span>{getTotalWithTaxMode().toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>MODE PAIEMENT:</span>
                  <span className="uppercase">{paymentMethod}</span>
                </div>
              </div>
              
              <div className="text-center border-t border-gray-300 pt-3 mt-3">
                <p className="text-xs">Merci de votre visite !</p>
                <p className="text-xs">Service client: contact@gamerstore.ma</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTicket(false);
                // Réinitialiser toutes les modales
                setShowRecapitulatif(false);
                setShowConfirmation(false);
                setVenteFinalise(null);
                
                // Retourner au menu principal
                setOperationType(null);
                
                // Réinitialiser le formulaire après fermeture du ticket
                setCart([]);
                setSelectedClient("");
                setPaymentMethod("especes");
                setSaleType("magasin");
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedProductType("");
                setShowProductSearch(false);
                setReductionMontant(0);
                
                // Réinitialiser les champs de paiement
                setChequeNumber("");
                setChequeEcheance("");
                setSelectedAccount("");
                setMixedPayments([
                  { type: "especes", amount: 0 },
                  { type: "virement", amount: 0, account: "" }
                ]);
              }}
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                if (venteFinalise) {
                  // Ici on pourrait ajouter une fonction d'impression
                  toast({
                    title: "Fonction d'impression",
                    description: "L'impression du ticket sera bientôt disponible",
                  });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'ajout de client */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-white border-gray-200 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Ajouter un nouveau client
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Créez un nouveau client pour cette vente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Section 1: Type de client */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Type de client</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Choisissez le type de client pour adapter les champs requis</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                    newClientData.type_client === 'particulier'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-500'
                  }`}
                  onClick={() => setNewClientData({...newClientData, type_client: 'particulier', ice: ''})}
                >
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Particulier</div>
                    <div className="text-xs text-gray-600">Client individuel</div>
                  </div>
                </div>
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                    newClientData.type_client === 'societe'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-500'
                  }`}
                  onClick={() => setNewClientData({...newClientData, type_client: 'societe'})}
                >
                  <Building className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Société</div>
                    <div className="text-xs text-gray-600">Entreprise ou organisation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Informations principales */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                <h3 className="text-lg font-semibold text-gray-900">Informations principales</h3>
                <span className="text-xs text-red-600 font-medium">* Obligatoire</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    {newClientData.type_client === 'societe' ? (
                      <>
                        <Building className="w-4 h-4" />
                        Nom de la société *
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        Nom de famille *
                      </>
                    )}
                  </Label>
                  <Input
                    value={newClientData.nom}
                    onChange={(e) => setNewClientData({...newClientData, nom: e.target.value})}
                    placeholder={newClientData.type_client === 'societe' ? "Ex: TechCorp Solutions" : "Ex: Dupont"}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    {newClientData.type_client === 'societe' ? 'Nom du contact principal' : 'Prénom'}
                  </Label>
                  <Input
                    value={newClientData.prenom}
                    onChange={(e) => setNewClientData({...newClientData, prenom: e.target.value})}
                    placeholder={newClientData.type_client === 'societe' ? "Ex: Mohammed Alami" : "Ex: Jean"}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Champ ICE pour les sociétés */}
              {newClientData.type_client === 'societe' && (
                <div className="mt-4">
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Building className="w-4 h-4" />
                    Numéro ICE
                  </Label>
                  <Input
                    value={newClientData.ice}
                    onChange={(e) => setNewClientData({...newClientData, ice: e.target.value})}
                    placeholder="Ex: 001234567000025"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identifiant Commun de l'Entreprise (15 chiffres) - Optionnel
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Contact et localisation */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                <h3 className="text-lg font-semibold text-gray-900">Contact et localisation</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Adresse email
                  </Label>
                  <Input
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                    placeholder="Ex: client@exemple.com"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Numéro de téléphone
                  </Label>
                  <Input
                    value={newClientData.telephone}
                    onChange={(e) => setNewClientData({...newClientData, telephone: e.target.value})}
                    placeholder="Ex: 06 12 34 56 78 ou +212 6 12 34 56 78"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Adresse complète
                  </Label>
                  <textarea
                    value={newClientData.adresse}
                    onChange={(e) => setNewClientData({...newClientData, adresse: e.target.value})}
                    placeholder="Ex: 123 Avenue Mohammed V, Appartement 4, Casablanca 20000"
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Paramètres du compte */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">4</div>
                <h3 className="text-lg font-semibold text-gray-900">Paramètres du compte</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Badge className="w-4 h-4" />
                    Statut du client
                  </Label>
                  <Select value={newClientData.statut} onValueChange={(value: any) => setNewClientData({...newClientData, statut: value})}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Actif">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Actif - Client régulier
                        </div>
                      </SelectItem>
                      <SelectItem value="VIP">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          VIP - Client privilégié
                        </div>
                      </SelectItem>
                      <SelectItem value="Inactif">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          Inactif - Compte suspendu
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Receipt className="w-4 h-4" />
                    Notes additionnelles
                  </Label>
                  <textarea
                    value={newClientData.notes}
                    onChange={(e) => setNewClientData({...newClientData, notes: e.target.value})}
                    placeholder="Préférences, remarques, historique..."
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Résumé et validation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-gray-900 font-medium mb-2">Récapitulatif</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Type:</strong> {newClientData.type_client === 'societe' ? 'Société' : 'Particulier'}</p>
                <p><strong>Nom:</strong> {newClientData.nom || 'Non renseigné'}</p>
                <p><strong>{newClientData.type_client === 'societe' ? 'Contact' : 'Prénom'}:</strong> {newClientData.prenom || 'Non renseigné'}</p>
                <p><strong>Email:</strong> {newClientData.email || 'Non renseigné'}</p>
                {newClientData.type_client === 'societe' && (
                  <p><strong>ICE:</strong> {newClientData.ice || 'Non renseigné'}</p>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Seul le nom {newClientData.type_client === 'societe' ? 'de la société' : 'de famille'} est obligatoire
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleAddClient}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-12 text-base font-medium"
                disabled={!newClientData.nom || loadingAddClient}
              >
                {loadingAddClient ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer le client
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddClientDialog(false);
                  resetNewClientForm();
                }}
                className="px-6 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Système de Reprise */}
      <RepriseSystem 
        isOpen={showRepriseSystem} 
        mode={operationType === 'retour' ? 'retour' : 'reprise'}
        onClose={() => {
          setShowRepriseSystem(false);
          setOperationType(null);
        }} 
      />
    </div>
  );
}
