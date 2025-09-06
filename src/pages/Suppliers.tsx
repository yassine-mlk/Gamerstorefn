import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Package, 
  Calendar, 
  Truck, 
  Loader2,
  User,
  CreditCard,
  History,
  Eye,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSuppliers, type Supplier, type NewSupplier } from "@/hooks/useSuppliers";
import { useSupplierPurchases } from "@/hooks/useSupplierPurchases";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";

export default function Suppliers() {
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { purchases, payments, balances, addPayment, getPurchasesBySupplier, getPaymentsBySupplier, getSupplierBalance } = useSupplierPurchases();
  const { comptes: bankAccounts } = useBankAccounts();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"especes" | "virement" | "cheque">("especes");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [newSupplier, setNewSupplier] = useState<NewSupplier>({
    nom: "",
    contact_principal: "",
    email: "",
    telephone: "",
    adresse: "",
    specialite: "",
    statut: "Actif",
    conditions_paiement: "",
    delai_livraison_moyen: undefined,
    notes: "",
    type_fournisseur: "entreprise",
    ice: ""
  });

  // Filtrer les fournisseurs localement
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = suppliers.filter(supplier =>
        supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.specialite && supplier.specialite.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.ice && supplier.ice.includes(searchTerm))
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [suppliers, searchTerm]);

  const handleAddSupplier = async () => {
    if (!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Validation spécifique pour les entreprises
    if (newSupplier.type_fournisseur === 'entreprise' && !newSupplier.ice) {
      toast({
        title: "Erreur",
        description: "Le numéro ICE est obligatoire pour les entreprises",
        variant: "destructive",
      });
      return;
    }

    const result = await addSupplier(newSupplier);
    if (result) {
      setNewSupplier({
        nom: "",
        contact_principal: "",
        email: "",
        telephone: "",
        adresse: "",
        specialite: "",
        statut: "Actif",
        conditions_paiement: "",
        delai_livraison_moyen: undefined,
        notes: "",
        type_fournisseur: "entreprise",
        ice: ""
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditSupplier = async () => {
    if (!selectedSupplier || !newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Validation spécifique pour les entreprises
    if (newSupplier.type_fournisseur === 'entreprise' && !newSupplier.ice) {
      toast({
        title: "Erreur",
        description: "Le numéro ICE est obligatoire pour les entreprises",
        variant: "destructive",
      });
      return;
    }

    const result = await updateSupplier(selectedSupplier.id, newSupplier);
    if (result) {
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      setNewSupplier({
        nom: "",
        contact_principal: "",
        email: "",
        telephone: "",
        adresse: "",
        specialite: "",
        statut: "Actif",
        conditions_paiement: "",
        delai_livraison_moyen: undefined,
        notes: "",
        type_fournisseur: "entreprise",
        ice: ""
      });
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      await deleteSupplier(id);
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setNewSupplier({
      nom: supplier.nom,
      contact_principal: supplier.contact_principal,
      email: supplier.email,
      telephone: supplier.telephone || "",
      adresse: supplier.adresse || "",
      specialite: supplier.specialite || "",
      statut: supplier.statut,
      conditions_paiement: supplier.conditions_paiement || "",
      delai_livraison_moyen: supplier.delai_livraison_moyen,
      notes: supplier.notes || "",
      type_fournisseur: supplier.type_fournisseur || "entreprise",
      ice: supplier.ice || ""
    });
    setIsEditDialogOpen(true);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Privilégié': return 'bg-purple-600 text-white';
      case 'Actif': return 'bg-green-600 text-white';
      case 'Inactif': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const handlePayment = async () => {
    if (!selectedSupplier || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un montant valide",
        variant: "destructive",
      });
      return;
    }

    // Validation pour les virements
    if (paymentMode === 'virement' && !selectedBankAccount) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un compte bancaire pour le virement",
        variant: "destructive",
      });
      return;
    }

    const payment = await addPayment({
      fournisseur_id: selectedSupplier.id,
      montant: parseFloat(paymentAmount),
      mode_paiement: paymentMode,
      compte_bancaire_id: paymentMode === 'virement' ? selectedBankAccount : undefined,
      date_paiement: new Date().toISOString().split('T')[0],
      description: paymentDescription || `Paiement à ${selectedSupplier.nom}`
    });

    if (payment) {
      toast({
        title: "Succès",
        description: "Paiement effectué avec succès",
        variant: "default",
      });
      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentDescription("");
      setSelectedBankAccount("");
      setSelectedSupplier(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des fournisseurs</h1>
            <p className="text-gray-600">Gérez vos partenaires et leurs commandes</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-5 h-5 text-blue-600" />
                Ajouter un nouveau fournisseur
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Créez un nouveau profil fournisseur pour gérer vos partenaires commerciaux
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Section 1: Type de fournisseur */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                  <h3 className="text-lg font-semibold text-gray-900">Type de fournisseur</h3>
                  <span className="text-xs text-red-600 font-medium">* Obligatoire</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Choisissez le type de fournisseur pour adapter les champs requis</p>
                
                <RadioGroup 
                  value={newSupplier.type_fournisseur} 
                  onValueChange={(value: any) => setNewSupplier({...newSupplier, type_fournisseur: value, ice: value === 'particulier' ? '' : newSupplier.ice})}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-white">
                    <RadioGroupItem value="particulier" id="particulier" />
                    <Label htmlFor="particulier" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Particulier</div>
                        <div className="text-xs text-gray-600">Fournisseur individuel</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-white">
                    <RadioGroupItem value="entreprise" id="entreprise" />
                    <Label htmlFor="entreprise" className="flex items-center gap-2 cursor-pointer">
                      <Building className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">Entreprise</div>
                        <div className="text-xs text-gray-600">Société ou organisation</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Section 2: Informations principales */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {newSupplier.type_fournisseur === 'particulier' ? 'Informations personnelles' : 'Informations entreprise'}
                  </h3>
                  <span className="text-xs text-red-600 font-medium">* Obligatoire</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nom" className="flex items-center gap-2 text-gray-700 mb-2">
                      <Building className="w-4 h-4" />
                      {newSupplier.type_fournisseur === 'particulier' ? 'Nom complet *' : 'Nom de l\'entreprise *'}
                    </Label>
                    <Input
                      id="nom"
                      value={newSupplier.nom}
                      onChange={(e) => setNewSupplier({...newSupplier, nom: e.target.value})}
                      placeholder={newSupplier.type_fournisseur === 'particulier' ? "Ex: Ahmed Benali, Fatima Zghouri..." : "Ex: TechDistrib Solutions, Gaming Hardware Pro..."}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact" className="flex items-center gap-2 text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Contact principal *
                    </Label>
                    <Input
                      id="contact"
                      value={newSupplier.contact_principal}
                      onChange={(e) => setNewSupplier({...newSupplier, contact_principal: e.target.value})}
                      placeholder={newSupplier.type_fournisseur === 'particulier' ? "Ex: Ahmed Benali" : "Ex: Ahmed Benali, Fatima Zghouri..."}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {newSupplier.type_fournisseur === 'particulier' ? 'Nom de la personne' : 'Personne responsable des relations commerciales'}
                    </p>
                  </div>

                  {newSupplier.type_fournisseur === 'entreprise' && (
                    <div>
                      <Label htmlFor="ice" className="flex items-center gap-2 text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4" />
                        Numéro ICE *
                      </Label>
                      <Input
                        id="ice"
                        value={newSupplier.ice}
                        onChange={(e) => setNewSupplier({...newSupplier, ice: e.target.value})}
                        placeholder="Ex: 001234567000045"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Identifiant Commerce Entreprise (obligatoire pour les entreprises)
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="specialite" className="flex items-center gap-2 text-gray-700 mb-2">
                      <Package className="w-4 h-4" />
                      Spécialité principale
                    </Label>
                    <Select value={newSupplier.specialite} onValueChange={(value) => setNewSupplier({...newSupplier, specialite: value})}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Sélectionnez une spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Composants PC">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Composants PC
                          </div>
                        </SelectItem>
                        <SelectItem value="Périphériques gaming">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Périphériques gaming
                          </div>
                        </SelectItem>
                        <SelectItem value="PC portables">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            PC portables
                          </div>
                        </SelectItem>
                        <SelectItem value="Moniteurs">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Moniteurs
                          </div>
                        </SelectItem>
                        <SelectItem value="Chaises gaming">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Chaises gaming
                          </div>
                        </SelectItem>
                        <SelectItem value="Accessoires">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Accessoires
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact et localisation */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact et localisation</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Adresse email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      placeholder="Ex: contact@fournisseur.com"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telephone" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Phone className="w-4 h-4" />
                      Numéro de téléphone
                    </Label>
                    <Input
                      id="telephone"
                      value={newSupplier.telephone}
                      onChange={(e) => setNewSupplier({...newSupplier, telephone: e.target.value})}
                      placeholder="Ex: 05 22 12 34 56 ou +212 5 22 12 34 56"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse" className="flex items-center gap-2 text-gray-300 mb-2">
                      <MapPin className="w-4 h-4" />
                      Adresse complète
                    </Label>
                    <Textarea
                      id="adresse"
                      value={newSupplier.adresse}
                      onChange={(e) => setNewSupplier({...newSupplier, adresse: e.target.value})}
                      placeholder="Ex: Zone Industrielle Sidi Bernoussi, Lot 25, Casablanca 20000"
                      rows={3}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Conditions commerciales */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gaming-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">3</div>
                  <h3 className="text-lg font-semibold text-white">Conditions commerciales</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="conditions" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Calendar className="w-4 h-4" />
                      Conditions de paiement
                    </Label>
                    <Select value={newSupplier.conditions_paiement} onValueChange={(value) => setNewSupplier({...newSupplier, conditions_paiement: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Sélectionnez les conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Comptant">Paiement comptant</SelectItem>
                        <SelectItem value="15 jours net">15 jours net</SelectItem>
                        <SelectItem value="30 jours net">30 jours net</SelectItem>
                        <SelectItem value="45 jours net">45 jours net</SelectItem>
                        <SelectItem value="60 jours net">60 jours net</SelectItem>
                        <SelectItem value="Fin de mois">Fin de mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="delai" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Truck className="w-4 h-4" />
                      Délai de livraison (jours)
                    </Label>
                    <Input
                      id="delai"
                      type="number"
                      value={newSupplier.delai_livraison_moyen || ''}
                      onChange={(e) => setNewSupplier({...newSupplier, delai_livraison_moyen: e.target.value ? parseInt(e.target.value) : undefined})}
                      placeholder="Ex: 5"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Délai moyen de livraison en jours ouvrés
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="statut" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Badge className="w-4 h-4" />
                    Statut du fournisseur
                  </Label>
                  <Select value={newSupplier.statut} onValueChange={(value: any) => setNewSupplier({...newSupplier, statut: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Actif">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Actif - Fournisseur régulier
                        </div>
                      </SelectItem>
                      <SelectItem value="Privilégié">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Privilégié - Partenaire préférentiel
                        </div>
                      </SelectItem>
                      <SelectItem value="Inactif">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          Inactif - Collaboration suspendue
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section 4: Notes et remarques */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">4</div>
                  <h3 className="text-lg font-semibold text-gray-900">Notes et remarques</h3>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="flex items-center gap-2 text-gray-700 mb-2">
                    <Edit className="w-4 h-4" />
                    Notes additionnelles
                  </Label>
                  <Textarea
                    id="notes"
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                    placeholder="Qualité des produits, ponctualité, conditions spéciales, historique de collaboration..."
                    rows={4}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Résumé et validation */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-gray-900 font-medium mb-2">Récapitulatif</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Entreprise:</strong> {newSupplier.nom || 'Non renseigné'}</p>
                  <p><strong>Contact:</strong> {newSupplier.contact_principal || 'Non renseigné'}</p>
                  <p><strong>Email:</strong> {newSupplier.email || 'Non renseigné'}</p>
                  <p><strong>Spécialité:</strong> {newSupplier.specialite || 'Non renseignée'}</p>
                  <p><strong>Conditions:</strong> {newSupplier.conditions_paiement || 'Non définies'}</p>
                  {newSupplier.delai_livraison_moyen && (
                    <p><strong>Délai livraison:</strong> {newSupplier.delai_livraison_moyen} jours</p>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleAddSupplier}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-12 text-base font-medium"
                  disabled={!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le fournisseur
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-6 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Fournisseurs</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliers.filter(s => s.statut === 'Actif').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Privilégiés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliers.filter(s => s.statut === 'Privilégié').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Package className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Commandes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(suppliers.reduce((sum, s) => sum + s.total_commandes, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Particuliers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliers.filter(s => s.type_fournisseur === 'particulier').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Entreprises</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliers.filter(s => s.type_fournisseur === 'entreprise').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Rechercher un fournisseur (nom, contact, spécialité, ICE)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Liste des fournisseurs</CardTitle>
          <CardDescription className="text-gray-600">
            {filteredSuppliers.length} fournisseur{filteredSuppliers.length > 1 ? 's' : ''} trouvé{filteredSuppliers.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {supplier.nom}
                        </h3>
                        <Badge className={`${getStatutColor(supplier.statut)} text-white`}>
                          {supplier.statut}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {supplier.email}
                        </div>
                        {supplier.telephone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {supplier.telephone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Partenaire depuis le {formatDate(supplier.date_partenariat)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Contact: {supplier.contact_principal}
                        </div>
                        <div className="flex items-center gap-2">
                          {supplier.type_fournisseur === 'particulier' ? (
                            <User className="w-4 h-4 text-green-600" />
                          ) : (
                            <Building className="w-4 h-4 text-purple-600" />
                          )}
                          {supplier.type_fournisseur === 'particulier' ? 'Particulier' : 'Entreprise'}
                        </div>
                        {supplier.type_fournisseur === 'entreprise' && supplier.ice && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            ICE: {supplier.ice}
                          </div>
                        )}
                        {supplier.specialite && (
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {supplier.specialite}
                          </div>
                        )}
                        {supplier.delai_livraison_moyen && (
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Livraison: {supplier.delai_livraison_moyen} jours
                          </div>
                        )}
                        {supplier.adresse && (
                          <div className="flex items-center gap-2 col-span-full">
                            <MapPin className="w-4 h-4" />
                            {supplier.adresse}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="text-green-600">
                          Total commandes: {formatCurrency(supplier.total_commandes)}
                        </span>
                        <span className={`font-semibold ${
                          getSupplierBalance(supplier.id).solde_restant > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          Solde dû: {formatCurrency(getSupplierBalance(supplier.id).solde_restant)}
                        </span>
                        {supplier.derniere_commande && (
                          <span className="text-gray-600">
                            Dernière commande: {formatDate(supplier.derniere_commande)}
                          </span>
                        )}
                        {supplier.conditions_paiement && (
                          <span className="text-gray-600">
                            Paiement: {supplier.conditions_paiement}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setIsDetailsDialogOpen(true);
                      }}
                      className="hover:bg-blue-600/20 hover:border-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setIsPaymentDialogOpen(true);
                      }}
                      className="hover:bg-green-600/20 hover:border-green-600"
                    >
                      <CreditCard className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="hover:bg-red-600/20 hover:border-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                Aucun fournisseur trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="w-5 h-5 text-orange-600" />
              Modifier le fournisseur
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Modifiez les informations du fournisseur sélectionné
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Section 1: Type de fournisseur */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Type de fournisseur</h3>
                <span className="text-xs text-red-600 font-medium">* Obligatoire</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Choisissez le type de fournisseur pour adapter les champs requis</p>
              
              <RadioGroup 
                value={newSupplier.type_fournisseur} 
                onValueChange={(value: any) => setNewSupplier({...newSupplier, type_fournisseur: value, ice: value === 'particulier' ? '' : newSupplier.ice})}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-white">
                  <RadioGroupItem value="particulier" id="particulier" />
                  <Label htmlFor="particulier" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Particulier</div>
                      <div className="text-xs text-gray-600">Fournisseur individuel</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-white">
                  <RadioGroupItem value="entreprise" id="entreprise" />
                  <Label htmlFor="entreprise" className="flex items-center gap-2 cursor-pointer">
                    <Building className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Entreprise</div>
                      <div className="text-xs text-gray-600">Société ou organisation</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Section 2: Informations principales */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {newSupplier.type_fournisseur === 'particulier' ? 'Informations personnelles' : 'Informations entreprise'}
                </h3>
                <span className="text-xs text-red-600 font-medium">* Obligatoire</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-nom" className="flex items-center gap-2 text-gray-700 mb-2">
                    <Building className="w-4 h-4" />
                    {newSupplier.type_fournisseur === 'particulier' ? 'Nom complet *' : 'Nom de l\'entreprise *'}
                  </Label>
                  <Input
                    id="edit-nom"
                    value={newSupplier.nom}
                    onChange={(e) => setNewSupplier({...newSupplier, nom: e.target.value})}
                    placeholder={newSupplier.type_fournisseur === 'particulier' ? "Ex: Ahmed Benali, Fatima Zghouri..." : "Ex: TechDistrib Solutions, Gaming Hardware Pro..."}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-contact" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Phone className="w-4 h-4" />
                    Contact principal *
                  </Label>
                  <Input
                    id="edit-contact"
                    value={newSupplier.contact_principal}
                    onChange={(e) => setNewSupplier({...newSupplier, contact_principal: e.target.value})}
                    placeholder={newSupplier.type_fournisseur === 'particulier' ? "Ex: Ahmed Benali" : "Ex: Ahmed Benali, Fatima Zghouri..."}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newSupplier.type_fournisseur === 'particulier' ? 'Nom de la personne' : 'Personne responsable des relations commerciales'}
                  </p>
                </div>

                {newSupplier.type_fournisseur === 'entreprise' && (
                  <div>
                    <Label htmlFor="edit-ice" className="flex items-center gap-2 text-gray-700 mb-2">
                      <CreditCard className="w-4 h-4" />
                      Numéro ICE *
                    </Label>
                    <Input
                      id="edit-ice"
                      value={newSupplier.ice}
                      onChange={(e) => setNewSupplier({...newSupplier, ice: e.target.value})}
                      placeholder="Ex: 001234567000045"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Identifiant Commerce Entreprise (obligatoire pour les entreprises)
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="edit-specialite" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Package className="w-4 h-4" />
                    Spécialité principale
                  </Label>
                  <Select value={newSupplier.specialite} onValueChange={(value) => setNewSupplier({...newSupplier, specialite: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Sélectionnez une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Composants PC">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Composants PC
                        </div>
                      </SelectItem>
                      <SelectItem value="Périphériques gaming">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Périphériques gaming
                        </div>
                      </SelectItem>
                      <SelectItem value="PC portables">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          PC portables
                        </div>
                      </SelectItem>
                      <SelectItem value="Moniteurs">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Moniteurs
                        </div>
                      </SelectItem>
                      <SelectItem value="Chaises gaming">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Chaises gaming
                        </div>
                      </SelectItem>
                      <SelectItem value="Accessoires">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Accessoires
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact et localisation */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
                <h3 className="text-lg font-semibold text-white">Contact et localisation</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-email" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Mail className="w-4 h-4" />
                    Adresse email *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    placeholder="Ex: contact@fournisseur.com"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-telephone" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Phone className="w-4 h-4" />
                    Numéro de téléphone
                  </Label>
                  <Input
                    id="edit-telephone"
                    value={newSupplier.telephone}
                    onChange={(e) => setNewSupplier({...newSupplier, telephone: e.target.value})}
                    placeholder="Ex: 05 22 12 34 56 ou +212 5 22 12 34 56"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-adresse" className="flex items-center gap-2 text-gray-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    Adresse complète
                  </Label>
                  <Textarea
                    id="edit-adresse"
                    value={newSupplier.adresse}
                    onChange={(e) => setNewSupplier({...newSupplier, adresse: e.target.value})}
                    placeholder="Ex: Zone Industrielle Sidi Bernoussi, Lot 25, Casablanca 20000"
                    rows={3}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Conditions commerciales */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">3</div>
                <h3 className="text-lg font-semibold text-white">Conditions commerciales</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-conditions" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Conditions de paiement
                  </Label>
                  <Select value={newSupplier.conditions_paiement} onValueChange={(value) => setNewSupplier({...newSupplier, conditions_paiement: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Sélectionnez les conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comptant">Paiement comptant</SelectItem>
                      <SelectItem value="15 jours net">15 jours net</SelectItem>
                      <SelectItem value="30 jours net">30 jours net</SelectItem>
                      <SelectItem value="45 jours net">45 jours net</SelectItem>
                      <SelectItem value="60 jours net">60 jours net</SelectItem>
                      <SelectItem value="Fin de mois">Fin de mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-delai" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Truck className="w-4 h-4" />
                    Délai de livraison (jours)
                  </Label>
                  <Input
                    id="edit-delai"
                    type="number"
                    value={newSupplier.delai_livraison_moyen || ''}
                    onChange={(e) => setNewSupplier({...newSupplier, delai_livraison_moyen: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="Ex: 5"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Délai moyen de livraison en jours ouvrés
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="edit-statut" className="flex items-center gap-2 text-gray-300 mb-2">
                  <Badge className="w-4 h-4" />
                  Statut du fournisseur
                </Label>
                <Select value={newSupplier.statut} onValueChange={(value: any) => setNewSupplier({...newSupplier, statut: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actif">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Actif - Fournisseur régulier
                      </div>
                    </SelectItem>
                    <SelectItem value="Privilégié">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Privilégié - Partenaire préférentiel
                      </div>
                    </SelectItem>
                    <SelectItem value="Inactif">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Inactif - Collaboration suspendue
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section 4: Notes et remarques */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">4</div>
                <h3 className="text-lg font-semibold text-white">Notes et remarques</h3>
              </div>
              
              <div>
                <Label htmlFor="edit-notes" className="flex items-center gap-2 text-gray-300 mb-2">
                  <Edit className="w-4 h-4" />
                  Notes additionnelles
                </Label>
                <Textarea
                  id="edit-notes"
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                  placeholder="Qualité des produits, ponctualité, conditions spéciales, historique de collaboration..."
                  rows={4}
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleEditSupplier}
                className="bg-gaming-yellow hover:bg-gaming-yellow/80 text-black flex-1 h-12 text-base font-medium"
                disabled={!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email}
              >
                <Edit className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="px-6 h-12 border-gray-600 hover:bg-gray-800"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog - Historique des achats */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
              <History className="w-5 h-5 text-blue-600" />
              Historique - {selectedSupplier?.nom}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Suivi des achats et paiements pour ce fournisseur
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupplier && (
            <Tabs defaultValue="purchases" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="purchases">Achats</TabsTrigger>
                <TabsTrigger value="payments">Paiements</TabsTrigger>
                <TabsTrigger value="balance">Solde</TabsTrigger>
              </TabsList>
              
              <TabsContent value="purchases" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Historique des achats</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>N° Facture</TableHead>
                          <TableHead>Montant Total</TableHead>
                          <TableHead>Montant Payé</TableHead>
                          <TableHead>Restant</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getPurchasesBySupplier(selectedSupplier.id).map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell>{new Date(purchase.date_achat).toLocaleDateString()}</TableCell>
                            <TableCell>{purchase.numero_facture || '-'}</TableCell>
                            <TableCell>{formatCurrency(purchase.montant_total)}</TableCell>
                            <TableCell>{formatCurrency(purchase.montant_paye)}</TableCell>
                            <TableCell>{formatCurrency(purchase.montant_restant)}</TableCell>
                            <TableCell>
                              <Badge className={`${
                                purchase.statut_paiement === 'paye' ? 'bg-green-100 text-green-800' :
                                purchase.statut_paiement === 'partiel' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {purchase.statut_paiement === 'paye' ? 'Payé' :
                                 purchase.statut_paiement === 'partiel' ? 'Partiel' : 'En attente'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {getPurchasesBySupplier(selectedSupplier.id).length === 0 && (
                      <div className="text-center py-8 text-gray-600">
                        Aucun achat enregistré pour ce fournisseur
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Historique des paiements</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getPaymentsBySupplier(selectedSupplier.id).map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.date_paiement).toLocaleDateString()}</TableCell>
                            <TableCell>{formatCurrency(payment.montant)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {payment.mode_paiement === 'especes' ? 'Espèces' :
                                 payment.mode_paiement === 'virement' ? 'Virement' : 'Chèque'}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.description || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {getPaymentsBySupplier(selectedSupplier.id).length === 0 && (
                      <div className="text-center py-8 text-gray-600">
                        Aucun paiement enregistré pour ce fournisseur
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="balance" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Situation financière</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Total des achats</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(getSupplierBalance(selectedSupplier.id).total_achats)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Total payé</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(getSupplierBalance(selectedSupplier.id).total_paye)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <History className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-600">Solde restant</p>
                            <p className="text-lg font-semibold text-red-600">
                              {formatCurrency(getSupplierBalance(selectedSupplier.id).solde_restant)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
              <CreditCard className="w-5 h-5 text-green-600" />
              Effectuer un paiement
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Paiement à {selectedSupplier?.nom}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Solde restant à payer</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(getSupplierBalance(selectedSupplier.id).solde_restant)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="payment-amount" className="text-gray-900">Montant du paiement</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="payment-mode" className="text-gray-900">Mode de paiement</Label>
                <Select value={paymentMode} onValueChange={(value: any) => setPaymentMode(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="virement">Virement bancaire</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {paymentMode === 'virement' && (
                <div>
                  <Label htmlFor="bank-account" className="text-gray-900">Compte bancaire</Label>
                  <Select value={selectedBankAccount} onValueChange={(value: string) => setSelectedBankAccount(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez un compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.nom_banque} - {account.numero_compte} ({formatCurrency(account.solde_actuel)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="payment-description" className="text-gray-900">Description (optionnel)</Label>
                <Textarea
                  id="payment-description"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="Description du paiement..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handlePayment}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Effectuer le paiement
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsPaymentDialogOpen(false);
                    setPaymentAmount("");
                    setPaymentDescription("");
                    setSelectedBankAccount("");
                    setSelectedSupplier(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
