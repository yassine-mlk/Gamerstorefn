
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Receipt,
  CreditCard,
  Banknote,
  Building,
  FileCheck,
  User,
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  nom: string;
  prix: number;
  quantite: number;
  codeBarre: string;
}

interface Sale {
  id: number;
  date: string;
  client: string;
  items: CartItem[];
  total: number;
  paiement: string;
  type: string;
  statut: string;
}

const mockSales: Sale[] = [
  {
    id: 1,
    date: "2024-05-24",
    client: "Martin Jean",
    items: [
      { id: 1, nom: "RTX 4090 Gaming X", prix: 12999, quantite: 1, codeBarre: "3664551234567" }
    ],
    total: 12999,
    paiement: "Carte",
    type: "Magasin",
    statut: "Payée"
  },
  {
    id: 2,
    date: "2024-05-23",
    client: "Dubois Marie",
    items: [
      { id: 4, nom: "Monitor Gaming 27\" 144Hz", prix: 2999, quantite: 1, codeBarre: "3664551234570" },
      { id: 5, nom: "Logitech G Pro X Superlight", prix: 1299, quantite: 1, codeBarre: "3664551234571" }
    ],
    total: 4298,
    paiement: "Espèces",
    type: "Commande en ligne",
    statut: "En cours"
  },
  {
    id: 3,
    date: "2024-05-22",
    client: "Leroy Pierre",
    items: [
      { id: 2, nom: "Gaming Chair Pro RGB", prix: 2499, quantite: 1, codeBarre: "3664551234568" }
    ],
    total: 2499,
    paiement: "Virement",
    type: "Magasin",
    statut: "Payée"
  }
];

export default function Sales() {
  const [sales] = useState<Sale[]>(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [paymentFilter, setPaymentFilter] = useState("tous");
  const [typeFilter, setTypeFilter] = useState("tous");
  const [dateFilter, setDateFilter] = useState("tous");
  const { toast } = useToast();

  const generateInvoice = (sale: Sale) => {
    toast({
      title: "Facture générée",
      description: `Facture #${sale.id} générée et prête à l'impression`,
    });
  };

  const generateReceipt = (sale: Sale) => {
    toast({
      title: "Ticket généré",
      description: `Ticket de caisse #${sale.id} généré`,
    });
  };

  const exportData = () => {
    toast({
      title: "Export en cours",
      description: "Les données des ventes sont en cours d'export",
    });
  };

  const viewDetails = (sale: Sale) => {
    toast({
      title: "Détails de la vente",
      description: `Affichage des détails de la vente #${sale.id}`,
    });
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "tous" || sale.statut === statusFilter;
    const matchesPayment = paymentFilter === "tous" || sale.paiement === paymentFilter;
    const matchesType = typeFilter === "tous" || sale.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesType;
  });

  const getPaymentIcon = (payment: string) => {
    switch (payment) {
      case 'Carte': return <CreditCard className="w-4 h-4" />;
      case 'Espèces': return <Banknote className="w-4 h-4" />;
      case 'Virement': return <Building className="w-4 h-4" />;
      case 'Chèque': return <FileCheck className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Historique des ventes</h1>
            <p className="text-gray-400 text-sm lg:text-base">Consultez et analysez toutes les ventes</p>
          </div>
        </div>
        <Button onClick={exportData} className="gaming-gradient">
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Exporter</span>
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gaming-cyan" />
              <div>
                <p className="text-sm text-gray-400">Total ventes</p>
                <p className="text-lg font-bold text-white">{totalSales.toLocaleString()} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gaming-purple" />
              <div>
                <p className="text-sm text-gray-400">Nb. ventes</p>
                <p className="text-lg font-bold text-white">{filteredSales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gaming-green" />
              <div>
                <p className="text-sm text-gray-400">Vente moyenne</p>
                <p className="text-lg font-bold text-white">{averageSale.toFixed(0)} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Clients</p>
                <p className="text-lg font-bold text-white">{new Set(filteredSales.map(s => s.client)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Rechercher une vente ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Filtre statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="Payée">Payée</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre paiement */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="tous">Tous les paiements</SelectItem>
                <SelectItem value="Carte">Carte</SelectItem>
                <SelectItem value="Espèces">Espèces</SelectItem>
                <SelectItem value="Virement">Virement</SelectItem>
                <SelectItem value="Chèque">Chèque</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre type */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="Magasin">Magasin</SelectItem>
                <SelectItem value="Commande en ligne">En ligne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Ventes ({filteredSales.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Liste de toutes les ventes avec filtres appliqués
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 lg:max-h-[600px] overflow-y-auto">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <p className="text-white font-medium">Vente #{sale.id}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={sale.type === 'Magasin' ? 'bg-gaming-green' : 'bg-gaming-purple'}>
                            {sale.type}
                          </Badge>
                          <Badge className={sale.statut === 'Payée' ? 'bg-gaming-green' : 'bg-yellow-600'}>
                            {sale.statut}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                        <p className="text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {sale.client}
                        </p>
                        <p className="text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sale.date).toLocaleDateString('fr-FR')}
                        </p>
                        <div className="flex items-center gap-1 text-gray-400">
                          {getPaymentIcon(sale.paiement)}
                          <span>{sale.paiement}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-right">
                        <p className="text-gaming-cyan font-bold text-xl">{sale.total.toLocaleString()} MAD</p>
                        <p className="text-xs text-gray-400">{sale.items.length} article(s)</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDetails(sale)}
                          className="text-blue-400 hover:bg-blue-400/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateReceipt(sale)}
                          className="text-gaming-cyan hover:bg-gaming-cyan/20"
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateInvoice(sale)}
                          className="text-gaming-purple hover:bg-gaming-purple/20"
                        >
                          <FileCheck className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Détails des articles - affichage collapsible */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Articles:</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                      {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-300 truncate">{item.nom} × {item.quantite}</span>
                          <span className="text-gaming-cyan ml-2">{(item.prix * item.quantite).toLocaleString()} MAD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSales.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Aucune vente trouvée avec ces filtres</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
