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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
              <DialogDescription>
                Remplissez les informations du nouveau fournisseur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'entreprise *</Label>
                <Input
                  id="nom"
                  value={newSupplier.nom}
                  onChange={(e) => setNewSupplier({...newSupplier, nom: e.target.value})}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact principal *</Label>
                <Input
                  id="contact"
                  value={newSupplier.contact_principal}
                  onChange={(e) => setNewSupplier({...newSupplier, contact_principal: e.target.value})}
                  placeholder="Nom du contact"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={newSupplier.telephone}
                  onChange={(e) => setNewSupplier({...newSupplier, telephone: e.target.value})}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea
                  id="adresse"
                  value={newSupplier.adresse}
                  onChange={(e) => setNewSupplier({...newSupplier, adresse: e.target.value})}
                  placeholder="Adresse complète"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="specialite">Spécialité</Label>
                <Input
                  id="specialite"
                  value={newSupplier.specialite}
                  onChange={(e) => setNewSupplier({...newSupplier, specialite: e.target.value})}
                  placeholder="ex: Composants PC, Périphériques..."
                />
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select value={newSupplier.statut} onValueChange={(value: any) => setNewSupplier({...newSupplier, statut: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                    <SelectItem value="Privilégié">Privilégié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conditions">Conditions de paiement</Label>
                <Input
                  id="conditions"
                  value={newSupplier.conditions_paiement}
                  onChange={(e) => setNewSupplier({...newSupplier, conditions_paiement: e.target.value})}
                  placeholder="ex: 30 jours net"
                />
              </div>
              <div>
                <Label htmlFor="delai">Délai de livraison moyen (jours)</Label>
                <Input
                  id="delai"
                  type="number"
                  value={newSupplier.delai_livraison_moyen || ''}
                  onChange={(e) => setNewSupplier({...newSupplier, delai_livraison_moyen: e.target.value ? parseInt(e.target.value) : undefined})}
                  placeholder="ex: 5"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                  placeholder="Notes additionnelles"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddSupplier}
                  className="gaming-gradient flex-1"
                  disabled={!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email}
                >
                  Ajouter
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le fournisseur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du fournisseur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nom">Nom de l'entreprise *</Label>
              <Input
                id="edit-nom"
                value={newSupplier.nom}
                onChange={(e) => setNewSupplier({...newSupplier, nom: e.target.value})}
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div>
              <Label htmlFor="edit-contact">Contact principal *</Label>
              <Input
                id="edit-contact"
                value={newSupplier.contact_principal}
                onChange={(e) => setNewSupplier({...newSupplier, contact_principal: e.target.value})}
                placeholder="Nom du contact"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-telephone">Téléphone</Label>
              <Input
                id="edit-telephone"
                value={newSupplier.telephone}
                onChange={(e) => setNewSupplier({...newSupplier, telephone: e.target.value})}
                placeholder="01 23 45 67 89"
              />
            </div>
            <div>
              <Label htmlFor="edit-adresse">Adresse</Label>
              <Textarea
                id="edit-adresse"
                value={newSupplier.adresse}
                onChange={(e) => setNewSupplier({...newSupplier, adresse: e.target.value})}
                placeholder="Adresse complète"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-specialite">Spécialité</Label>
              <Input
                id="edit-specialite"
                value={newSupplier.specialite}
                onChange={(e) => setNewSupplier({...newSupplier, specialite: e.target.value})}
                placeholder="ex: Composants PC, Périphériques..."
              />
            </div>
            <div>
              <Label htmlFor="edit-statut">Statut</Label>
              <Select value={newSupplier.statut} onValueChange={(value: any) => setNewSupplier({...newSupplier, statut: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                  <SelectItem value="Privilégié">Privilégié</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-conditions">Conditions de paiement</Label>
              <Input
                id="edit-conditions"
                value={newSupplier.conditions_paiement}
                onChange={(e) => setNewSupplier({...newSupplier, conditions_paiement: e.target.value})}
                placeholder="ex: 30 jours net"
              />
            </div>
            <div>
              <Label htmlFor="edit-delai">Délai de livraison moyen (jours)</Label>
              <Input
                id="edit-delai"
                type="number"
                value={newSupplier.delai_livraison_moyen || ''}
                onChange={(e) => setNewSupplier({...newSupplier, delai_livraison_moyen: e.target.value ? parseInt(e.target.value) : undefined})}
                placeholder="ex: 5"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={newSupplier.notes}
                onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                placeholder="Notes additionnelles"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleEditSupplier}
                className="gaming-gradient flex-1"
                disabled={!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email}
              >
                Modifier
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
