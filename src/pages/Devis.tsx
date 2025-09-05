import React, { useState } from 'react';
import { useDevis, Devis } from '@/hooks/useDevis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ShoppingCart,
} from 'lucide-react';

const DevisPage = () => {
  const { devis, loading, error, updateDevisStatut, deleteDevis, convertDevisToVente, getDevisStats } = useDevis();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  // Statistiques
  const stats = getDevisStats();

  // Filtrage des devis
  const filteredDevis = devis.filter(devis => {
    const matchesSearch = 
      devis.numero_devis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devis.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devis.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || devis.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Couleurs des statuts
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'accepte':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'refuse':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'expire':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Icônes des statuts
  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Clock className="w-4 h-4" />;
      case 'accepte':
        return <CheckCircle className="w-4 h-4" />;
      case 'refuse':
        return <XCircle className="w-4 h-4" />;
      case 'expire':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Gestion des actions
  const handleStatusChange = async (devisId: string, newStatus: Devis['statut']) => {
    await updateDevisStatut(devisId, newStatus);
  };

  const handleDelete = async (devisId: string) => {
    await deleteDevis(devisId);
  };

  const handleConvertToSale = async (devisId: string) => {
    await convertDevisToVente(devisId);
  };

  const handleViewDetails = (devis: Devis) => {
    setSelectedDevis(devis);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Devis</h1>
          <p className="text-gray-600 mt-1">Gérez tous vos devis et suivez leur statut</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />
          Nouveau Devis
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Devis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptés</p>
                <p className="text-2xl font-bold text-green-600">{stats.acceptes}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.montantTotal.toLocaleString()} MAD</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="accepte">Accepté</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des devis */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Devis ({filteredDevis.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevis.map((devis) => (
                  <TableRow key={devis.id}>
                    <TableCell className="font-medium">{devis.numero_devis}</TableCell>
                    <TableCell>
                      {devis.client ? (
                        <div>
                          <p className="font-medium">{devis.client.nom} {devis.client.prenom}</p>
                          <p className="text-sm text-gray-500">{devis.client.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Client non défini</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(devis.date_creation).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {devis.date_expiration ? (
                        <span className={`${
                          new Date(devis.date_expiration) < new Date() 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {new Date(devis.date_expiration).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        <span className="text-gray-400">Non définie</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {devis.total_ttc.toLocaleString()} MAD
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(devis.statut)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(devis.statut)}
                          <span className="capitalize">
                            {devis.statut.replace('_', ' ')}
                          </span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(devis)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {devis.statut === 'en_attente' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(devis.id, 'accepte')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(devis.id, 'refuse')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {devis.statut === 'accepte' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvertToSale(devis.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le devis</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le devis {devis.numero_devis} ?
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(devis.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredDevis.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucun devis ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore créé de devis.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails du devis */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails du devis {selectedDevis?.numero_devis}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDevis && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDevis.client ? (
                      <div className="space-y-2">
                        <p><strong>Nom:</strong> {selectedDevis.client.nom} {selectedDevis.client.prenom}</p>
                        <p><strong>Email:</strong> {selectedDevis.client.email || 'Non renseigné'}</p>
                        <p><strong>Téléphone:</strong> {selectedDevis.client.telephone || 'Non renseigné'}</p>
                        <p><strong>Adresse:</strong> {selectedDevis.client.adresse || 'Non renseignée'}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Client non défini</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations Devis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Date de création:</strong> {new Date(selectedDevis.date_creation).toLocaleDateString('fr-FR')}</p>
                      <p><strong>Date d'expiration:</strong> {selectedDevis.date_expiration ? new Date(selectedDevis.date_expiration).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                      <p><strong>Statut:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(selectedDevis.statut)}`}>
                          {selectedDevis.statut.replace('_', ' ')}
                        </Badge>
                      </p>
                      <p><strong>Notes:</strong> {selectedDevis.notes || 'Aucune note'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Articles du devis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Articles du devis</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDevis.articles && selectedDevis.articles.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire HT</TableHead>
                          <TableHead>Total HT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDevis.articles.map((article) => (
                          <TableRow key={article.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{article.nom_produit}</p>
                                <p className="text-sm text-gray-500">{article.marque}</p>
                              </div>
                            </TableCell>
                            <TableCell>{article.quantite}</TableCell>
                            <TableCell>{article.prix_unitaire_ht.toLocaleString()} MAD</TableCell>
                            <TableCell>{article.total_ht.toLocaleString()} MAD</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500">Aucun article dans ce devis</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Totaux */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total HT:</span>
                      <span>{selectedDevis.sous_total.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA:</span>
                      <span>{selectedDevis.tva.toLocaleString()} MAD</span>
                    </div>
                    {selectedDevis.remise > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Remise:</span>
                        <span>-{selectedDevis.remise.toLocaleString()} MAD</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total TTC:</span>
                      <span>{selectedDevis.total_ttc.toLocaleString()} MAD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevisPage;