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
  Loader2
} from "lucide-react";
import { useClients, type Client, type NewClient } from "@/hooks/useClients";
import { formatCurrency } from "@/lib/currency";

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient, searchClients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<NewClient>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    statut: "Actif",
    notes: ""
  });

  // Filtrer les clients localement ou par recherche
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = clients.filter(client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
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

    const result = await addClient(newClient);
    if (result) {
      setNewClient({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        statut: "Actif",
        notes: ""
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient || !newClient.nom || !newClient.prenom || !newClient.email) {
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
        notes: ""
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
      notes: client.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VIP': return 'bg-gaming-purple';
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Remplissez les informations du nouveau client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={newClient.nom}
                    onChange={(e) => setNewClient({...newClient, nom: e.target.value})}
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={newClient.prenom}
                    onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}
                    placeholder="Prénom"
                  />
                </div>
              </div>
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
                  disabled={!newClient.nom || !newClient.prenom || !newClient.email}
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
                <Users className="w-6 h-6 text-gaming-green" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Clients Actifs</p>
                <p className="text-2xl font-bold text-white">
                  {clients.filter(c => c.statut === 'Actif').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gaming-purple/20 rounded-lg">
                <Users className="w-6 h-6 text-gaming-purple" />
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
              placeholder="Rechercher un client (nom, prénom, email)..."
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
                      <Users className="w-6 h-6 text-gaming-cyan" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {client.prenom} {client.nom}
                        </h3>
                        <Badge className={`${getStatutColor(client.statut)} text-white`}>
                          {client.statut}
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
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Inscrit le {formatDate(client.date_inscription)}
                        </div>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nom">Nom *</Label>
                <Input
                  id="edit-nom"
                  value={newClient.nom}
                  onChange={(e) => setNewClient({...newClient, nom: e.target.value})}
                  placeholder="Nom"
                />
              </div>
              <div>
                <Label htmlFor="edit-prenom">Prénom *</Label>
                <Input
                  id="edit-prenom"
                  value={newClient.prenom}
                  onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}
                  placeholder="Prénom"
                />
              </div>
            </div>
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
                disabled={!newClient.nom || !newClient.prenom || !newClient.email}
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
