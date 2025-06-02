import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Loader2,
  Building2,
  User,
  Receipt,
  Eye,
  Package
} from "lucide-react";
import { useClients, type Client, type NewClient } from "@/hooks/useClients";
import { useClientPurchases } from "@/hooks/useClientPurchases";
import { formatCurrency } from "@/lib/currency";

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient, searchClients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<NewClient>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    statut: "Actif",
    notes: "",
    type_client: "particulier",
    ice: ""
  });

  // Hook pour l'historique des achats
  const { purchases, loading: loadingPurchases, getPurchaseStats } = useClientPurchases(selectedClient?.id);

  // Filtrer les clients localement ou par recherche
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = clients.filter(client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.ice && client.ice.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [clients, searchTerm]);

  const handleAddClient = async () => {
    if (!newClient.nom || !newClient.prenom || !newClient.email) {
      return;
    }

    // Validation ICE pour les sociétés
    if (newClient.type_client === 'societe' && !newClient.ice?.trim()) {
      alert("Le numéro ICE est obligatoire pour les sociétés");
      return;
    }

    const result = await addClient(newClient);
    if (result) {
      setNewClient({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        statut: "Actif",
        notes: "",
        type_client: "particulier",
        ice: ""
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient || !newClient.nom || !newClient.prenom || !newClient.email) {
      return;
    }

    // Validation ICE pour les sociétés
    if (newClient.type_client === 'societe' && !newClient.ice?.trim()) {
      alert("Le numéro ICE est obligatoire pour les sociétés");
      return;
    }

    const result = await updateClient(selectedClient.id, newClient);
    if (result) {
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      setNewClient({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        statut: "Actif",
        notes: "",
        type_client: "particulier",
        ice: ""
      });
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      await deleteClient(id);
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setNewClient({
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone || "",
      adresse: client.adresse || "",
      statut: client.statut,
      notes: client.notes || "",
      type_client: client.type_client || "particulier",
      ice: client.ice || ""
    });
    setIsEditDialogOpen(true);
  };

  const openPurchaseHistory = (client: Client) => {
    setSelectedClient(client);
    setShowPurchaseHistory(true);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VIP': return 'bg-gaming-purple';
      case 'Actif': return 'bg-gaming-green';
      case 'Inactif': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'societe' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />;
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
            <h1 className="text-3xl font-bold text-white">Gestion des clients</h1>
            <p className="text-gray-400">Gérez votre base clients et consultez leur historique</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Remplissez les informations du nouveau client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Type de client */}
              <div>
                <Label>Type de client *</Label>
                <RadioGroup 
                  value={newClient.type_client} 
                  onValueChange={(value: any) => setNewClient({...newClient, type_client: value, ice: value === 'particulier' ? '' : newClient.ice})}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="particulier" id="particulier" />
                    <Label htmlFor="particulier" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Particulier
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="societe" id="societe" />
                    <Label htmlFor="societe" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Société
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom {newClient.type_client === 'societe' ? 'société' : ''} *</Label>
                  <Input
                    id="nom"
                    value={newClient.nom}
                    onChange={(e) => setNewClient({...newClient, nom: e.target.value})}
                    placeholder={newClient.type_client === 'societe' ? "Nom de la société" : "Nom"}
                  />
                </div>
                <div>
                  <Label htmlFor="prenom">
                    {newClient.type_client === 'societe' ? 'Contact principal' : 'Prénom'} *
                  </Label>
                  <Input
                    id="prenom"
                    value={newClient.prenom}
                    onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}
                    placeholder={newClient.type_client === 'societe' ? "Nom du contact" : "Prénom"}
                  />
                </div>
              </div>

              {/* Champ ICE pour les sociétés */}
              {newClient.type_client === 'societe' && (
                <div>
                  <Label htmlFor="ice">Numéro ICE *</Label>
                  <Input
                    id="ice"
                    value={newClient.ice}
                    onChange={(e) => setNewClient({...newClient, ice: e.target.value})}
                    placeholder="Numéro ICE de la société"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={newClient.telephone}
                  onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea
                  id="adresse"
                  value={newClient.adresse}
                  onChange={(e) => setNewClient({...newClient, adresse: e.target.value})}
                  placeholder="Adresse complète"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select value={newClient.statut} onValueChange={(value: any) => setNewClient({...newClient, statut: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  placeholder="Notes additionnelles"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddClient}
                  className="gaming-gradient flex-1"
                  disabled={!newClient.nom || !newClient.prenom || !newClient.email || (newClient.type_client === 'societe' && !newClient.ice?.trim())}
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-blue/20 rounded-lg">
                <Users className="w-6 h-6 text-gaming-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-white">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-green/20 rounded-lg">
                <User className="w-6 h-6 text-gaming-green" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Particuliers</p>
                <p className="text-2xl font-bold text-white">
                  {clients.filter(c => c.type_client === 'particulier').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-purple/20 rounded-lg">
                <Building2 className="w-6 h-6 text-gaming-purple" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Sociétés</p>
                <p className="text-2xl font-bold text-white">
                  {clients.filter(c => c.type_client === 'societe').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-yellow/20 rounded-lg">
                <Users className="w-6 h-6 text-gaming-yellow" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Clients VIP</p>
                <p className="text-2xl font-bold text-white">
                  {clients.filter(c => c.statut === 'VIP').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-cyan/20 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-gaming-cyan" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Achats</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(clients.reduce((sum, c) => sum + c.total_achats, 0))}
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
              placeholder="Rechercher un client (nom, prénom, email, ICE)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card className="bg-card border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Liste des clients</CardTitle>
          <CardDescription>
            {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gaming-cyan/20 rounded-lg">
                      {getTypeIcon(client.type_client)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {client.prenom} {client.nom}
                        </h3>
                        <Badge className={`${getStatutColor(client.statut)} text-white`}>
                          {client.statut}
                        </Badge>
                        <Badge variant="outline" className="text-gray-300">
                          {client.type_client === 'societe' ? 'Société' : 'Particulier'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </div>
                        {client.telephone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {client.telephone}
                          </div>
                        )}
                        {client.type_client === 'societe' && client.ice && (
                          <div className="flex items-center gap-2 col-span-full">
                            <Building2 className="w-4 h-4" />
                            ICE: {client.ice}
                          </div>
                        )}
                        {client.adresse && (
                          <div className="flex items-center gap-2 col-span-full">
                            <MapPin className="w-4 h-4" />
                            {client.adresse}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="text-gaming-green">
                          Total achats: {formatCurrency(client.total_achats)}
                        </span>
                        {client.derniere_commande && (
                          <span className="text-gray-400">
                            Dernier achat: {formatDate(client.derniere_commande)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPurchaseHistory(client)}
                      className="hover:bg-gaming-cyan/20"
                    >
                      <Eye className="w-4 h-4" />
                      Historique
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                      className="hover:bg-red-600/20 hover:border-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun client trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Type de client */}
            <div>
              <Label>Type de client *</Label>
              <RadioGroup 
                value={newClient.type_client} 
                onValueChange={(value: any) => setNewClient({...newClient, type_client: value, ice: value === 'particulier' ? '' : newClient.ice})}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="particulier" id="edit-particulier" />
                  <Label htmlFor="edit-particulier" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Particulier
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="societe" id="edit-societe" />
                  <Label htmlFor="edit-societe" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Société
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nom">Nom {newClient.type_client === 'societe' ? 'société' : ''} *</Label>
                <Input
                  id="edit-nom"
                  value={newClient.nom}
                  onChange={(e) => setNewClient({...newClient, nom: e.target.value})}
                  placeholder={newClient.type_client === 'societe' ? "Nom de la société" : "Nom"}
                />
              </div>
              <div>
                <Label htmlFor="edit-prenom">
                  {newClient.type_client === 'societe' ? 'Contact principal' : 'Prénom'} *
                </Label>
                <Input
                  id="edit-prenom"
                  value={newClient.prenom}
                  onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}
                  placeholder={newClient.type_client === 'societe' ? "Nom du contact" : "Prénom"}
                />
              </div>
            </div>

            {/* Champ ICE pour les sociétés */}
            {newClient.type_client === 'societe' && (
              <div>
                <Label htmlFor="edit-ice">Numéro ICE *</Label>
                <Input
                  id="edit-ice"
                  value={newClient.ice}
                  onChange={(e) => setNewClient({...newClient, ice: e.target.value})}
                  placeholder="Numéro ICE de la société"
                />
              </div>
            )}

            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-telephone">Téléphone</Label>
              <Input
                id="edit-telephone"
                value={newClient.telephone}
                onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div>
              <Label htmlFor="edit-adresse">Adresse</Label>
              <Textarea
                id="edit-adresse"
                value={newClient.adresse}
                onChange={(e) => setNewClient({...newClient, adresse: e.target.value})}
                placeholder="Adresse complète"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-statut">Statut</Label>
              <Select value={newClient.statut} onValueChange={(value: any) => setNewClient({...newClient, statut: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                placeholder="Notes additionnelles"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleEditClient}
                className="gaming-gradient flex-1"
                disabled={!newClient.nom || !newClient.prenom || !newClient.email || (newClient.type_client === 'societe' && !newClient.ice?.trim())}
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

      {/* Purchase History Dialog */}
      <Dialog open={showPurchaseHistory} onOpenChange={setShowPurchaseHistory}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Historique des achats - {selectedClient?.prenom} {selectedClient?.nom}
            </DialogTitle>
            <DialogDescription>
              Consultez l'historique complet des achats de ce client
            </DialogDescription>
          </DialogHeader>
          
          {loadingPurchases ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gaming-cyan" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistiques des achats */}
              {purchases.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gaming-cyan">{getPurchaseStats().totalPurchases}</p>
                        <p className="text-sm text-gray-400">Commandes</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gaming-green">{formatCurrency(getPurchaseStats().totalAmount)}</p>
                        <p className="text-sm text-gray-400">Total achats</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gaming-purple">{getPurchaseStats().totalArticles}</p>
                        <p className="text-sm text-gray-400">Articles</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gaming-yellow">
                          {getPurchaseStats().lastPurchase ? formatDate(getPurchaseStats().lastPurchase!.date_vente) : '-'}
                        </p>
                        <p className="text-sm text-gray-400">Dernier achat</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Liste des achats */}
              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>Aucun achat trouvé pour ce client</p>
                  </div>
                ) : (
                  purchases.map((purchase) => (
                    <Card key={purchase.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gaming-cyan/20 rounded-lg">
                              <Receipt className="w-5 h-5 text-gaming-cyan" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{purchase.numero_vente}</h4>
                              <p className="text-sm text-gray-400">{formatDate(purchase.date_vente)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gaming-green">{formatCurrency(purchase.total_ttc)}</p>
                            <Badge variant="outline" className="text-xs">
                              {purchase.statut}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-3">
                          <div>Paiement: {purchase.mode_paiement}</div>
                          <div>Type: {purchase.type_vente}</div>
                        </div>

                        {/* Articles */}
                        <div className="space-y-2">
                          <h5 className="font-medium text-white">Articles:</h5>
                          {purchase.articles.map((article) => (
                            <div key={article.id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded">
                              <div className="flex-1">
                                <p className="text-sm text-white">{article.nom_produit}</p>
                                <p className="text-xs text-gray-400">{article.produit_type}</p>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-white">
                                  {article.quantite} x {formatCurrency(article.prix_unitaire_ttc)}
                                </p>
                                <p className="text-gaming-green font-medium">
                                  {formatCurrency(article.total_ttc)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {purchase.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-gray-400">
                              <strong>Notes:</strong> {purchase.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
