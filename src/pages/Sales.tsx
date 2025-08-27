import { useState, useEffect } from "react";
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
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVentes, type Vente, type VenteFilters, type VenteStats } from "@/hooks/useVentes";
import { VenteDetailsModal } from "@/components/VenteDetailsModal";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { WarrantyGenerator } from "@/components/WarrantyGenerator";
import { EditVenteModal } from "@/components/EditVenteModal";
import { PDFGenerator } from "@/lib/pdfGenerator";

export default function Sales() {
  const { ventes, loading, fetchVentes, deleteVente, getVentesStats, updateVente } = useVentes();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [paymentFilter, setPaymentFilter] = useState("tous");
  const [typeFilter, setTypeFilter] = useState("tous");
  const [dateFilter, setDateFilter] = useState("tous");
  const [stats, setStats] = useState<VenteStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [showVenteDetails, setShowVenteDetails] = useState(false);
  const [showEditVente, setShowEditVente] = useState(false);
  const { toast } = useToast();

  // Appliquer les filtres
  const applyFilters = async () => {
    const filters: VenteFilters = {
      search: searchTerm || undefined,
      statut: statusFilter !== "tous" ? statusFilter : undefined,
      mode_paiement: paymentFilter !== "tous" ? paymentFilter : undefined,
      type_vente: typeFilter !== "tous" ? typeFilter : undefined,
    };

    // Ajouter les filtres de date
    if (dateFilter !== "tous") {
      const today = new Date();
      switch (dateFilter) {
        case "aujourd_hui":
          filters.date_debut = today.toISOString().split('T')[0];
          filters.date_fin = today.toISOString().split('T')[0];
          break;
        case "cette_semaine":
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          filters.date_debut = startOfWeek.toISOString().split('T')[0];
          break;
        case "ce_mois":
          filters.date_debut = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          break;
        case "cette_annee":
          filters.date_debut = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          break;
      }
    }

    await fetchVentes(filters);
    
    // Charger les statistiques avec les mêmes filtres
    setLoadingStats(true);
    const newStats = await getVentesStats(filters);
    setStats(newStats);
    setLoadingStats(false);
  };

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, paymentFilter, typeFilter, dateFilter]);

  const generateInvoice = (vente: Vente) => {
    try {
      PDFGenerator.generateInvoice(vente);
      toast({
        title: "Facture générée",
        description: `Facture ${vente.numero_vente} générée et téléchargée`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture",
        variant: "destructive",
      });
    }
  };

  const generateReceipt = (vente: Vente) => {
    try {
      PDFGenerator.generateReceipt(vente);
      toast({
        title: "Ticket généré",
        description: `Ticket de caisse ${vente.numero_vente} généré et téléchargé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le ticket",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    // Créer un CSV des ventes
    const csvContent = [
      ['Numéro', 'Date', 'Client', 'Total', 'Paiement', 'Type', 'Statut'].join(','),
      ...ventes.map(vente => [
        vente.numero_vente,
        new Date(vente.date_vente || '').toLocaleDateString('fr-FR'),
        vente.client_nom,
        vente.total_ttc,
        vente.mode_paiement,
        vente.type_vente,
        vente.statut
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export terminé",
      description: "Les données des ventes ont été exportées",
    });
  };

  const viewDetails = (vente: Vente) => {
    setSelectedVente(vente);
    setShowVenteDetails(true);
  };

  const handleDeleteVente = async (id: string, numeroVente: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la vente ${numeroVente} ?`)) {
      await deleteVente(id);
    }
  };

  const getPaymentIcon = (payment: string) => {
    switch (payment) {
      case 'carte': return <CreditCard className="w-4 h-4" />;
      case 'especes': return <Banknote className="w-4 h-4" />;
      case 'virement': return <Building className="w-4 h-4" />;
      case 'cheque': return <FileCheck className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'payee': return 'bg-green-600 text-white';
      case 'en_cours': return 'bg-yellow-600 text-white';
      case 'partiellement_payee': return 'bg-orange-600 text-white';
      case 'annulee': return 'bg-red-600 text-white';
      case 'remboursee': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'magasin': return 'bg-green-600 text-white';
      case 'en_ligne': return 'bg-purple-600 text-white';
      case 'telephone': return 'bg-blue-600 text-white';
      case 'commande': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-blue-600 lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Historique des ventes</h1>
            <p className="text-gray-600 text-sm lg:text-base">Consultez et analysez toutes les ventes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => applyFilters()} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total ventes</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingStats ? '...' : `${(stats?.total_ventes || 0).toLocaleString()} MAD`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Nb. ventes</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingStats ? '...' : (stats?.nombre_ventes || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Vente moyenne</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingStats ? '...' : `${(stats?.vente_moyenne || 0).toFixed(0)} MAD`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingStats ? '...' : (stats?.nombre_clients || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
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
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filtre statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="payee">Payée</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="partiellement_payee">Partiellement payée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
                <SelectItem value="remboursee">Remboursée</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre paiement */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="tous">Tous les paiements</SelectItem>
                <SelectItem value="carte">Carte</SelectItem>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="mixte">Mixte</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre type */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="magasin">Magasin</SelectItem>
                <SelectItem value="en_ligne">En ligne</SelectItem>
                <SelectItem value="telephone">Téléphone</SelectItem>
                <SelectItem value="commande">Commande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre de date */}
          <div className="mt-4">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900 w-full md:w-64">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="tous">Toutes les périodes</SelectItem>
                <SelectItem value="aujourd_hui">Aujourd'hui</SelectItem>
                <SelectItem value="cette_semaine">Cette semaine</SelectItem>
                <SelectItem value="ce_mois">Ce mois</SelectItem>
                <SelectItem value="cette_annee">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Ventes ({ventes.length})</CardTitle>
          <CardDescription className="text-gray-600">
            Liste de toutes les ventes avec filtres appliqués
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Chargement des ventes...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 lg:max-h-[600px] overflow-y-auto">
              {ventes.map((vente) => (
                <Card key={vente.id} className="bg-white border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <p className="text-gray-900 font-medium">Vente {vente.numero_vente}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(vente.type_vente)}>
                              {vente.type_vente === 'magasin' ? 'Magasin' : 
                               vente.type_vente === 'en_ligne' ? 'En ligne' :
                               vente.type_vente === 'telephone' ? 'Téléphone' : 'Commande'}
                            </Badge>
                            <Badge className={getStatusColor(vente.statut)}>
                              {vente.statut === 'payee' ? 'Payée' :
                               vente.statut === 'en_cours' ? 'En cours' :
                               vente.statut === 'partiellement_payee' ? 'Partiellement payée' :
                               vente.statut === 'annulee' ? 'Annulée' : 'Remboursée'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {vente.client_nom}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(vente.date_vente || '').toLocaleDateString('fr-FR')}
                          </p>
                          <div className="flex items-center gap-1 text-gray-600">
                            {getPaymentIcon(vente.mode_paiement)}
                            <span className="capitalize">{vente.mode_paiement}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <p className="text-blue-600 font-bold text-xl">{vente.total_ttc.toLocaleString()} MAD</p>
                          <p className="text-xs text-gray-600">{vente.articles?.length || 0} article(s)</p>
                        </div>

                        {/* Actions: Modifier, Ticket, Facture, Garantie */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedVente(vente); setShowEditVente(true); }}
                            className="flex items-center gap-2 border-gray-400 text-gray-700 hover:bg-gray-700 hover:text-white"
                            title="Modifier la vente"
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVente(vente.id!, vente.numero_vente!)}
                            className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            title="Supprimer la vente"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateReceipt(vente)}
                            className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            title="Ticket de caisse"
                          >
                            <Receipt className="w-4 h-4" />
                            Ticket
                          </Button>
                          <InvoiceGenerator 
                            vente={vente}
                            onPreview={() => toast({
                              title: "Aperçu facture",
                              description: `Aperçu de la facture ${vente.numero_vente}`,
                            })}
                            onPrint={() => toast({
                              title: "Facture imprimée",
                              description: `Facture ${vente.numero_vente} envoyée à l'imprimante`,
                            })}
                          />
                          <WarrantyGenerator 
                            vente={vente}
                            onPrint={() => toast({
                              title: "Garantie imprimée",
                              description: `Garantie ${vente.numero_vente} envoyée à l'imprimante`,
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Détails des articles */}
                    {vente.articles && vente.articles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Articles:</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                          {vente.articles.map((article, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-300 truncate">{article.nom_produit} × {article.quantite}</span>
                              <span className="text-gaming-cyan ml-2">{article.total_ttc.toLocaleString()} MAD</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {vente.notes && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400">Notes: <span className="text-gray-300">{vente.notes}</span></p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {ventes.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Aucune vente trouvée avec ces filtres</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal des détails de vente */}
      <VenteDetailsModal
        vente={selectedVente}
        isOpen={showVenteDetails}
        onClose={() => {
          setShowVenteDetails(false);
          setSelectedVente(null);
        }}
        onGenerateInvoice={generateInvoice}
        onGenerateReceipt={generateReceipt}
      />

      <EditVenteModal
        isOpen={showEditVente}
        onClose={() => { setShowEditVente(false); setSelectedVente(null); }}
        vente={selectedVente}
        updateVenteFn={async (id, updates) => {
          const ok = await updateVente(id, updates);
          if (ok) await fetchVentes();
          return ok;
        }}
        onSaved={async () => {
          await fetchVentes();
        }}
      />
    </div>
  );
}
