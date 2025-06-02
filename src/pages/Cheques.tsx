import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  FileCheck,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Banknote,
  Building,
  Search,
  Filter,
  DollarSign,
  User,
  CreditCard,
  Eye,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useCash } from "@/hooks/useCash";

interface Cheque {
  id: string;
  numero_cheque: string;
  montant: number;
  date_emission: string;
  date_echeance: string;
  client_nom: string;
  client_email?: string;
  vente_id?: string;
  numero_vente?: string;
  statut: 'en_attente' | 'encaisse' | 'rejete' | 'annule';
  date_encaissement?: string;
  compte_encaissement?: string;
  mode_encaissement?: 'especes' | 'virement';
  notes?: string;
  created_at: string;
}

export default function Cheques() {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [echeanceFilter, setEcheanceFilter] = useState("tous");
  const [selectedCheque, setSelectedCheque] = useState<Cheque | null>(null);
  const [showEncaissementDialog, setShowEncaissementDialog] = useState(false);
  const [encaissementMode, setEncaissementMode] = useState<'especes' | 'virement'>('especes');
  const [selectedAccount, setSelectedAccount] = useState("");
  
  const { toast } = useToast();
  const { comptes: bankAccounts, addMouvementFromVente } = useBankAccounts();
  const { addCashTransactionFromVente } = useCash();

  // Données de démonstration
  const defaultCheques: Cheque[] = [
    {
      id: '1',
      numero_cheque: 'CHQ001234',
      montant: 2500.00,
      date_emission: '2024-01-15',
      date_echeance: '2024-02-15',
      client_nom: 'Martin Jean',
      client_email: 'jean.martin@email.com',
      vente_id: 'v1',
      numero_vente: 'V20240115-001',
      statut: 'en_attente',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      numero_cheque: 'CHQ005678',
      montant: 1800.00,
      date_emission: '2024-01-20',
      date_echeance: '2024-01-25',
      client_nom: 'Dubois Marie',
      client_email: 'marie.dubois@email.com',
      vente_id: 'v2',
      numero_vente: 'V20240120-002',
      statut: 'en_attente',
      created_at: '2024-01-20T14:20:00Z'
    },
    {
      id: '3',
      numero_cheque: 'CHQ009012',
      montant: 3200.00,
      date_emission: '2024-01-10',
      date_echeance: '2024-01-20',
      client_nom: 'Leroy Pierre',
      client_email: 'pierre.leroy@email.com',
      vente_id: 'v3',
      numero_vente: 'V20240110-003',
      statut: 'encaisse',
      date_encaissement: '2024-01-20T09:15:00Z',
      compte_encaissement: 'compte1',
      mode_encaissement: 'virement',
      created_at: '2024-01-10T16:45:00Z'
    }
  ];

  // Charger les chèques
  useEffect(() => {
    const loadCheques = () => {
      try {
        const savedCheques = localStorage.getItem('gamerstore_cheques');
        if (savedCheques) {
          setCheques(JSON.parse(savedCheques));
        } else {
          setCheques(defaultCheques);
          localStorage.setItem('gamerstore_cheques', JSON.stringify(defaultCheques));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des chèques:', error);
        setCheques(defaultCheques);
      } finally {
        setLoading(false);
      }
    };

    loadCheques();
  }, []);

  // Sauvegarder les chèques
  const saveCheques = (newCheques: Cheque[]) => {
    try {
      setCheques(newCheques);
      localStorage.setItem('gamerstore_cheques', JSON.stringify(newCheques));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    }
  };

  // Filtrer les chèques
  const filteredCheques = cheques.filter(cheque => {
    const matchesSearch = searchTerm === "" || 
      cheque.numero_cheque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cheque.numero_vente && cheque.numero_vente.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "tous" || cheque.statut === statusFilter;
    
    let matchesEcheance = true;
    if (echeanceFilter !== "tous") {
      const today = new Date();
      const echeance = new Date(cheque.date_echeance);
      
      switch (echeanceFilter) {
        case "echu":
          matchesEcheance = echeance < today && cheque.statut === 'en_attente';
          break;
        case "cette_semaine":
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          matchesEcheance = echeance >= today && echeance <= nextWeek && cheque.statut === 'en_attente';
          break;
        case "ce_mois":
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          matchesEcheance = echeance >= today && echeance <= nextMonth && cheque.statut === 'en_attente';
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesEcheance;
  });

  // Obtenir le statut d'échéance
  const getEcheanceStatus = (cheque: Cheque) => {
    if (cheque.statut !== 'en_attente') return null;
    
    const today = new Date();
    const echeance = new Date(cheque.date_echeance);
    const diffDays = Math.ceil((echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { type: 'echu', label: 'Échu', color: 'bg-red-600' };
    if (diffDays <= 3) return { type: 'urgent', label: 'Urgent', color: 'bg-orange-600' };
    if (diffDays <= 7) return { type: 'proche', label: 'Proche', color: 'bg-yellow-600' };
    return { type: 'normal', label: 'Normal', color: 'bg-green-600' };
  };

  // Encaisser un chèque
  const encaisserCheque = async () => {
    if (!selectedCheque) return;

    if (encaissementMode === 'virement' && !selectedAccount) {
      toast({
        title: "Compte requis",
        description: "Veuillez sélectionner un compte pour l'encaissement",
        variant: "destructive",
      });
      return;
    }

    const updatedCheques = cheques.map(cheque => {
      if (cheque.id === selectedCheque.id) {
        return {
          ...cheque,
          statut: 'encaisse' as const,
          date_encaissement: new Date().toISOString(),
          mode_encaissement: encaissementMode,
          compte_encaissement: encaissementMode === 'virement' ? selectedAccount : undefined
        };
      }
      return cheque;
    });

    if (saveCheques(updatedCheques)) {
      // Ajouter le mouvement de caisse ou bancaire selon le mode d'encaissement
      try {
        if (encaissementMode === 'especes') {
          // Ajouter à la caisse physique
          addCashTransactionFromVente({
            type: "entree",
            amount: selectedCheque.montant,
            description: `Encaissement chèque ${selectedCheque.numero_cheque} - ${selectedCheque.client_nom}`,
            category: "Encaissement Chèque",
            user: "Admin",
            vente_id: selectedCheque.vente_id,
            numero_vente: selectedCheque.numero_vente
          });
        } else if (encaissementMode === 'virement' && selectedAccount) {
          // Ajouter au compte bancaire
          addMouvementFromVente({
            compte_bancaire_id: selectedAccount,
            type_mouvement: 'Crédit',
            montant: selectedCheque.montant,
            libelle: `Encaissement chèque ${selectedCheque.numero_cheque} - ${selectedCheque.client_nom}`,
            categorie: 'Encaissement Chèque',
            mode_paiement: 'Chèque',
            beneficiaire: 'Gamerstore',
            emetteur: selectedCheque.client_nom,
            statut: 'Validé',
            rapproche: false,
            reference: selectedCheque.numero_cheque
          });
        }
      } catch (error) {
        console.warn('Erreur lors de l\'ajout du mouvement d\'encaissement:', error);
      }

      toast({
        title: "Chèque encaissé",
        description: `Le chèque ${selectedCheque.numero_cheque} a été encaissé avec succès`,
      });
      setShowEncaissementDialog(false);
      setSelectedCheque(null);
      setEncaissementMode('especes');
      setSelectedAccount("");
    }
  };

  // Rejeter un chèque
  const rejeterCheque = (cheque: Cheque) => {
    if (window.confirm(`Êtes-vous sûr de vouloir rejeter le chèque ${cheque.numero_cheque} ?`)) {
      const updatedCheques = cheques.map(c => 
        c.id === cheque.id ? { ...c, statut: 'rejete' as const } : c
      );
      
      if (saveCheques(updatedCheques)) {
        toast({
          title: "Chèque rejeté",
          description: `Le chèque ${cheque.numero_cheque} a été marqué comme rejeté`,
        });
      }
    }
  };

  // Calculer les statistiques
  const stats = {
    total_en_attente: cheques.filter(c => c.statut === 'en_attente').length,
    montant_en_attente: cheques.filter(c => c.statut === 'en_attente').reduce((sum, c) => sum + c.montant, 0),
    total_encaisses: cheques.filter(c => c.statut === 'encaisse').length,
    montant_encaisse: cheques.filter(c => c.statut === 'encaisse').reduce((sum, c) => sum + c.montant, 0),
    echus: cheques.filter(c => c.statut === 'en_attente' && new Date(c.date_echeance) < new Date()).length
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-yellow-600';
      case 'encaisse': return 'bg-green-600';
      case 'rejete': return 'bg-red-600';
      case 'annule': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const formatStatut = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'encaisse': return 'Encaissé';
      case 'rejete': return 'Rejeté';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-purple"></div>
        <span className="ml-2 text-white">Chargement des chèques...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Gestion des Chèques</h1>
            <p className="text-gray-400 text-sm lg:text-base">Suivi des échéances et encaissement</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">En attente</p>
                <p className="text-xl font-bold text-white">{stats.total_en_attente}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Montant en attente</p>
                <p className="text-xl font-bold text-white">{stats.montant_en_attente.toFixed(2)} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Encaissés</p>
                <p className="text-xl font-bold text-white">{stats.total_encaisses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Montant encaissé</p>
                <p className="text-xl font-bold text-white">{stats.montant_encaisse.toFixed(2)} MAD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Échus</p>
                <p className="text-xl font-bold text-white">{stats.echus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="N° chèque, client, vente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="encaisse">Encaissé</SelectItem>
                  <SelectItem value="rejete">Rejeté</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Échéance</Label>
              <Select value={echeanceFilter} onValueChange={setEcheanceFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="tous">Toutes les échéances</SelectItem>
                  <SelectItem value="echu">Échus</SelectItem>
                  <SelectItem value="cette_semaine">Cette semaine</SelectItem>
                  <SelectItem value="ce_mois">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des chèques */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Chèques ({filteredCheques.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Liste des chèques avec suivi des échéances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCheques.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Aucun chèque trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCheques.map((cheque) => {
                const echeanceStatus = getEcheanceStatus(cheque);
                return (
                  <div key={cheque.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gaming-cyan/20 rounded-lg flex items-center justify-center">
                            <FileCheck className="w-4 h-4 text-gaming-cyan" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{cheque.numero_cheque}</h4>
                            <p className="text-sm text-gray-400">{cheque.client_nom}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Montant:</span>
                            <span className="ml-2 text-gaming-cyan font-semibold">{cheque.montant.toFixed(2)} MAD</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Échéance:</span>
                            <span className="ml-2 text-white">{new Date(cheque.date_echeance).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {cheque.numero_vente && (
                            <div>
                              <span className="text-gray-400">Vente:</span>
                              <span className="ml-2 text-white">{cheque.numero_vente}</span>
                            </div>
                          )}
                          {cheque.date_encaissement && (
                            <div>
                              <span className="text-gray-400">Encaissé le:</span>
                              <span className="ml-2 text-white">{new Date(cheque.date_encaissement).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {echeanceStatus && (
                          <Badge className={echeanceStatus.color}>
                            {echeanceStatus.label}
                          </Badge>
                        )}
                        <Badge className={getStatusColor(cheque.statut)}>
                          {formatStatut(cheque.statut)}
                        </Badge>
                        
                        {cheque.statut === 'en_attente' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gaming-gradient"
                              onClick={() => {
                                setSelectedCheque(cheque);
                                setShowEncaissementDialog(true);
                              }}
                            >
                              Encaisser
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                              onClick={() => rejeterCheque(cheque)}
                            >
                              Rejeter
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'encaissement */}
      <Dialog open={showEncaissementDialog} onOpenChange={setShowEncaissementDialog}>
        <DialogContent className="tech-gradient border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Encaisser le chèque</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedCheque && `Chèque ${selectedCheque.numero_cheque} - ${selectedCheque.montant.toFixed(2)} MAD`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-gray-300">Mode d'encaissement</Label>
              <div className="space-y-2">
                {[
                  { value: "especes", label: "Espèces (vers la caisse)", icon: Banknote },
                  { value: "virement", label: "Virement (vers un compte)", icon: Building }
                ].map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      encaissementMode === value
                        ? 'border-gaming-cyan bg-gaming-cyan/10 text-gaming-cyan'
                        : 'border-gray-600 bg-gray-800/50 text-white hover:border-gray-500 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setEncaissementMode(value as 'especes' | 'virement')}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="font-medium">{label}</span>
                    {encaissementMode === value && (
                      <div className="ml-auto w-2 h-2 bg-gaming-cyan rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>

              {encaissementMode === "virement" && (
                <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                  <Label className="text-gray-300 text-sm">Compte de réception *</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="mt-1 bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Sélectionner le compte" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {bankAccounts.filter(account => account.statut === 'Actif').map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.nom_compte} - {account.nom_banque}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowEncaissementDialog(false)}>
              Annuler
            </Button>
            <Button onClick={encaisserCheque} className="gaming-gradient">
              Confirmer l'encaissement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 