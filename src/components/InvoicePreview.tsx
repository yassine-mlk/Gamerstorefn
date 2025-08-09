import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { type Vente } from "@/hooks/useVentes";
import { QRCodeGenerator } from "@/lib/qrCodeGenerator";
import { COMPANY_CONFIG, getCompanyLogo } from "@/lib/companyConfig";

interface InvoicePreviewProps {
  vente: Vente;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function InvoicePreview({ vente, isOpen, onClose, onPrint, onDownload }: InvoicePreviewProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      if (vente.numero_vente) {
        const qrCode = await QRCodeGenerator.generateInvoiceQR(vente);
        setQrCodeDataURL(qrCode);
      }
    };
    generateQR();
  }, [vente]);

  const numeroFacture = vente.numero_vente || 'N/A';
  const dateFacture = new Date(vente.date_vente || Date.now()).toLocaleDateString('fr-FR');
  
  const logo = getCompanyLogo();

  // Calculs
  const totalHT = vente.total_ht || 0;
  const tva = vente.tva || 0;
  const totalTTC = vente.total_ttc || 0;
  const fraisLivraison = vente.frais_livraison || 0;
  
  // Format des nombres
  const formatPrice = (price: number) => price.toFixed(2);
  const formatPriceText = (price: number) => {
    const formatter = new Intl.NumberFormat('fr-FR');
    const parts = formatter.formatToParts(Math.floor(price));
    const integerPart = parts.map(part => part.value).join('');
    const decimal = Math.round((price - Math.floor(price)) * 100);
    return `${integerPart} dirham${price >= 2 ? 's' : ''} et ${decimal} centimes`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-black text-xl">
              Aperçu Facture {numeroFacture}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={onPrint}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="invoice-preview-container bg-white p-8 border rounded-lg" style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          lineHeight: '1.4',
          color: '#000'
        }}>
          {/* En-tête */}
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-black">
            <div className="flex items-center gap-4">
              {logo.type === "image" ? (
                <img 
                  src={logo.url} 
                  alt={logo.alt} 
                  className="object-contain"
                  style={{ width: `${logo.width}px`, height: `${logo.height}px` }}
                />
              ) : (
                <div className="w-20 h-15 bg-black text-white flex flex-col items-center justify-center font-bold rounded">
                  <div className="text-lg">{logo.text}</div>
                  <div className="text-xs">{logo.subtext.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}</div>
                </div>
              )}
              <div className="text-base font-bold">
                GAMER<br/>STORE
              </div>
            </div>
            
            <div className="text-2xl font-bold text-center mx-5">Facture</div>
            
            <div className="text-right text-sm font-bold">
              {COMPANY_CONFIG.nom}
            </div>
          </div>
          
          {/* Détails de la facture */}
          <div className="bg-gray-100 p-4 mb-5 flex justify-between">
            <div className="flex-1">
              <div className="font-bold mb-1">Facture :</div>
              <div>Numéro : {numeroFacture}</div>
              <div>Date : {dateFacture}</div>
            </div>
            
            <div className="flex-1 ml-10">
              <div className="font-bold mb-1">CLIENT :</div>
              <div>Ste : {vente.client_nom}</div>
              <div>Ice : {vente.client_email || 'N/A'}</div>
            </div>
            
            <div className="w-20 h-20 border-2 border-black flex items-center justify-center ml-5">
              {qrCodeDataURL ? (
                <img src={qrCodeDataURL} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="text-xs text-center">QR<br/>CODE</div>
              )}
            </div>
          </div>
          
          {/* Tableau des produits */}
          <table className="w-full border-collapse mb-5 border-2 border-black">
            <thead>
              <tr className="bg-black text-white">
                <th className="border border-black p-3 text-center font-bold">ID</th>
                <th className="border border-black p-3 text-center font-bold">NOM DU PRODUIT</th>
                <th className="border border-black p-3 text-center font-bold">PRIX</th>
                <th className="border border-black p-3 text-center font-bold">QTÉ</th>
                <th className="border border-black p-3 text-center font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {vente.articles?.map((article, index) => (
                <React.Fragment key={index}>
                  {article.image_url && (
                    <tr>
                      <td className="border border-black p-3 bg-gray-50" colSpan={5}>
                        <div className="w-full flex items-center justify-center">
                          <img
                            src={article.image_url}
                            alt={article.nom_produit}
                            className="object-contain border border-gray-300 rounded"
                            style={{ width: 120, height: 120 }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.nextElementSibling as HTMLDivElement;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                          <div
                            className="hidden items-center justify-center text-3xl text-gray-400 border border-gray-300 rounded"
                            style={{ width: 120, height: 120 }}
                          >
                            📦
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="border border-black p-2 text-center">{index + 1}</td>
                    <td className="border border-black p-2 text-left max-w-xs">{article.nom_produit}</td>
                    <td className="border border-black p-2 text-right font-bold">{formatPrice(article.prix_unitaire_ttc)}</td>
                    <td className="border border-black p-2 text-center">{article.quantite}</td>
                    <td className="border border-black p-2 text-right font-bold">{formatPrice(article.total_ttc)}</td>
                  </tr>
                </React.Fragment>
              ))}
              
              {/* Lignes vides pour remplir l'espace */}
              {Array.from({ length: Math.max(0, 6 - (vente.articles?.length || 0)) }, (_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <table className="border-collapse">
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-right bg-gray-100 font-bold min-w-36">Total HT:</td>
                  <td className="border border-black p-2 text-right font-bold min-w-24">{formatPrice(totalHT)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-right bg-gray-100 font-bold">Total TVA (20%):</td>
                  <td className="border border-black p-2 text-right font-bold">{formatPrice(tva)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-right bg-gray-100 font-bold">Total Livraison:</td>
                  <td className="border border-black p-2 text-right font-bold">{formatPrice(fraisLivraison)}</td>
                </tr>
                <tr className="bg-black text-white">
                  <td className="border border-black p-2 text-right font-bold">Prix Total:</td>
                  <td className="border border-black p-2 text-right font-bold">{formatPrice(totalTTC)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Montant en lettres */}
          <div className="text-center font-bold my-8 p-4 border border-gray-300 bg-gray-50 rounded">
            Arrête le présente facture à la somme de {formatPriceText(totalTTC)} ttc .
          </div>
          
          {/* Pied de page */}
          <div className="mt-10 text-center text-xs border-t border-gray-300 pt-4">
            <div className="mb-1">Télé: {COMPANY_CONFIG.telephone}</div>
            <div className="mb-1">Adresse: {COMPANY_CONFIG.adresse}</div>
            <div>RC: {COMPANY_CONFIG.rc} / IF: {COMPANY_CONFIG.if} / ICE: {COMPANY_CONFIG.ice}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 