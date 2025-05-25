import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, TrendingUp, TrendingDown, Plus, Minus, Calendar, Building2, CreditCard, Wallet } from "lucide-react";
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

interface CashTransaction {
  id: string;
  type: "entree" | "sortie";
  amount: number;
  description: string;
  category: string;
  date: string;
  user: string;
}

const CashRegister = () => {
  const {
    comptes,
    loading: loadingBankAccounts,
    getTotaux
  } = useBankAccounts();

  const [transactions, setTransactions] = useState<CashTransaction[]>([
    {
      id: "T001",
      type: "entree",
      amount: 450.00,
      description: "Vente accessoires gaming (Espèces)",
      category: "Vente",
      date: "2024-01-15",
      user: "Admin"
    },
    {
      id: "T002",
      type: "sortie",
      amount: 50.00,
      description: "Frais de déplacement (Espèces)",
      category: "Frais",
      date: "2024-01-14",
      user: "Admin"
    },
    {
      id: "T003",
      type: "entree",
      amount: 1200.00,
      description: "Vente PC portable (Espèces)",
      category: "Vente",
      date: "2024-01-13",
      user: "Admin"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "entree" as "entree" | "sortie",
    amount: "",
    description: "",
    category: ""
  });

  const totalEntrees = transactions
    .filter(t => t.type === "entree")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSorties = transactions
    .filter(t => t.type === "sortie")
    .reduce((sum, t) => sum + t.amount, 0);

  const soldeCaisse = totalEntrees - totalSorties;

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      return;
    }

    const transaction: CashTransaction = {
      id: `T${String(transactions.length + 1).padStart(3, '0')}`,
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      date: new Date().toISOString().split('T')[0],
      user: "Admin"
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      type: "entree",
      amount: "",
      description: "",
      category: ""
    });
    setIsAddDialogOpen(false);
  };

  const totauxBanques = getTotaux();

  if (loadingBankAccounts) {
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
            <Wallet className="w-8 h-8 text-gaming-cyan" />
            Gestion Financière
          </h1>
          <p className="text-gray-400 mt-2">Caisse physique et comptes bancaires en dirham marocain (MAD)</p>
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
              <Building2 className="w-4 h-4" />
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

      {/* Onglets pour séparer caisse et banques */}
      <Tabs defaultValue="caisse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="caisse" className="text-white data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            <Banknote className="w-4 h-4 mr-2" />
            Caisse Physique (Espèces)
          </TabsTrigger>
          <TabsTrigger value="banques" className="text-white data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
            <Building2 className="w-4 h-4 mr-2" />
            Comptes Bancaires
          </TabsTrigger>
        </TabsList>

        {/* Onglet Caisse Physique */}
        <TabsContent value="caisse" className="space-y-6">
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

        {/* Onglet Comptes Bancaires */}
        <TabsContent value="banques" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Comptes Bancaires</h2>
            <p className="text-gray-400">Gérez vos comptes dans les paramètres</p>
          </div>

          {/* Résumé des comptes bancaires */}
          <div className="grid gap-4">
            {comptes.filter(c => c.statut === 'Actif').map((compte) => (
              <Card key={compte.id} className="tech-gradient border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gaming-cyan/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gaming-cyan" />
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
                      <div className="text-xs text-gray-400">{compte.type_compte}</div>
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
                <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Aucun compte bancaire configuré</h3>
                <p className="text-gray-400 mb-4">Ajoutez vos comptes bancaires dans les paramètres pour suivre vos soldes</p>
                <Button className="gaming-gradient" onClick={() => window.location.href = '/settings'}>
                  Configurer les comptes
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashRegister;
