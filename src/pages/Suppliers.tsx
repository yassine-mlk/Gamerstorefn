import { useState, useEffect } from "react";
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
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Package,
  Loader2
} from "lucide-react";
import { useSuppliers, type Supplier, type NewSupplier } from "@/hooks/useSuppliers";
import { formatCurrency } from "@/lib/currency";

export default function Suppliers() {
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
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
    notes: ""
  });

  // Filtrer les fournisseurs localement
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = suppliers.filter(supplier =>
        supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.specialite && supplier.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [suppliers, searchTerm]);

  const handleAddSupplier = async () => {
    if (!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email) {
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
        notes: ""
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditSupplier = async () => {
    if (!selectedSupplier || !newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email) {
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
        notes: ""
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
      notes: supplier.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Privilégié': return 'bg-gaming-purple';
      case 'Actif': return 'bg-gaming-green';
      case 'Inactif': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

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
            <h1 className="text-3xl font-bold text-white">Gestion des fournisseurs</h1>
            <p className="text-gray-400">Gérez vos partenaires et leurs commandes</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-5 h-5 text-gaming-cyan" />
                Ajouter un nouveau fournisseur
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Créez un nouveau profil fournisseur pour gérer vos partenaires commerciaux
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Section 1: Informations entreprise */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gaming-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">1</div>
                  <h3 className="text-lg font-semibold text-white">Informations entreprise</h3>
                  <span className="text-xs text-red-400 font-medium">* Obligatoire</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nom" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Building className="w-4 h-4" />
                      Nom de l'entreprise *
                    </Label>
                    <Input
                      id="nom"
                      value={newSupplier.nom}
                      onChange={(e) => setNewSupplier({...newSupplier, nom: e.target.value})}
                      placeholder="Ex: TechDistrib Solutions, Gaming Hardware Pro..."
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Phone className="w-4 h-4" />
                      Contact principal *
                    </Label>
                    <Input
                      id="contact"
                      value={newSupplier.contact_principal}
                      onChange={(e) => setNewSupplier({...newSupplier, contact_principal: e.target.value})}
                      placeholder="Ex: Ahmed Benali, Fatima Zghouri..."
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Personne responsable des relations commerciales
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="specialite" className="flex items-center gap-2 text-gray-300 mb-2">
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
                  <div className="w-6 h-6 bg-gaming-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
                  <h3 className="text-lg font-semibold text-white">Contact et localisation</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Mail className="w-4 h-4" />
                      Adresse email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      placeholder="Ex: contact@fournisseur.com"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
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
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gaming-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">4</div>
                  <h3 className="text-lg font-semibold text-white">Notes et remarques</h3>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Edit className="w-4 h-4" />
                    Notes additionnelles
                  </Label>
                  <Textarea
                    id="notes"
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                    placeholder="Qualité des produits, ponctualité, conditions spéciales, historique de collaboration..."
                    rows={4}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Résumé et validation */}
              <div className="p-4 bg-gaming-blue/10 border border-gaming-blue/30 rounded-lg">
                <h4 className="text-white font-medium mb-2">Récapitulatif</h4>
                <div className="text-sm text-gray-300 space-y-1">
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
                  className="gaming-gradient flex-1 h-12 text-base font-medium"
                  disabled={!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le fournisseur
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-6 h-12 border-gray-600 hover:bg-gray-800"
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
        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-blue/20 rounded-lg">
                <Truck className="w-6 h-6 text-gaming-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Fournisseurs</p>
                <p className="text-2xl font-bold text-white">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-green/20 rounded-lg">
                <Truck className="w-6 h-6 text-gaming-green" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Actifs</p>
                <p className="text-2xl font-bold text-white">
                  {suppliers.filter(s => s.statut === 'Actif').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-purple/20 rounded-lg">
                <Truck className="w-6 h-6 text-gaming-purple" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Privilégiés</p>
                <p className="text-2xl font-bold text-white">
                  {suppliers.filter(s => s.statut === 'Privilégié').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-cyan/20 rounded-lg">
                <Package className="w-6 h-6 text-gaming-cyan" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Commandes</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(suppliers.reduce((sum, s) => sum + s.total_commandes, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-card border-gray-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un fournisseur (nom, contact, spécialité)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card className="bg-card border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Liste des fournisseurs</CardTitle>
          <CardDescription>
            {filteredSuppliers.length} fournisseur{filteredSuppliers.length > 1 ? 's' : ''} trouvé{filteredSuppliers.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gaming-blue/20 rounded-lg">
                      <Building className="w-6 h-6 text-gaming-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {supplier.nom}
                        </h3>
                        <Badge className={`${getStatutColor(supplier.statut)} text-white`}>
                          {supplier.statut}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
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
                        <span className="text-gaming-green">
                          Total commandes: {formatCurrency(supplier.total_commandes)}
                        </span>
                        {supplier.derniere_commande && (
                          <span className="text-gray-400">
                            Dernière commande: {formatDate(supplier.derniere_commande)}
                          </span>
                        )}
                        {supplier.conditions_paiement && (
                          <span className="text-gray-400">
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
              <div className="text-center py-8 text-gray-400">
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
              <Edit className="w-5 h-5 text-gaming-yellow" />
              Modifier le fournisseur
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les informations du fournisseur sélectionné
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Section 1: Informations entreprise */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">1</div>
                <h3 className="text-lg font-semibold text-white">Informations entreprise</h3>
                <span className="text-xs text-red-400 font-medium">* Obligatoire</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-nom" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Building className="w-4 h-4" />
                    Nom de l'entreprise *
                  </Label>
                  <Input
                    id="edit-nom"
                    value={newSupplier.nom}
                    onChange={(e) => setNewSupplier({...newSupplier, nom: e.target.value})}
                    placeholder="Ex: TechDistrib Solutions, Gaming Hardware Pro..."
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
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
                    placeholder="Ex: Ahmed Benali, Fatima Zghouri..."
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Personne responsable des relations commerciales
                  </p>
                </div>

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
    </div>
  );
}
