import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  RefreshCw, 
  Search, 
  Package, 
  DollarSign, 
  ArrowRightLeft, 
  Check, 
  Building,
  Banknote,
  CreditCard,
  RotateCcw,
  Plus,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRetours } from "@/hooks/useRetours";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useClients } from "@/hooks/useClients";
import { usePcPortables } from "@/hooks/usePcPortables";
import { useMoniteurs } from "@/hooks/useMoniteurs";
import { usePeripheriques } from "@/hooks/usePeripheriques";
import { useChaisesGamingSupabase } from "@/hooks/useChaisesGamingSupabase";
import { usePCGamer } from "@/hooks/usePCGamer";
import { useComposantsPC } from "@/hooks/useComposantsPC";

interface RepriseSystemProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'reprise' | 'retour';
}

interface ProductForReprise {
  id: string;
  nom: string;
  prix: number;
  stock: number;
  type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  marque?: string;
  categorie?: string;
  is_custom?: boolean; // Indique si c'est un produit ajouté manuellement
}

export function RepriseSystem({ isOpen, onClose, mode }: RepriseSystemProps) {
  const { toast } = useToast();
  const { addRetour, addReprise } = useRetours();
  const { comptes } = useBankAccounts();
  const { clients, loading: loadingClients } = useClients();
  
  // Hooks pour récupérer tous les produits
  const { pcPortables } = usePcPortables();
  const { moniteurs } = useMoniteurs();
  const { peripheriques } = usePeripheriques();
  const { chaisesGaming } = useChaisesGamingSupabase();
  const { pcGamerConfigs } = usePCGamer();
  const { composantsPC } = useComposantsPC();

  const [step, setStep] = useState(1); // 1: sélection ancien produit, 2: sélection nouveau produit, 3: paiement
  const [searchAncien, setSearchAncien] = useState("");
  const [searchNouveau, setSearchNouveau] = useState("");
  const [ancienProduit, setAncienProduit] = useState<ProductForReprise | null>(null);
  const [nouveauProduit, setNouveauProduit] = useState<ProductForReprise | null>(null);
  const [quantiteAncien, setQuantiteAncien] = useState(1);
  const [quantiteNouveau, setQuantiteNouveau] = useState(1);
  const [selectedClient, setSelectedClient] = useState("");
  const [motifReprise, setMotifReprise] = useState("");
  const [modePaiementDifference, setModePaiementDifference] = useState<'especes' | 'carte' | 'virement' | 'cheque'>('especes');
  const [compteBancaire, setCompteBancaire] = useState("");

  // États pour l'ajout manuel de produits (reprise uniquement)
  const [showAddCustomProduct, setShowAddCustomProduct] = useState(false);
  const [customProductNom, setCustomProductNom] = useState("");
  const [customProductPrix, setCustomProductPrix] = useState("");
  const [customProductType, setCustomProductType] = useState<'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc'>('pc_portable');
  const [customProductMarque, setCustomProductMarque] = useState("");

  const getAllProducts = (): ProductForReprise[] => {
    const products: ProductForReprise[] = [];
    
    // PC Portables
    pcPortables.filter(p => p.stock_actuel > 0).forEach(pc => {
      products.push({
        id: pc.id,
        nom: pc.nom_produit,
        prix: pc.prix_vente,
        stock: pc.stock_actuel,
        type: 'pc_portable',
        marque: pc.marque
      });
    });

    // Moniteurs
    moniteurs.filter(m => m.stock_actuel > 0).forEach(moniteur => {
      products.push({
        id: moniteur.id,
        nom: moniteur.nom_produit,
        prix: moniteur.prix_vente,
        stock: moniteur.stock_actuel,
        type: 'moniteur',
        marque: moniteur.marque
      });
    });

    // Périphériques
    peripheriques.filter(p => p.stock_actuel > 0).forEach(periph => {
      products.push({
        id: periph.id,
        nom: periph.nom_produit,
        prix: periph.prix_vente,
        stock: periph.stock_actuel,
        type: 'peripherique',
        marque: periph.marque,
        categorie: periph.categorie
      });
    });

    // Chaises Gaming
    chaisesGaming.filter(c => c.stock_actuel > 0).forEach(chaise => {
      products.push({
        id: chaise.id,
        nom: chaise.nom_produit,
        prix: chaise.prix_vente,
        stock: chaise.stock_actuel,
        type: 'chaise_gaming',
        marque: chaise.marque
      });
    });

    // PC Gamer
    pcGamerConfigs.filter(p => p.statut === 'Actif' && p.stock_possible > 0).forEach(config => {
      products.push({
        id: config.id,
        nom: config.nom_config,
        prix: config.prix_vente,
        stock: config.stock_possible,
        type: 'pc_gamer'
      });
    });

    // Composants PC
    composantsPC.filter(c => c.statut === 'Disponible' && c.stock_actuel > 0).forEach(comp => {
      products.push({
        id: comp.id,
        nom: comp.nom_produit,
        prix: comp.prix_vente,
        stock: comp.stock_actuel,
        type: 'composant_pc',
        categorie: comp.categorie
      });
    });

    return products;
  };

  const filteredProductsAncien = getAllProducts().filter(product =>
    product.nom.toLowerCase().includes(searchAncien.toLowerCase())
  );

  const filteredProductsNouveau = getAllProducts().filter(product =>
    product.nom.toLowerCase().includes(searchNouveau.toLowerCase())
  );

  const calculerDifference = () => {
    if (!ancienProduit || !nouveauProduit) return 0;
    return (nouveauProduit.prix * quantiteNouveau) - (ancienProduit.prix * quantiteAncien);
  };

  const difference = calculerDifference();

  const resetForm = () => {
    setStep(1);
    setSearchAncien("");
    setSearchNouveau("");
    setAncienProduit(null);
    setNouveauProduit(null);
    setQuantiteAncien(1);
    setQuantiteNouveau(1);
    setSelectedClient("");
    setMotifReprise("");
    setModePaiementDifference('especes');
    setCompteBancaire("");
    setShowAddCustomProduct(false);
    setCustomProductNom("");
    setCustomProductPrix("");
    setCustomProductType('pc_portable');
    setCustomProductMarque("");
  };

  // Fonction pour ajouter un produit personnalisé (reprise uniquement)
  const addCustomProduct = () => {
    if (!customProductNom || !customProductPrix) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom et le prix du produit",
        variant: "destructive",
      });
      return;
    }

    const prix = parseFloat(customProductPrix);
    if (isNaN(prix) || prix <= 0) {
      toast({
        title: "Erreur",
        description: "Le prix doit être un nombre valide supérieur à 0",
        variant: "destructive",
      });
      return;
    }

    const customProduct: ProductForReprise = {
      id: `CUSTOM_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      nom: customProductNom,
      prix: prix,
      stock: 1, // Les produits personnalisés ont toujours un stock de 1
      type: customProductType,
      marque: customProductMarque || undefined,
      is_custom: true
    };

    if (step === 1) {
      setAncienProduit(customProduct);
      setSearchAncien(customProduct.nom);
    } else if (step === 2) {
      setNouveauProduit(customProduct);
      setSearchNouveau(customProduct.nom);
    }

    setShowAddCustomProduct(false);
    setCustomProductNom("");
    setCustomProductPrix("");
    setCustomProductMarque("");

    toast({
      title: "Produit ajouté",
      description: "Le produit personnalisé a été ajouté avec succès",
    });
  };

  const finaliserReprise = async () => {
    if (!ancienProduit || !selectedClient) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    // Récupérer les données du client sélectionné
    const selectedClientData = clients.find(c => c.id === selectedClient);
    if (!selectedClientData) {
      toast({
        title: "Erreur",
        description: "Client sélectionné introuvable",
        variant: "destructive",
      });
      return;
    }

    const clientNom = `${selectedClientData.prenom} ${selectedClientData.nom}`;
    const clientEmail = selectedClientData.email;

    if (mode === 'retour') {
      // Mode retour simple - créer seulement un retour
      const retourId = addRetour({
        produit_id: ancienProduit.id,
        produit_type: ancienProduit.type,
        nom_produit: ancienProduit.nom,
        quantite: quantiteAncien,
        prix_unitaire: ancienProduit.prix,
        prix_total: ancienProduit.prix * quantiteAncien,
        motif_retour: motifReprise || "Retour client",
        type_retour: 'retour_simple',
        client_id: selectedClient,
        client_nom: clientNom,
        client_email: clientEmail,
        statut: 'en_attente',
        created_by: 'Point de vente'
      });

      if (retourId) {
        toast({
          title: "Retour créé",
          description: `Retour ${retourId} créé avec succès`,
        });
        resetForm();
        onClose();
      }
      return;
    }

    // Mode reprise - logique existante
    if (!nouveauProduit) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner le nouveau produit",
        variant: "destructive",
      });
      return;
    }

    // 1. Créer le retour de l'ancien produit
    const retourId = addRetour({
      produit_id: ancienProduit.id,
      produit_type: ancienProduit.type,
      nom_produit: ancienProduit.nom,
      quantite: quantiteAncien,
      prix_unitaire: ancienProduit.prix,
      prix_total: ancienProduit.prix * quantiteAncien,
      motif_retour: motifReprise || "Reprise pour échange",
      type_retour: 'reprise_echange',
      client_id: selectedClient,
      client_nom: clientNom,
      client_email: clientEmail,
      statut: 'traite',
      created_by: 'Point de vente'
    });

    if (!retourId) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du retour",
        variant: "destructive",
      });
      return;
    }

    // 2. Créer la reprise/échange
    const repriseId = addReprise({
      retour_id: retourId,
      client_id: selectedClient,
      client_nom: clientNom,
      ancien_produit: {
        id: ancienProduit.id,
        nom: ancienProduit.nom,
        prix: ancienProduit.prix,
        quantite: quantiteAncien
      },
      nouveau_produit: {
        id: nouveauProduit.id,
        nom: nouveauProduit.nom,
        prix: nouveauProduit.prix,
        quantite: quantiteNouveau
      },
      difference_prix: difference,
      mode_paiement_difference: difference !== 0 ? modePaiementDifference : undefined,
      compte_bancaire_id: modePaiementDifference === 'virement' ? compteBancaire : undefined,
      statut: 'en_attente',
      notes: motifReprise
    });

    if (repriseId) {
      toast({
        title: "Reprise créée",
        description: `Reprise ${repriseId} créée avec succès`,
      });
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pc_portable': return '💻';
      case 'moniteur': return '🖥️';
      case 'peripherique': return '🖱️';
      case 'chaise_gaming': return '🪑';
      case 'pc_gamer': return '🎮';
      case 'composant_pc': return '⚙️';
      default: return '📦';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {mode === 'retour' ? (
              <>
                <RotateCcw className="w-5 h-5 text-red-400" />
                Retour Produit
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 text-gaming-purple" />
                Système de Reprise
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'retour' 
              ? "Créer une demande de retour pour un produit client (produits existants uniquement)" 
              : "Échangez un produit contre un autre avec calcul automatique de la différence (produits existants ou nouveaux)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center space-x-4">
            {(mode === 'retour' ? [1, 2] : [1, 2, 3]).map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-gaming-purple text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < (mode === 'retour' ? 2 : 3) && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-gaming-purple' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Étape 1: Sélection ancien produit */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Étape 1: {mode === 'retour' ? 'Produit à retourner' : 'Ancien produit à reprendre'}
              </h3>
              
              <div>
                <Label className="text-gray-300">Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionnez un client"} />
                  </SelectTrigger>
                  <SelectContent>
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
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {client.prenom} {client.nom} ({client.email})
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Motif de la {mode === 'retour' ? 'retour' : 'reprise'}</Label>
                <Input
                  value={motifReprise}
                  onChange={(e) => setMotifReprise(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Ex: Défaut, changement d'avis, upgrade..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-300">Rechercher {mode === 'retour' ? 'le produit à retourner' : "l'ancien produit"} *</Label>
                  {mode === 'reprise' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCustomProduct(true)}
                      className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter un produit
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchAncien}
                    onChange={(e) => setSearchAncien(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    placeholder={mode === 'retour' ? "Rechercher dans les produits existants..." : "Tapez le nom du produit..."}
                  />
                </div>
                {mode === 'retour' && (
                  <p className="text-sm text-yellow-400 mt-1">
                    ⚠️ Seuls les produits existants dans le stock peuvent être retournés
                  </p>
                )}
                {mode === 'reprise' && (
                  <p className="text-sm text-blue-400 mt-1">
                    💡 Vous pouvez rechercher dans les produits existants ou ajouter un nouveau produit
                  </p>
                )}
              </div>

              {searchAncien && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredProductsAncien.slice(0, 10).map((product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer tech-gradient border-gray-700 hover:border-gaming-purple/50 transition-all ${
                        ancienProduit?.id === product.id ? 'border-gaming-purple bg-gaming-purple/10' : ''
                      }`}
                      onClick={() => setAncienProduit(product)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getTypeIcon(product.type)}</span>
                              <h4 className="font-medium text-white">{product.nom}</h4>
                              {product.is_custom && (
                                <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                                  Produit personnalisé
                                </Badge>
                              )}
                            </div>
                            {product.marque && (
                              <p className="text-xs text-gray-400">Marque: {product.marque}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gaming-cyan">
                              {product.prix.toFixed(2)} MAD
                            </div>
                            {!product.is_custom && (
                              <div className="text-xs text-gray-400">Stock: {product.stock}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredProductsAncien.length === 0 && mode === 'reprise' && (
                    <div className="text-center py-4">
                      <p className="text-gray-400 mb-2">Aucun produit trouvé</p>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddCustomProduct(true)}
                        className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter ce produit manuellement
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {ancienProduit && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Produit sélectionné:</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{ancienProduit.nom}</span>
                    <div className="flex items-center gap-2">
                      <Label className="text-gray-300">Quantité:</Label>
                      <Input
                        type="number"
                        min="1"
                        max={ancienProduit.is_custom ? 999 : ancienProduit.stock}
                        value={quantiteAncien}
                        onChange={(e) => setQuantiteAncien(parseInt(e.target.value) || 1)}
                        className="w-20 bg-gray-800 border-gray-600 text-white text-center"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-gaming-cyan font-semibold">
                    Total: {(ancienProduit.prix * quantiteAncien).toFixed(2)} MAD
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(mode === 'retour' ? 2 : 2)}
                  disabled={!ancienProduit || !selectedClient}
                  className="gaming-gradient"
                >
                  {mode === 'retour' ? 'Créer le retour' : 'Continuer'}
                </Button>
              </div>
            </div>
          )}

          {/* Dialog pour ajouter un produit personnalisé */}
          <Dialog open={showAddCustomProduct} onOpenChange={setShowAddCustomProduct}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Ajouter un produit personnalisé</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Ajoutez un produit qui n'existe pas encore dans votre stock
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Nom du produit *</Label>
                  <Input
                    value={customProductNom}
                    onChange={(e) => setCustomProductNom(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Ex: iPhone 15 Pro Max"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Prix (MAD) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customProductPrix}
                      onChange={(e) => setCustomProductPrix(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Type de produit</Label>
                    <Select value={customProductType} onValueChange={(value: any) => setCustomProductType(value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pc_portable">PC Portable</SelectItem>
                        <SelectItem value="moniteur">Moniteur</SelectItem>
                        <SelectItem value="peripherique">Périphérique</SelectItem>
                        <SelectItem value="chaise_gaming">Chaise Gaming</SelectItem>
                        <SelectItem value="pc_gamer">PC Gamer</SelectItem>
                        <SelectItem value="composant_pc">Composant PC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Marque (optionnel)</Label>
                  <Input
                    value={customProductMarque}
                    onChange={(e) => setCustomProductMarque(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Ex: Apple, HP, Samsung..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddCustomProduct(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={addCustomProduct}
                    className="gaming-gradient"
                  >
                    Ajouter le produit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Étape 2: Sélection nouveau produit */}
          {step === 2 && mode !== 'retour' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Étape 2: Nouveau produit souhaité</h3>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-300">Rechercher le nouveau produit *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCustomProduct(true)}
                    className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter un produit
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchNouveau}
                    onChange={(e) => setSearchNouveau(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    placeholder="Tapez le nom du produit..."
                  />
                </div>
                <p className="text-sm text-blue-400 mt-1">
                  💡 Vous pouvez rechercher dans les produits existants ou ajouter un nouveau produit
                </p>
              </div>

              {searchNouveau && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredProductsNouveau.slice(0, 10).map((product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer tech-gradient border-gray-700 hover:border-gaming-purple/50 transition-all ${
                        nouveauProduit?.id === product.id ? 'border-gaming-purple bg-gaming-purple/10' : ''
                      }`}
                      onClick={() => setNouveauProduit(product)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getTypeIcon(product.type)}</span>
                              <h4 className="font-medium text-white">{product.nom}</h4>
                              {product.is_custom && (
                                <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                                  Produit personnalisé
                                </Badge>
                              )}
                            </div>
                            {product.marque && (
                              <p className="text-xs text-gray-400">Marque: {product.marque}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gaming-cyan">
                              {product.prix.toFixed(2)} MAD
                            </div>
                            {!product.is_custom && (
                              <div className="text-xs text-gray-400">Stock: {product.stock}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredProductsNouveau.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400 mb-2">Aucun produit trouvé</p>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddCustomProduct(true)}
                        className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter ce produit manuellement
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {nouveauProduit && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Produit sélectionné:</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{nouveauProduit.nom}</span>
                    <div className="flex items-center gap-2">
                      <Label className="text-gray-300">Quantité:</Label>
                      <Input
                        type="number"
                        min="1"
                        max={nouveauProduit.is_custom ? 999 : nouveauProduit.stock}
                        value={quantiteNouveau}
                        onChange={(e) => setQuantiteNouveau(parseInt(e.target.value) || 1)}
                        className="w-20 bg-gray-800 border-gray-600 text-white text-center"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-gaming-cyan font-semibold">
                    Total: {(nouveauProduit.prix * quantiteNouveau).toFixed(2)} MAD
                  </div>
                </div>
              )}

              {/* Calcul de la différence */}
              {ancienProduit && nouveauProduit && (
                <Card className="bg-gray-800/30 border-gaming-purple">
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      Calcul de l'échange
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ancien produit:</span>
                        <span className="text-red-400">-{(ancienProduit.prix * quantiteAncien).toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Nouveau produit:</span>
                        <span className="text-green-400">+{(nouveauProduit.prix * quantiteNouveau).toFixed(2)} MAD</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-white">Différence:</span>
                          <span className={difference > 0 ? 'text-red-400' : difference < 0 ? 'text-green-400' : 'text-white'}>
                            {difference > 0 ? '+' : ''}{difference.toFixed(2)} MAD
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          {difference > 0 ? 'Le client doit payer la différence' : 
                           difference < 0 ? 'Le magasin doit rembourser la différence' : 
                           'Échange à valeur égale'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-gray-600 text-gray-300"
                >
                  Retour
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!nouveauProduit}
                  className="gaming-gradient"
                >
                  Continuer
                </Button>
              </div>
            </div>
          )}

          {/* Étape 2: Confirmation pour le mode retour */}
          {step === 2 && mode === 'retour' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Étape 2: Confirmation du retour</h3>
              
              {/* Résumé du retour */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Résumé du retour</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <h4 className="text-red-400 font-medium mb-2">Produit à retourner</h4>
                    <div className="text-white">{ancienProduit?.nom}</div>
                    <div className="text-sm text-gray-400">Quantité: {quantiteAncien}</div>
                    <div className="text-sm text-gray-400">
                      Valeur: {ancienProduit ? (ancienProduit.prix * quantiteAncien).toFixed(2) : '0'} MAD
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Client</Label>
                      <div className="text-white">
                        {(() => {
                          const selectedClientData = clients.find(c => c.id === selectedClient);
                          return selectedClientData ? `${selectedClientData.prenom} ${selectedClientData.nom}` : selectedClient;
                        })()}
                      </div>
                      {(() => {
                        const selectedClientData = clients.find(c => c.id === selectedClient);
                        return selectedClientData?.email && (
                          <div className="text-sm text-gray-400">{selectedClientData.email}</div>
                        );
                      })()}
                    </div>
                    <div>
                      <Label className="text-gray-300">Motif du retour</Label>
                      <div className="text-white">{motifReprise || 'Non spécifié'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-300 text-sm text-center">
                  ℹ️ Le retour sera créé avec le statut "en attente" et pourra être traité depuis la page de gestion des retours.
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-gray-600 text-gray-300"
                >
                  Retour
                </Button>
                <Button
                  onClick={finaliserReprise}
                  className="gaming-gradient"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Créer le retour
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3: Confirmation et paiement */}
          {step === 3 && mode !== 'retour' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Étape 3: Confirmation et paiement</h3>
              
              {/* Résumé de l'échange */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Résumé de l'échange</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <h4 className="text-red-400 font-medium mb-2">Produit repris</h4>
                      <div className="text-white">{ancienProduit?.nom}</div>
                      <div className="text-sm text-gray-400">Quantité: {quantiteAncien}</div>
                      <div className="text-sm text-gray-400">
                        Valeur: {ancienProduit ? (ancienProduit.prix * quantiteAncien).toFixed(2) : '0'} MAD
                      </div>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <h4 className="text-green-400 font-medium mb-2">Nouveau produit</h4>
                      <div className="text-white">{nouveauProduit?.nom}</div>
                      <div className="text-sm text-gray-400">Quantité: {quantiteNouveau}</div>
                      <div className="text-sm text-gray-400">
                        Valeur: {nouveauProduit ? (nouveauProduit.prix * quantiteNouveau).toFixed(2) : '0'} MAD
                      </div>
                    </div>
                  </div>

                  <div className="text-center border-t border-gray-600 pt-4">
                    <div className="text-lg font-bold">
                      <span className="text-white">Différence à </span>
                      <span className={difference > 0 ? 'text-red-400' : difference < 0 ? 'text-green-400' : 'text-white'}>
                        {difference > 0 ? 'encaisser' : difference < 0 ? 'rembourser' : 'aucune différence'}
                        : {Math.abs(difference).toFixed(2)} MAD
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mode de paiement pour la différence */}
              {difference !== 0 && (
                <Card className="tech-gradient border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Mode de {difference > 0 ? 'paiement' : 'remboursement'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Mode de {difference > 0 ? 'paiement' : 'remboursement'}</Label>
                      <Select value={modePaiementDifference} onValueChange={(value: any) => setModePaiementDifference(value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="especes">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              Espèces
                            </div>
                          </SelectItem>
                          <SelectItem value="carte">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Carte bancaire
                            </div>
                          </SelectItem>
                          <SelectItem value="virement">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Virement bancaire
                            </div>
                          </SelectItem>
                          <SelectItem value="cheque">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Chèque
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {modePaiementDifference === 'virement' && (
                      <div>
                        <Label className="text-gray-300">Compte bancaire</Label>
                        <Select value={compteBancaire} onValueChange={setCompteBancaire}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Sélectionnez un compte" />
                          </SelectTrigger>
                          <SelectContent>
                            {comptes.filter(c => c.statut === 'Actif').map((compte) => (
                              <SelectItem key={compte.id} value={compte.id}>
                                {compte.nom_compte} - {compte.nom_banque}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-gray-600 text-gray-300"
                >
                  Retour
                </Button>
                <Button
                  onClick={finaliserReprise}
                  className="gaming-gradient"
                  disabled={difference !== 0 && modePaiementDifference === 'virement' && !compteBancaire}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Finaliser la reprise
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 