import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  RefreshCw, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Calendar,
  User,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRetours } from "@/hooks/useRetours";
import { useBankAccounts } from "@/hooks/useBankAccounts";

const Retours = () => {
  const {
    retours,
    reprises,
    loading,
    traiterRetour,
    finaliserReprise,
    getStats
  } = useRetours();

  const { comptes } = useBankAccounts();

  const [showTraitementDialog, setShowTraitementDialog] = useState(false);
  const [selectedRetour, setSelectedRetour] = useState<string | null>(null);
  const [modeRemboursement, setModeRemboursement] = useState<'especes' | 'virement' | 'avoir' | 'carte' | 'cheque'>('especes');
  const [compteBancaire, setCompteBancaire] = useState<string>('');

  const stats = getStats();

  const traiterRetourSelected = () => {
    if (!selectedRetour) return;

    const success = traiterRetour(
      selectedRetour, 
      modeRemboursement,
      modeRemboursement === 'virement' ? compteBancaire : undefined
    );

    if (success) {
      setShowTraitementDialog(false);
      setSelectedRetour(null);
      setModeRemboursement('especes');
      setCompteBancaire('');
    }
  };

  const getStatusBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'default';
      case 'traite':
      case 'finalise':
        return 'default';
      case 'rembourse':
        return 'default';
      case 'refuse':
      case 'annule':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Clock className="w-3 h-3" />;
      case 'traite':
      case 'finalise':
      case 'rembourse':
        return <CheckCircle className="w-3 h-3" />;
      case 'refuse':
      case 'annule':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-purple"></div>
        <span className="ml-2 text-white">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-gaming-purple" />
            Retours et Reprises
          </h1>
          <p className="text-gray-400 mt-2">Gestion des retours produits et reprises clients</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Total Retours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalRetours}</div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Retours Traités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.retoursTraites}</div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Montant Remboursé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.montantRetours.toFixed(2)} MAD</div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reprises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalReprises}</div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Échanges Finalisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.represeFinalisees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="retours" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="retours" className="text-white data-[state=active]:bg-gaming-purple data-[state=active]:text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retours Simples
          </TabsTrigger>
          <TabsTrigger value="reprises" className="text-white data-[state=active]:bg-gaming-purple data-[state=active]:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reprises/Échanges
          </TabsTrigger>
        </TabsList>

        {/* Onglet Retours */}
        <TabsContent value="retours" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Retours Simples</h2>
            <p className="text-gray-400">Les retours sont créés depuis le point de vente</p>
          </div>

          <Card className="tech-gradient border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Liste des Retours</CardTitle>
              <CardDescription className="text-gray-400">
                Gérez les demandes de remboursement clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {retours.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Aucun retour enregistré</h3>
                  <p className="text-gray-400">Les retours apparaîtront ici une fois créés depuis le point de vente</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Client</TableHead>
                      <TableHead className="text-gray-300">Produit</TableHead>
                      <TableHead className="text-gray-300">Montant</TableHead>
                      <TableHead className="text-gray-300">Motif</TableHead>
                      <TableHead className="text-gray-300">Statut</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retours.map((retour) => (
                      <TableRow key={retour.id}>
                        <TableCell className="text-gray-300 font-mono text-xs">
                          {retour.id}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {retour.date_retour}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{retour.client_nom}</div>
                            {retour.client_email && (
                              <div className="text-xs text-gray-400">{retour.client_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{retour.nom_produit}</div>
                            <div className="text-xs text-gray-400">Qté: {retour.quantite}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 font-semibold">
                          {retour.prix_total.toFixed(2)} MAD
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {retour.motif_retour}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(retour.statut)} className="flex items-center gap-1">
                            {getStatusIcon(retour.statut)}
                            {retour.statut === 'en_attente' && 'En attente'}
                            {retour.statut === 'traite' && 'Traité'}
                            {retour.statut === 'rembourse' && 'Remboursé'}
                            {retour.statut === 'refuse' && 'Refusé'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {retour.statut === 'en_attente' && (
                            <Button
                              size="sm"
                              className="gaming-gradient text-white"
                              onClick={() => {
                                setSelectedRetour(retour.id);
                                setShowTraitementDialog(true);
                              }}
                            >
                              Traiter
                            </Button>
                          )}
                          {retour.statut === 'rembourse' && retour.mode_remboursement && (
                            <Badge variant="outline" className="text-xs">
                              {retour.mode_remboursement === 'especes' && 'Espèces'}
                              {retour.mode_remboursement === 'carte' && 'Carte'}
                              {retour.mode_remboursement === 'virement' && 'Virement'}
                              {retour.mode_remboursement === 'avoir' && 'Avoir'}
                              {retour.mode_remboursement === 'cheque' && 'Chèque'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Reprises */}
        <TabsContent value="reprises" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Reprises et Échanges</h2>
            <p className="text-gray-400">Les reprises sont créées depuis le point de vente</p>
          </div>

          <Card className="tech-gradient border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Liste des Reprises</CardTitle>
              <CardDescription className="text-gray-400">
                Gérez les échanges de produits avec calcul de différence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reprises.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Aucune reprise enregistrée</h3>
                  <p className="text-gray-400">Les reprises apparaîtront ici une fois créées depuis le point de vente</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Client</TableHead>
                      <TableHead className="text-gray-300">Ancien Produit</TableHead>
                      <TableHead className="text-gray-300">Nouveau Produit</TableHead>
                      <TableHead className="text-gray-300">Différence</TableHead>
                      <TableHead className="text-gray-300">Mode Paiement</TableHead>
                      <TableHead className="text-gray-300">Statut</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reprises.map((reprise) => (
                      <TableRow key={reprise.id}>
                        <TableCell className="text-gray-300 font-mono text-xs">
                          {reprise.id}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {reprise.date_echange}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{reprise.client_nom || 'Client non spécifié'}</div>
                            {reprise.client_id && (
                              <div className="text-xs text-gray-400">ID: {reprise.client_id}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{reprise.ancien_produit.nom}</div>
                            <div className="text-xs text-gray-400">
                              {reprise.ancien_produit.prix.toFixed(2)} MAD × {reprise.ancien_produit.quantite}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{reprise.nouveau_produit.nom}</div>
                            <div className="text-xs text-gray-400">
                              {reprise.nouveau_produit.prix.toFixed(2)} MAD × {reprise.nouveau_produit.quantite}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={`font-semibold ${
                          reprise.difference_prix > 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {reprise.difference_prix > 0 ? '+' : ''}{reprise.difference_prix.toFixed(2)} MAD
                          <div className="text-xs text-gray-400">
                            {reprise.difference_prix > 0 ? 'Client paie' : 'Magasin rembourse'}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {reprise.mode_paiement_difference ? (
                            <Badge variant="outline" className="text-xs">
                              {reprise.mode_paiement_difference === 'especes' && 'Espèces'}
                              {reprise.mode_paiement_difference === 'carte' && 'Carte'}
                              {reprise.mode_paiement_difference === 'virement' && 'Virement'}
                              {reprise.mode_paiement_difference === 'cheque' && 'Chèque'}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(reprise.statut)} className="flex items-center gap-1">
                            {getStatusIcon(reprise.statut)}
                            {reprise.statut === 'en_attente' && 'En attente'}
                            {reprise.statut === 'finalise' && 'Finalisé'}
                            {reprise.statut === 'annule' && 'Annulé'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reprise.statut === 'en_attente' && (
                            <Button
                              size="sm"
                              className="gaming-gradient text-white"
                              onClick={() => finaliserReprise(reprise.id)}
                            >
                              Finaliser
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de traitement des retours */}
      <Dialog open={showTraitementDialog} onOpenChange={setShowTraitementDialog}>
        <DialogContent className="tech-gradient border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Traiter le Retour</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choisissez le mode de remboursement pour ce retour
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium">Mode de remboursement</label>
              <Select value={modeRemboursement} onValueChange={(value: 'especes' | 'virement' | 'avoir' | 'carte' | 'cheque') => setModeRemboursement(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">Remboursement en espèces</SelectItem>
                  <SelectItem value="virement">Virement bancaire</SelectItem>
                  <SelectItem value="avoir">Avoir magasin</SelectItem>
                  <SelectItem value="carte">Carte de crédit</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modeRemboursement === 'virement' && (
              <div>
                <label className="text-gray-300 text-sm font-medium">Compte bancaire de débit</label>
                <Select value={compteBancaire} onValueChange={setCompteBancaire}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
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

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={traiterRetourSelected}
                className="gaming-gradient text-white flex-1"
                disabled={modeRemboursement === 'virement' && !compteBancaire}
              >
                Confirmer le Remboursement
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowTraitementDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Retours; 