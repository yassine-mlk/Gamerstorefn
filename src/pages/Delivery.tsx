import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Calendar, Search, Eye, RefreshCw, Package, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLivraisons, type Livraison, type LivraisonFilters, type LivraisonStats } from "@/hooks/useLivraisons";

const Delivery = () => {
  const { 
    livraisons, 
    loading, 
    error,
    fetchLivraisons, 
    updateLivraisonStatut,
    updateLivraison,
    getLivraisonsStats,
    syncLivraisonsFromVentes
  } = useLivraisons();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [transporteurFilter, setTransporteurFilter] = useState("tous");
  const [villeFilter, setVilleFilter] = useState("tous");
  const [selectedLivraison, setSelectedLivraison] = useState<Livraison | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<LivraisonStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { toast } = useToast();

  // Charger les statistiques
  const loadStats = async () => {
    setLoadingStats(true);
    const filters: LivraisonFilters = {
      search: searchTerm || undefined,
      statut: statusFilter !== "tous" ? statusFilter : undefined,
      transporteur: transporteurFilter !== "tous" ? transporteurFilter : undefined,
      ville: villeFilter !== "tous" ? villeFilter : undefined,
    };
    const newStats = await getLivraisonsStats(filters);
    setStats(newStats);
    setLoadingStats(false);
  };

  // Appliquer les filtres
  const applyFilters = async () => {
    const filters: LivraisonFilters = {
      search: searchTerm || undefined,
      statut: statusFilter !== "tous" ? statusFilter : undefined,
      transporteur: transporteurFilter !== "tous" ? transporteurFilter : undefined,
      ville: villeFilter !== "tous" ? villeFilter : undefined,
    };
    await fetchLivraisons(filters);
    await loadStats();
  };

  // Charger les stats au montage
  useEffect(() => {
    loadStats();
  }, []);

  // Recharger lors des changements de filtres
  useEffect(() => {
    applyFilters();
  }, [statusFilter, transporteurFilter, villeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_cours": return "bg-blue-500";
      case "livre": return "bg-green-500";
      case "non_livre": return "bg-red-500";
      case "retour": return "bg-orange-500";
      case "annule": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "en_cours": return "En cours de livraison";
      case "livre": return "Livré";
      case "non_livre": return "Non livré";
      case "retour": return "Retour";
      case "annule": return "Annulé";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_cours": return <Truck className="w-4 h-4" />;
      case "livre": return <CheckCircle className="w-4 h-4" />;
      case "non_livre": return <XCircle className="w-4 h-4" />;
      case "retour": return <RotateCcw className="w-4 h-4" />;
      case "annule": return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (livraisonId: string, newStatus: Livraison['statut']) => {
    const success = await updateLivraisonStatut(livraisonId, newStatus);
    if (success) {
      await loadStats();
    }
  };

  const handleSync = async () => {
    const success = await syncLivraisonsFromVentes();
    if (success) {
      await loadStats();
    }
  };

  const transporteurs = Array.from(new Set(livraisons.map(l => l.transporteur).filter(Boolean)));
  const villes = Array.from(new Set(livraisons.map(l => l.ville).filter(Boolean)));

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-gaming-cyan" />
            Gestion des Livraisons
          </h1>
          <p className="text-gray-400 mt-2">Suivez et gérez toutes vos livraisons de commandes</p>
        </div>
        <Button onClick={handleSync} className="bg-gaming-cyan hover:bg-gaming-cyan/80">
          <RefreshCw className="w-4 h-4 mr-2" />
          Synchroniser
        </Button>
      </div>

      {error && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4" />
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? "..." : stats?.en_cours || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Livrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? "..." : stats?.livrees || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Non livrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? "..." : stats?.non_livrees || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-600 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Retours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? "..." : stats?.retours || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? "..." : stats?.total_livraisons || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-600 text-sm">Valeur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {loadingStats ? "..." : `${stats?.valeur_totale?.toFixed(2) || 0} DH`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-700">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Client, N° livraison, suivi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="livre">Livré</SelectItem>
                  <SelectItem value="non_livre">Non livré</SelectItem>
                  <SelectItem value="retour">Retour</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transporteur" className="text-gray-700">Transporteur</Label>
              <Select value={transporteurFilter} onValueChange={setTransporteurFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  {transporteurs.map(transporteur => (
                    <SelectItem key={transporteur} value={transporteur}>{transporteur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ville" className="text-gray-700">Ville</Label>
              <Select value={villeFilter} onValueChange={setVilleFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes</SelectItem>
                  {villes.map(ville => (
                    <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("tous");
                setTransporteurFilter("tous");
                setVilleFilter("tous");
                fetchLivraisons();
                loadStats();
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Liste des Livraisons</CardTitle>
          <CardDescription className="text-gray-600">
            {loading ? "Chargement..." : `${livraisons.length} livraison(s) trouvée(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Chargement des livraisons...</div>
            </div>
          ) : livraisons.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <div className="text-gray-600">Aucune livraison trouvée</div>
              <Button onClick={handleSync} className="mt-4 bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Synchroniser les commandes de livraison
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-700">N° Livraison</TableHead>
                  <TableHead className="text-gray-700">Client</TableHead>
                  <TableHead className="text-gray-700">Ville</TableHead>
                  <TableHead className="text-gray-700">Transporteur</TableHead>
                  <TableHead className="text-gray-700">Articles</TableHead>
                  <TableHead className="text-gray-700">Valeur</TableHead>
                  <TableHead className="text-gray-700">Date</TableHead>
                  <TableHead className="text-gray-700">Statut</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {livraisons.map((livraison) => (
                  <TableRow key={livraison.id} className="border-gray-200">
                    <TableCell className="text-gray-900 font-medium">{livraison.numero_livraison}</TableCell>
                    <TableCell className="text-gray-700">
                      <div>
                        <div className="font-medium">{livraison.client_nom}</div>
                        {livraison.client_email && (
                          <div className="text-sm text-gray-500">{livraison.client_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{livraison.ville || 'Non définie'}</TableCell>
                    <TableCell className="text-gray-700">{livraison.transporteur || 'Non assigné'}</TableCell>
                    <TableCell className="text-gray-700">{livraison.total_articles}</TableCell>
                    <TableCell className="text-gray-700">{livraison.valeur_totale.toFixed(2)} DH</TableCell>
                    <TableCell className="text-gray-700">
                      {new Date(livraison.date_creation).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(livraison.statut)} text-white flex items-center gap-1`}>
                        {getStatusIcon(livraison.statut)}
                        {getStatusText(livraison.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={showDetails && selectedLivraison?.id === livraison.id} onOpenChange={(open) => {
                          setShowDetails(open);
                          if (!open) setSelectedLivraison(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-gray-300 text-gray-700 hover:bg-gray-100"
                              onClick={() => setSelectedLivraison(livraison)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="tech-gradient border-gray-700 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Détails de la livraison {selectedLivraison?.numero_livraison}
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Informations complètes et gestion du statut
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLivraison && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-gray-300">Client</Label>
                                    <p className="text-white font-medium">{selectedLivraison.client_nom}</p>
                                    {selectedLivraison.client_email && (
                                      <p className="text-gray-400 text-sm">{selectedLivraison.client_email}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">Transporteur</Label>
                                    <p className="text-white">{selectedLivraison.transporteur || 'Non assigné'}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-gray-300">Adresse de livraison</Label>
                                  <p className="text-white">{selectedLivraison.adresse_livraison}</p>
                                  {selectedLivraison.ville && (
                                    <p className="text-gray-400">{selectedLivraison.ville}, {selectedLivraison.pays}</p>
                                  )}
                                </div>

                                {selectedLivraison.numero_suivi && (
                                  <div>
                                    <Label className="text-gray-300">Numéro de suivi</Label>
                                    <p className="text-white font-mono">{selectedLivraison.numero_suivi}</p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-gray-300">Articles</Label>
                                    <p className="text-white text-2xl font-bold">{selectedLivraison.total_articles}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">Valeur totale</Label>
                                    <p className="text-white text-2xl font-bold">{selectedLivraison.valeur_totale.toFixed(2)} DH</p>
                                  </div>
                                </div>

                                {selectedLivraison.notes_livraison && (
                                  <div>
                                    <Label className="text-gray-300">Notes</Label>
                                    <p className="text-white">{selectedLivraison.notes_livraison}</p>
                                  </div>
                                )}

                                <div>
                                  <Label className="text-gray-300">Changer le statut</Label>
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {selectedLivraison.statut !== 'en_cours' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedLivraison.id, 'en_cours')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        <Truck className="w-4 h-4 mr-2" />
                                        En cours
                                      </Button>
                                    )}
                                    {selectedLivraison.statut !== 'livre' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedLivraison.id, 'livre')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Livré
                                      </Button>
                                    )}
                                    {selectedLivraison.statut !== 'non_livre' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedLivraison.id, 'non_livre')}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Non livré
                                      </Button>
                                    )}
                                    {selectedLivraison.statut !== 'retour' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedLivraison.id, 'retour')}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Retour
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <div className="text-sm text-gray-400">
                                  <p>Créé le: {new Date(selectedLivraison.created_at).toLocaleString('fr-FR')}</p>
                                  <p>Mis à jour: {new Date(selectedLivraison.updated_at).toLocaleString('fr-FR')}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Delivery;
