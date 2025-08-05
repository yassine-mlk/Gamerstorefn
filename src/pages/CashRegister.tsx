import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, TrendingUp, TrendingDown, Plus, Minus, Calendar, Building, CreditCard, Wallet, RefreshCw, RotateCcw } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useCash } from "@/hooks/useCash";
import { useRetours } from "@/hooks/useRetours";

const CashRegister = () => {
  const {
    comptes,
    mouvements,
    loading: loadingBankAccounts,
    getTotaux,
    getMouvementsCompte
  } = useBankAccounts();

  const {
    transactions,
    loading: loadingCash,
    addCashTransaction,
    getTotaux: getCashTotaux
  } = useCash();

  const {
    retours,
    reprises,
    loading: loadingRetours,
    getStats
  } = useRetours();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "entree" as "entree" | "sortie",
    amount: "",
    description: "",
    category: ""
  });

  const { totalEntrees, totalSorties, soldeCaisse } = getCashTotaux();

  // Fonction pour afficher les détails d'un compte
  const viewAccountDetails = (accountId: string) => {
    setSelectedAccount(accountId);
    setShowAccountDetails(true);
  };

  // Obtenir les mouvements du compte sélectionné
  const selectedAccountMovements = selectedAccount ? getMouvementsCompte(selectedAccount) : [];
  const selectedAccountInfo = selectedAccount ? comptes.find(c => c.id === selectedAccount) : null;

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      return;
    }

    const success = addCashTransaction({
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      user: "Admin"
    });

    if (success) {
      setNewTransaction({
        type: "entree",
        amount: "",
        description: "",
        category: ""
      });
      setIsAddDialogOpen(false);
    }
  };

  const totauxBanques = getTotaux();

  if (loadingBankAccounts || loadingCash || loadingRetours) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-purple"></div>
        <span className="ml-2 text-white">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-gaming-cyan" />
            Gestion Financière
          </h1>
          <p className="text-gray-600 mt-2">Caisse physique et comptes bancaires en dirham marocain (MAD)</p>
        </div>
      </div>

      {/* Vue d'ensemble financière */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-400 text-sm flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Caisse Physique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${soldeCaisse >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {soldeCaisse.toFixed(2)} MAD
            </div>
            <p className="text-xs text-gray-400 mt-1">Espèces en caisse</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
              <Building className="w-4 h-4" />
              Comptes Bancaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {totauxBanques.totalSoldes.toFixed(2)} MAD
            </div>
            <p className="text-xs text-gray-400 mt-1">{totauxBanques.nombreComptes} comptes actifs</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Liquidités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {(soldeCaisse + totauxBanques.totalSoldes).toFixed(2)} MAD
            </div>
            <p className="text-xs text-gray-400 mt-1">Caisse + Banques</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Banques Partenaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {[...new Set(comptes.map(c => c.nom_banque))].length}
            </div>
            <p className="text-xs text-gray-400 mt-1">Institutions bancaires</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour organiser les différentes sections */}
      <Tabs defaultValue="cash" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="cash" className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            <Banknote className="w-4 h-4 mr-2" />
            Caisse
          </TabsTrigger>
          <TabsTrigger value="bank" className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            <Building className="w-4 h-4 mr-2" />
            Banques
          </TabsTrigger>
          <TabsTrigger value="returns" className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retours & Reprises
          </TabsTrigger>
        </TabsList>

        {/* Section Caisse */}
        <TabsContent value="cash" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Mouvements en Espèces</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gaming-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="tech-gradient border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Nouvelle Transaction Caisse</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Ajouter une entrée ou sortie d'espèces en caisse
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Type</Label>
                    <Select 
                      value={newTransaction.type} 
                      onValueChange={(value: "entree" | "sortie") => 
                        setNewTransaction({...newTransaction, type: value})
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entree">Entrée (Encaissement)</SelectItem>
                        <SelectItem value="sortie">Sortie (Décaissement)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Montant (MAD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Catégorie</Label>
                    <Select 
                      value={newTransaction.category} 
                      onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vente">Vente (Espèces)</SelectItem>
                        <SelectItem value="Frais">Frais Généraux</SelectItem>
                        <SelectItem value="Salaire">Salaire</SelectItem>
                        <SelectItem value="Achat">Achat Divers</SelectItem>
                        <SelectItem value="Change">Opération de Change</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Description</Label>
                    <Textarea
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Description de la transaction..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addTransaction}
                      className="gaming-gradient text-white flex-1"
                    >
                      Ajouter Transaction
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistiques caisse */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="tech-gradient border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total Entrées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">
                  {totalEntrees.toFixed(2)} MAD
                </div>
              </CardContent>
            </Card>

            <Card className="tech-gradient border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Total Sorties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">
                  {totalSorties.toFixed(2)} MAD
                </div>
              </CardContent>
            </Card>

            <Card className="tech-gradient border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm flex items-center gap-2 ${soldeCaisse >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <Banknote className="w-4 h-4" />
                  Solde Caisse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${soldeCaisse >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {soldeCaisse.toFixed(2)} MAD
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historique des transactions caisse */}
          <Card className="tech-gradient border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Historique des Mouvements de Caisse</CardTitle>
              <CardDescription className="text-gray-400">
                Toutes les entrées et sorties d'espèces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Montant</TableHead>
                    <TableHead className="text-gray-300">Catégorie</TableHead>
                    <TableHead className="text-gray-300">Description</TableHead>
                    <TableHead className="text-gray-300">Utilisateur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-gray-300">{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "entree" ? "default" : "destructive"}>
                          {transaction.type === "entree" ? "Entrée" : "Sortie"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-semibold ${
                        transaction.type === "entree" ? "text-green-400" : "text-red-400"
                      }`}>
                        {transaction.type === "entree" ? "+" : "-"}{transaction.amount.toFixed(2)} MAD
                      </TableCell>
                      <TableCell className="text-gray-300">{transaction.category}</TableCell>
                      <TableCell className="text-gray-300">{transaction.description}</TableCell>
                      <TableCell className="text-gray-300">{transaction.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Banques */}
        <TabsContent value="bank" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Comptes Bancaires</h2>
            <p className="text-gray-400">Gérez vos comptes dans les paramètres</p>
          </div>

          {/* Résumé des comptes bancaires */}
          <div className="grid gap-4">
            {comptes.filter(c => c.statut === 'Actif').map((compte) => (
              <Card 
                key={compte.id} 
                className="tech-gradient border-gray-700 cursor-pointer hover:border-gaming-cyan/50 transition-all duration-200"
                onClick={() => viewAccountDetails(compte.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gaming-cyan/20 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-gaming-cyan" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{compte.nom_compte}</h4>
                        <p className="text-sm text-gray-400">{compte.nom_banque}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        {compte.solde_actuel.toFixed(2)} MAD
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        {compte.type_compte}
                        <span className="text-gaming-cyan">• Cliquer pour détails</span>
                      </div>
                    </div>
                  </div>
                  {compte.numero_compte && (
                    <div className="mt-3 text-sm text-gray-400">
                      N° Compte: <span className="font-mono">{compte.numero_compte}</span>
                    </div>
                  )}
                  {compte.description && (
                    <p className="mt-2 text-sm text-gray-400">{compte.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {comptes.filter(c => c.statut === 'Actif').length === 0 && (
            <Card className="tech-gradient border-gray-700">
              <CardContent className="p-8 text-center">
                <Building className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Aucun compte bancaire configuré</h3>
                <p className="text-gray-400 mb-4">Ajoutez vos comptes bancaires dans les paramètres pour suivre vos soldes</p>
                <Button className="gaming-gradient" onClick={() => window.location.href = '/settings'}>
                  Configurer les comptes
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Section Retours & Reprises */}
        <TabsContent value="returns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Retours & Reprises</h2>
            <p className="text-gray-400">Transactions de retours et reprises</p>
          </div>

          {/* Résumé des retours et reprises */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="tech-gradient border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retours ({retours.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {retours.reduce((sum, r) => sum + r.prix_total, 0).toFixed(2)} MAD
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {retours.filter(r => r.statut === 'rembourse').length} traités
                </p>
              </CardContent>
            </Card>

            <Card className="tech-gradient border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reprises ({reprises.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {reprises.reduce((sum, r) => sum + Math.abs(r.difference_prix), 0).toFixed(2)} MAD
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {reprises.filter(r => r.statut === 'finalise').length} finalisées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Historique des retours et reprises */}
          <Card className="tech-gradient border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Transactions Récentes</CardTitle>
              <CardDescription className="text-gray-400">
                Derniers retours et reprises effectués
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(retours.length === 0 && reprises.length === 0) ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Aucune transaction</h3>
                  <p className="text-gray-400">Les retours et reprises apparaîtront ici</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Client</TableHead>
                      <TableHead className="text-gray-300">Produit</TableHead>
                      <TableHead className="text-gray-300">Montant</TableHead>
                      <TableHead className="text-gray-300">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Afficher les retours */}
                    {retours.slice(0, 10).map((retour) => (
                      <TableRow key={retour.id}>
                        <TableCell className="text-gray-300">{retour.date_retour}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-red-400 text-red-400">
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Retour
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{retour.client_nom}</TableCell>
                        <TableCell className="text-gray-300">{retour.nom_produit}</TableCell>
                        <TableCell className="font-semibold text-red-400">
                          -{retour.prix_total.toFixed(2)} MAD
                        </TableCell>
                        <TableCell>
                          <Badge variant={retour.statut === 'rembourse' ? 'default' : 'secondary'} className="text-xs">
                            {retour.statut === 'en_attente' && 'En attente'}
                            {retour.statut === 'rembourse' && 'Remboursé'}
                            {retour.statut === 'traite' && 'Traité'}
                            {retour.statut === 'refuse' && 'Refusé'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Afficher les reprises */}
                    {reprises.slice(0, 10).map((reprise) => (
                      <TableRow key={reprise.id}>
                        <TableCell className="text-gray-300">{reprise.date_echange}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-purple-400 text-purple-400">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Reprise
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{reprise.client_nom || 'N/A'}</TableCell>
                        <TableCell className="text-gray-300">
                          {reprise.ancien_produit.nom} → {reprise.nouveau_produit.nom}
                        </TableCell>
                        <TableCell className={`font-semibold ${
                          reprise.difference_prix > 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {reprise.difference_prix > 0 ? '+' : ''}{reprise.difference_prix.toFixed(2)} MAD
                        </TableCell>
                        <TableCell>
                          <Badge variant={reprise.statut === 'finalise' ? 'default' : 'secondary'} className="text-xs">
                            {reprise.statut === 'en_attente' && 'En attente'}
                            {reprise.statut === 'finalise' && 'Finalisé'}
                            {reprise.statut === 'annule' && 'Annulé'}
                          </Badge>
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

      {/* Dialog pour les détails du compte bancaire */}
      <Dialog open={showAccountDetails} onOpenChange={setShowAccountDetails}>
        <DialogContent className="tech-gradient border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-gaming-cyan" />
              Historique des Mouvements - {selectedAccountInfo?.nom_compte}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedAccountInfo?.nom_banque} • Solde actuel: {selectedAccountInfo?.solde_actuel.toFixed(2)} MAD
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Statistiques du compte */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {selectedAccountMovements.filter(m => m.type_mouvement === 'Crédit' && m.statut === 'Validé').reduce((sum, m) => sum + m.montant, 0).toFixed(2)} MAD
                    </div>
                    <div className="text-xs text-gray-400">Total Crédits</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">
                      {selectedAccountMovements.filter(m => m.type_mouvement === 'Débit' && m.statut === 'Validé').reduce((sum, m) => sum + m.montant, 0).toFixed(2)} MAD
                    </div>
                    <div className="text-xs text-gray-400">Total Débits</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {selectedAccountMovements.length}
                    </div>
                    <div className="text-xs text-gray-400">Nb Mouvements</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste des mouvements */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Mouvements</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAccountMovements.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Aucun mouvement trouvé</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Montant</TableHead>
                        <TableHead className="text-gray-300">Libellé</TableHead>
                        <TableHead className="text-gray-300">Catégorie</TableHead>
                        <TableHead className="text-gray-300">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedAccountMovements
                        .sort((a, b) => new Date(b.date_mouvement).getTime() - new Date(a.date_mouvement).getTime())
                        .map((mouvement) => (
                        <TableRow key={mouvement.id}>
                          <TableCell className="text-gray-300">
                            {new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={mouvement.type_mouvement === "Crédit" ? "default" : "destructive"}>
                              {mouvement.type_mouvement}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-semibold ${
                            mouvement.type_mouvement === "Crédit" ? "text-green-400" : "text-red-400"
                          }`}>
                            {mouvement.type_mouvement === "Crédit" ? "+" : "-"}{mouvement.montant.toFixed(2)} MAD
                          </TableCell>
                          <TableCell className="text-gray-300 max-w-xs truncate">
                            {mouvement.libelle}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {mouvement.categorie || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={mouvement.statut === 'Validé' ? 'default' : 'secondary'}>
                              {mouvement.statut}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashRegister;
