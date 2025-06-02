import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PDFGenerator } from "@/lib/pdfGenerator";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import {
  User,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  FileCheck,
  Package,
  Receipt,
  MapPin,
  Phone,
  Mail,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { type Vente } from "@/hooks/useVentes";

interface VenteDetailsModalProps {
  vente: Vente | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateInvoice?: (vente: Vente) => void;
  onGenerateReceipt?: (vente: Vente) => void;
}

export function VenteDetailsModal({ 
  vente, 
  isOpen, 
  onClose, 
  onGenerateInvoice, 
  onGenerateReceipt 
}: VenteDetailsModalProps) {
  if (!vente) return null;

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
      case 'payee': return 'bg-green-600';
      case 'en_cours': return 'bg-yellow-600';
      case 'partiellement_payee': return 'bg-orange-600';
      case 'annulee': return 'bg-red-600';
      case 'remboursee': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'magasin': return 'bg-gaming-green';
      case 'en_ligne': return 'bg-gaming-purple';
      case 'telephone': return 'bg-gaming-cyan';
      case 'commande': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const formatStatut = (statut: string) => {
    switch (statut) {
      case 'payee': return 'Payée';
      case 'en_cours': return 'En cours';
      case 'partiellement_payee': return 'Partiellement payée';
      case 'annulee': return 'Annulée';
      case 'remboursee': return 'Remboursée';
      default: return statut;
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case 'magasin': return 'Magasin';
      case 'en_ligne': return 'En ligne';
      case 'telephone': return 'Téléphone';
      case 'commande': return 'Commande';
      default: return type;
    }
  };

  const handleGenerateInvoice = () => {
    if (onGenerateInvoice) {
      onGenerateInvoice(vente);
    } else {
      PDFGenerator.generateInvoice(vente);
    }
  };

  const handleGenerateReceipt = () => {
    if (onGenerateReceipt) {
      onGenerateReceipt(vente);
    } else {
      PDFGenerator.generateReceipt(vente);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Détails de la vente {vente.numero_vente}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Informations complètes de la vente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête de la vente */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Vente {vente.numero_vente}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(vente.type_vente)}>
                    {formatType(vente.type_vente)}
                  </Badge>
                  <Badge className={getStatusColor(vente.statut)}>
                    {formatStatut(vente.statut)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(vente.date_vente || '').toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  {getPaymentIcon(vente.mode_paiement)}
                  <span className="capitalize">{vente.mode_paiement}</span>
                </div>
                {vente.vendeur_nom && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{vente.vendeur_nom}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations client */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Nom</p>
                  <p className="text-white font-medium">{vente.client_nom}</p>
                </div>
                {vente.client_email && (
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{vente.client_email}</p>
                  </div>
                )}
                {vente.adresse_livraison && (
                  <div>
                    <p className="text-sm text-gray-400">Adresse de livraison</p>
                    <p className="text-white">{vente.adresse_livraison}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Résumé financier */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Résumé financier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sous-total HT</span>
                  <span className="text-white">{vente.total_ht.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TVA</span>
                  <span className="text-white">{vente.tva.toLocaleString()} MAD</span>
                </div>
                {vente.remise > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remise</span>
                    <span className="text-red-400">-{vente.remise.toLocaleString()} MAD</span>
                  </div>
                )}
                {vente.frais_livraison && vente.frais_livraison > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frais de livraison</span>
                    <span className="text-white">{vente.frais_livraison.toLocaleString()} MAD</span>
                  </div>
                )}
                <Separator className="bg-gray-600" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total TTC</span>
                  <span className="text-gaming-cyan">{vente.total_ttc.toLocaleString()} MAD</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Articles vendus */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Articles vendus ({vente.articles?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vente.articles && vente.articles.length > 0 ? (
                <div className="space-y-3">
                  {vente.articles.map((article, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{article.nom_produit}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            {article.code_barre && (
                              <span>Code: {article.code_barre}</span>
                            )}
                            {article.marque && (
                              <span>Marque: {article.marque}</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {article.produit_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {article.prix_unitaire_ttc.toLocaleString()} MAD × {article.quantite}
                          </p>
                          <p className="text-gaming-cyan font-bold">
                            {article.total_ttc.toLocaleString()} MAD
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Aucun article trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paiements */}
          {vente.paiements && vente.paiements.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Historique des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vente.paiements.map((paiement, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPaymentIcon(paiement.mode_paiement)}
                          <div>
                            <p className="text-white font-medium capitalize">
                              {paiement.mode_paiement}
                            </p>
                            <p className="text-sm text-gray-400">
                              {new Date(paiement.date_paiement || '').toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gaming-cyan font-bold">
                            {paiement.montant.toLocaleString()} MAD
                          </p>
                          <Badge className={paiement.statut === 'valide' ? 'bg-green-600' : 'bg-yellow-600'}>
                            {paiement.statut === 'valide' ? 'Validé' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {vente.notes && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{vente.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleGenerateReceipt}
              className="gaming-gradient"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Générer ticket
            </Button>
            
            {/* Nouveau générateur de factures GAMER STORE */}
            <InvoiceGenerator 
              vente={vente}
              onPreview={() => console.log('Aperçu facture')}
              onPrint={() => console.log('Impression facture')}
              onDownload={() => console.log('Téléchargement facture')}
            />
            
            <Button
              onClick={handleGenerateInvoice}
              variant="outline"
              className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-black"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Ancienne facture
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 