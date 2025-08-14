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
  Building,
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
  const [activeTab, setActiveTab] = useState("tous"); // "tous", "particuliers", "societes"
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
    let clientsToFilter = clients;
    
    // Filtrer par type selon l'onglet actif
    if (activeTab === "particuliers") {
      clientsToFilter = clients.filter(client => client.type_client === 'particulier');
    } else if (activeTab === "societes") {
      clientsToFilter = clients.filter(client => client.type_client === 'societe');
    }
    
    // Filtrer par terme de recherche
    if (searchTerm.trim()) {
      const filtered = clientsToFilter.filter(client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.telephone && client.telephone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.ice && client.ice.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clientsToFilter);
    }
  }, [clients, searchTerm, activeTab]);

  const handleAddClient = async () => {
    if (!newClient.nom) {
      return;
    }

    // Permettre les emails vides - pas de génération automatique
    const clientData = {
      ...newClient,
      email: newClient.email.trim() || null // NULL si vide
    };

    const result = await addClient(clientData);
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
    if (!selectedClient || !newClient.nom) {
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
      case 'VIP': return 'bg-purple-600 text-white';
      case 'Actif': return 'bg-green-600 text-white';
      case 'Inactif': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'societe' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />;
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des clients</h1>
            <p className="text-gray-600">Gérez votre base clients et consultez leur historique</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-5 h-5 text-blue-600" />
                Ajouter un nouveau client
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Créez un nouveau profil client en remplissant les informations ci-dessous
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
                
                <RadioGroup 
                  value={newClient.type_client} 
                  onValueChange={(value: any) => setNewClient({...newClient, type_client: value, ice: value === 'particulier' ? '' : newClient.ice})}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-white">
                    <RadioGroupItem value="particulier" id="particulier" />
                    <Label htmlFor="particulier" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Particulier</div>
                        <div className="text-xs text-gray-600">Client individuel</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-white">
                    <RadioGroupItem value="societe" id="societe" />
                    <Label htmlFor="societe" className="flex items-center gap-2 cursor-pointer">
                      <Building className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">Société</div>
                        <div className="text-xs text-gray-600">Entreprise ou organisation</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Section 2: Informations principales */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gaming-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
                  <h3 className="text-lg font-semibold text-white">Informations principales</h3>
                  <span className="text-xs text-red-400 font-medium">* Obligatoire</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom" className="flex items-center gap-2 text-gray-300 mb-2">
                      {newClient.type_client === 'societe' ? (
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
                      id="nom"
                      value={newClient.nom}
                      onChange={(e) => setNewClient({...newClient, nom: e.target.value})}
                      placeholder={newClient.type_client === 'societe' ? "Ex: TechCorp Solutions" : "Ex: Dupont"}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prenom" className="flex items-center gap-2 text-gray-300 mb-2">
                      <User className="w-4 h-4" />
                      {newClient.type_client === 'societe' ? 'Nom du contact principal' : 'Prénom'}
                    </Label>
                    <Input
                      id="prenom"
                      value={newClient.prenom}
                      onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}
                      placeholder={newClient.type_client === 'societe' ? "Ex: Mohammed Alami" : "Ex: Jean"}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Champ ICE pour les sociétés */}
                {newClient.type_client === 'societe' && (
                  <div className="mt-4">
                    <Label htmlFor="ice" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Building className="w-4 h-4" />
                      Numéro ICE
                    </Label>
                    <Input
                      id="ice"
                      value={newClient.ice}
                      onChange={(e) => setNewClient({...newClient, ice: e.target.value})}
                      placeholder="Ex: 001234567000025"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Identifiant Commun de l'Entreprise (15 chiffres) - Optionnel
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Contact et localisation */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gaming-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">3</div>
                  <h3 className="text-lg font-semibold text-white">Contact et localisation</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Mail className="w-4 h-4" />
                      Adresse email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="Ex: client@exemple.com"
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
                      value={newClient.telephone}
                      onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}
                      placeholder="Ex: 06 12 34 56 78 ou +212 6 12 34 56 78"
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
                      value={newClient.adresse}
                      onChange={(e) => setNewClient({...newClient, adresse: e.target.value})}
                      placeholder="Ex: 123 Avenue Mohammed V, Appartement 4, Casablanca 20000"
                      rows={3}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Paramètres du compte */}
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gaming-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">4</div>
                  <h3 className="text-lg font-semibold text-white">Paramètres du compte</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="statut" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Badge className="w-4 h-4" />
                      Statut du client
                    </Label>
                    <Select value={newClient.statut} onValueChange={(value: any) => setNewClient({...newClient, statut: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
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
                    <Label htmlFor="notes" className="flex items-center gap-2 text-gray-300 mb-2">
                      <Receipt className="w-4 h-4" />
                      Notes additionnelles
                    </Label>
                    <Textarea
                      id="notes"
                      value={newClient.notes}
                      onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                      placeholder="Préférences, remarques, historique..."
                      rows={3}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Résumé et validation */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-gray-900 font-medium mb-2">Récapitulatif</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Type:</strong> {newClient.type_client === 'societe' ? 'Société' : 'Particulier'}</p>
                  <p><strong>Nom:</strong> {newClient.nom || 'Non renseigné'}</p>
                  <p><strong>{newClient.type_client === 'societe' ? 'Contact' : 'Prénom'}:</strong> {newClient.prenom || 'Non renseigné'}</p>
                  <p><strong>Email:</strong> {newClient.email || 'Non renseigné'}</p>
                  {newClient.type_client === 'societe' && (
                    <p><strong>ICE:</strong> {newClient.ice || 'Non renseigné'}</p>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Seul le nom {newClient.type_client === 'societe' ? 'de la société' : 'de famille'} est obligatoire
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleAddClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-12 text-base font-medium"
                  disabled={!newClient.nom}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le client
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
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
                  {clients.filter(c => c.type_client === 'particulier').length}
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
                <p className="text-sm text-gray-600">Sociétés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.type_client === 'societe').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clients VIP</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.statut === 'VIP').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Achats</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(clients.reduce((sum, c) => sum + c.total_achats, 0))}
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
              placeholder="Rechercher un client (nom, prénom, email, ICE)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List avec onglets */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Liste des clients</CardTitle>
              <CardDescription className="text-gray-600">
                {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            
            {/* Onglets de filtrage */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("tous")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "tous"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tous ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab("particuliers")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "particuliers"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="w-4 h-4" />
                Particuliers ({clients.filter(c => c.type_client === 'particulier').length})
              </button>
              <button
                onClick={() => setActiveTab("societes")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "societes"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Building className="w-4 h-4" />
                Sociétés ({clients.filter(c => c.type_client === 'societe').length})
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      {getTypeIcon(client.type_client)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {client.prenom} {client.nom}
                        </h3>
                        <Badge className={`${getStatutColor(client.statut)} text-white`}>
                          {client.statut}
                        </Badge>
                        <Badge variant="outline" className="text-gray-700 border-gray-300">
                          {client.type_client === 'societe' ? 'Société' : 'Particulier'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                            <Building className="w-4 h-4" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="w-5 h-5 text-gaming-yellow" />
              Modifier le client
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les informations du client sélectionné
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Section 1: Type de client */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">1</div>
                <h3 className="text-lg font-semibold text-white">Type de client</h3>
              </div>
              
              <RadioGroup 
                value={newClient.type_client} 
                onValueChange={(value: any) => setNewClient({...newClient, type_client: value, ice: value === 'particulier' ? '' : newClient.ice})}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:border-gaming-yellow transition-colors">
                  <RadioGroupItem value="particulier" id="edit-particulier" />
                  <Label htmlFor="edit-particulier" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-5 h-5 text-gaming-green" />
                    <div>
                      <div className="font-medium text-white">Particulier</div>
                      <div className="text-xs text-gray-400">Client individuel</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:border-gaming-yellow transition-colors">
                  <RadioGroupItem value="societe" id="edit-societe" />
                  <Label htmlFor="edit-societe" className="flex items-center gap-2 cursor-pointer">
                    <Building className="w-5 h-5 text-gaming-purple" />
                    <div>
                      <div className="font-medium text-white">Société</div>
                      <div className="text-xs text-gray-400">Entreprise ou organisation</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Section 2: Informations principales */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
                <h3 className="text-lg font-semibold text-white">Informations principales</h3>
                <span className="text-xs text-red-400 font-medium">* Obligatoire</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nom" className="flex items-center gap-2 text-gray-300 mb-2">
                    {newClient.type_client === 'societe' ? (
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
                    id="edit-nom"
                    value={newClient.nom}
                    onChange={(e) => setNewClient({...newClient, nom: e.target.value})}
                    placeholder={newClient.type_client === 'societe' ? "Ex: TechCorp Solutions" : "Ex: Dupont"}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-prenom" className="flex items-center gap-2 text-gray-300 mb-2">
                    <User className="w-4 h-4" />
                    {newClient.type_client === 'societe' ? 'Nom du contact principal' : 'Prénom'}
                  </Label>
                  <Input
                    id="edit-prenom"
                    value={newClient.prenom}
                    onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}
                    placeholder={newClient.type_client === 'societe' ? "Ex: Mohammed Alami" : "Ex: Jean"}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Champ ICE pour les sociétés */}
              {newClient.type_client === 'societe' && (
                <div className="mt-4">
                  <Label htmlFor="edit-ice" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Building className="w-4 h-4" />
                    Numéro ICE
                  </Label>
                  <Input
                    id="edit-ice"
                    value={newClient.ice}
                    onChange={(e) => setNewClient({...newClient, ice: e.target.value})}
                    placeholder="Ex: 001234567000025"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identifiant Commun de l'Entreprise (15 chiffres) - Optionnel
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Contact et localisation */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">3</div>
                <h3 className="text-lg font-semibold text-white">Contact et localisation</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-email" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Mail className="w-4 h-4" />
                    Adresse email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="Ex: client@exemple.com"
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
                    value={newClient.telephone}
                    onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}
                    placeholder="Ex: 06 12 34 56 78 ou +212 6 12 34 56 78"
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
                    value={newClient.adresse}
                    onChange={(e) => setNewClient({...newClient, adresse: e.target.value})}
                    placeholder="Ex: 123 Avenue Mohammed V, Appartement 4, Casablanca 20000"
                    rows={3}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Paramètres du compte */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gaming-yellow rounded-full flex items-center justify-center text-xs font-bold text-black">4</div>
                <h3 className="text-lg font-semibold text-white">Paramètres du compte</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-statut" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Badge className="w-4 h-4" />
                    Statut du client
                  </Label>
                  <Select value={newClient.statut} onValueChange={(value: any) => setNewClient({...newClient, statut: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
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
                  <Label htmlFor="edit-notes" className="flex items-center gap-2 text-gray-300 mb-2">
                    <Receipt className="w-4 h-4" />
                    Notes additionnelles
                  </Label>
                  <Textarea
                    id="edit-notes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    placeholder="Préférences, remarques, historique..."
                    rows={3}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleEditClient}
                className="bg-gaming-yellow hover:bg-gaming-yellow/80 text-black flex-1 h-12 text-base font-medium"
                disabled={!newClient.nom}
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
