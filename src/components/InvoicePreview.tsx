import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X, FileText, Loader2 } from "lucide-react";
import { type Vente } from "@/hooks/useVentes";
import { QRCodeGenerator } from "@/lib/qrCodeGenerator";
import { COMPANY_CONFIG, getCompanyLogo } from "@/lib/companyConfig";
import { supabase } from "@/lib/supabase";
import { convertirMontantEnLettres } from "@/utils/numberToWords";
import { PDFGenerator } from "@/lib/pdfGenerator";

interface InvoicePreviewProps {
  vente: Vente;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function InvoicePreview({ vente, isOpen, onClose, onPrint, onDownload }: InvoicePreviewProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [articlesWithImages, setArticlesWithImages] = useState<any[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fonction pour récupérer toutes les données d'un produit depuis sa table source
  const getProductData = async (produit_id: string, produit_type: string): Promise<any> => {
    try {
      let tableName: string;
      let selectFields: string;
      
      switch (produit_type) {
        case 'pc_portable':
          tableName = 'pc_portables';
          selectFields = 'image_url, marque, modele, processeur, carte_graphique, ram, stockage, ecran, etat';
          break;
        case 'moniteur':
          tableName = 'moniteurs';
          selectFields = 'image_url, marque, modele, taille_ecran, resolution, taux_rafraichissement, etat';
          break;
        case 'peripherique':
          tableName = 'peripheriques';
          selectFields = 'image_url, marque, modele, type_peripherique, etat';
          break;
        case 'chaise_gaming':
          tableName = 'chaises_gaming';
          selectFields = 'image_url, marque, modele, materiau, couleur, etat';
          break;
        case 'pc_gamer':
          tableName = 'pc_gamer';
          selectFields = 'image_url, nom_configuration, processeur, carte_graphique, ram, stockage, etat';
          break;
        case 'composant_pc':
          tableName = 'composants_pc';
          selectFields = 'image_url, nom_produit, categorie, etat';
          break;
        default:
          return null;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq('id', produit_id)
        .single();

      if (error || !data) return null;
      
      return data;
    } catch (err) {
      console.error(`Erreur lors de la récupération des données pour ${produit_type} ${produit_id}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const generateQR = async () => {
      if (vente.numero_vente) {
        const qrCode = await QRCodeGenerator.generateInvoiceQR(vente);
        setQrCodeDataURL(qrCode);
      }
    };
    
    const enrichArticlesWithImages = async () => {
      if (vente.articles && vente.articles.length > 0) {
        const enrichedArticles = await Promise.all(
          vente.articles.map(async (article) => {
            const productData = await getProductData(article.produit_id, article.produit_type);
            return { ...article, ...productData };
          })
        );
        setArticlesWithImages(enrichedArticles);
      }
    };
    
    generateQR();
    enrichArticlesWithImages();
  }, [vente]);

  const numeroFacture = vente.numero_vente || 'N/A';
  const dateFacture = new Date(vente.date_vente || Date.now()).toLocaleDateString('fr-FR');
  
  const logo = getCompanyLogo();

  // Détection du mode de taxe basé sur la présence de TVA dans la vente
  const taxMode = (vente.tva && vente.tva > 0) ? "with_tax" : "without_tax";

  // Calculs basés sur les prix HT et ajout de TVA si nécessaire
  const calculerTotaux = () => {
    if (!articlesWithImages || articlesWithImages.length === 0) {
      return { totalHT: 0, tva: 0, totalTTC: 0 };
    }
    
    // Calculer le total HT à partir des prix stockés
    const totalHT = articlesWithImages.reduce((sum, article) => {
      const prixHT = article.prix_unitaire_ht || article.prix_unitaire_ttc;
      return sum + (prixHT * article.quantite);
    }, 0);
    
    // Si mode avec TVA, calculer 20% de TVA
    const tva = taxMode === "with_tax" ? totalHT * 0.20 : 0;
    const totalTTC = totalHT + tva;
    
    return { totalHT, tva, totalTTC };
  };
  
  const { totalHT, tva, totalTTC } = calculerTotaux();
  const fraisLivraison = vente.frais_livraison || 0;
  const totalFinal = totalTTC + fraisLivraison;
  
  // Format des nombres
  const formatPrice = (price: number) => price.toFixed(2);

  // Fonction pour imprimer en PDF natif
  const handlePrintPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await PDFGenerator.generateNativeInvoicePDF(vente, articlesWithImages);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black">
        <DialogHeader className="no-print">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-black text-xl">
              Aperçu Facture {numeroFacture}
            </DialogTitle>
            <div className="flex items-center gap-2 no-print">
              <Button
                onClick={onPrint}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 no-print"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
              <Button
                onClick={handlePrintPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 no-print"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Imprimer PDF
                  </>
                )}
              </Button>
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 no-print"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="no-print"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <>
        <style>
          {`
            @media print {
              .invoice-preview-container {
                border: none !important;
                border-radius: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                min-height: 100vh !important;
                display: flex !important;
                flex-direction: column !important;
                background: white !important;
              }
              
              .flex-1 {
                flex: 1 !important;
                padding: 20mm !important;
                padding-bottom: 0 !important;
              }
              
              .mt-auto {
                margin-top: auto !important;
                padding: 15mm 20mm !important;
                border-top: 1px solid #ccc !important;
                background: white !important;
              }
              
              .mb-auto {
                margin-bottom: auto !important;
              }
              
              /* Forcer la structure flexbox en impression */
              html, body {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              /* Assurer que le dialog prend toute la page */
              .fixed, .absolute, [role="dialog"], 
              [data-radix-dialog-content] {
                position: static !important;
                transform: none !important;
                height: 100vh !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                overflow: visible !important;
              }
              
              @page {
                size: A4;
                margin: 0;
              }
              
              /* Masquer les éléments d'interface lors de l'impression */
              .dialog-header,
              button,
              .no-print {
                display: none !important;
              }
            }
          `}
        </style>
        <div className="invoice-preview-container bg-white border rounded-lg flex flex-col min-h-[297mm]" style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          lineHeight: '1.4',
          color: '#000'
        }}>
          <div className="flex-1 p-8 pb-0">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-black relative">
            <div className="flex items-center gap-4">
              {logo.type === "image" ? (
                <img 
                  src={logo.url} 
                  alt={logo.alt} 
                  className="object-contain"
                  style={{ width: `${logo.width * 2}px`, height: `${logo.height * 2}px` }}
                />
              ) : (
                <div className="w-40 h-30 bg-black text-white flex flex-col items-center justify-center font-bold rounded-lg">
                  <div className="text-4xl">{logo.text}</div>
                  <div className="text-base">{logo.subtext.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}</div>
                </div>
              )}
            </div>
            
            <div className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Facture</div>
            
            <div className="text-right">
              <strong className="underline">{COMPANY_CONFIG.nom}</strong>
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
              <div className="font-bold mb-1">Client :</div>
              <div>{vente.client_type === 'societe' ? 'Ste : ' : ''}{vente.client_nom}</div>
              {vente.client_type === 'societe' && (
                <div>ICE : {(vente as any).client_ice || vente.client_email || '00004974700087'}</div>
              )}
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
          <table className="w-full border-collapse mb-5 border border-black">
            <thead>
              <tr className="bg-black text-white">
                <th className="border border-black p-2 text-center font-bold text-sm">ID</th>
                <th className="border border-black p-2 text-center font-bold text-sm">NOM DU PRODUIT</th>
                <th className="border border-black p-2 text-center font-bold text-sm">PRIX</th>
                <th className="border border-black p-2 text-center font-bold text-sm">QTÉ</th>
                <th className="border border-black p-2 text-center font-bold text-sm">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {articlesWithImages.map((article, index) => {
                // Créer les spécifications détaillées avec les vraies données
                const specifications = [];
                
                // Spécifications selon le type de produit (identique au PDF)
                if (article.marque) specifications.push(`• Brand: ${article.marque}`);
                if (article.modele) specifications.push(`• Model: ${article.modele}`);
                
                if (article.produit_type === 'pc_portable') {
                    if (article.processeur) specifications.push(`• Processor Type: ${article.processeur}`);
                    if (article.carte_graphique) specifications.push(`• Graphics Chipset: ${article.carte_graphique}`);
                    if (article.ram) specifications.push(`• RAM: ${article.ram}`);
                    if (article.stockage) specifications.push(`• Storage: ${article.stockage}`);
                    if (article.ecran) specifications.push(`• Display: ${article.ecran}`);
                    if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                    specifications.push(`• Bonus: Free RGB Mouse`);
                } else if (article.produit_type === 'moniteur') {
                    if (article.taille_ecran) specifications.push(`• Screen Size: ${article.taille_ecran}`);
                    if (article.resolution) specifications.push(`• Resolution: ${article.resolution}`);
                    if (article.taux_rafraichissement) specifications.push(`• Refresh Rate: ${article.taux_rafraichissement}`);
                    if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                } else if (article.produit_type === 'peripherique') {
                    if (article.type_peripherique) specifications.push(`• Type: ${article.type_peripherique}`);
                    if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                } else if (article.produit_type === 'chaise_gaming') {
                    if (article.materiau) specifications.push(`• Material: ${article.materiau}`);
                    if (article.couleur) specifications.push(`• Color: ${article.couleur}`);
                    if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                } else if (article.produit_type === 'pc_gamer') {
                    if (article.processeur) specifications.push(`• Processor: ${article.processeur}`);
                    if (article.carte_graphique) specifications.push(`• Graphics Card: ${article.carte_graphique}`);
                    if (article.ram) specifications.push(`• RAM: ${article.ram}`);
                    if (article.stockage) specifications.push(`• Storage: ${article.stockage}`);
                    if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                } else if (article.produit_type === 'composant_pc') {
                    if (article.categorie) specifications.push(`• Category: ${article.categorie}`);
                    if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                }
                
                // Si aucune spécification, afficher au moins le nom du produit
                if (specifications.length === 0) {
                    specifications.push(`• Product: ${article.nom_produit}`);
                    if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                }
                
                return [
                  <tr key={`product-${index}`}>
                    <td rowSpan={2} className="border border-black p-1 text-left align-top">
                      {article.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.nom_produit}
                          className="w-full h-24 object-contain border border-gray-300 rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-24 border border-gray-300 flex items-center justify-center text-xs text-gray-500 rounded bg-gray-100">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="border border-black p-2 text-left align-top">
                      <div className="font-bold mb-2 text-sm">Specification</div>
                      <div className="text-xs leading-tight space-y-1">
                        {specifications.map((spec, i) => (
                          <div key={`spec-${index}-${i}`}>{spec}</div>
                        ))}
                      </div>
                    </td>
                    <td className="border border-black p-2 text-right font-bold align-top text-sm">
                      {formatPrice(article.prix_unitaire_ht || article.prix_unitaire_ttc)}
                    </td>
                    <td className="border border-black p-2 text-center align-top text-sm font-bold">{article.quantite}</td>
                    <td className="border border-black p-2 text-right font-bold align-top text-sm">
                      {formatPrice((article.prix_unitaire_ht || article.prix_unitaire_ttc) * article.quantite)}
                    </td>
                  </tr>,
                  <tr key={`product-detail-${index}`}>
                    <td className="border-l border-r border-b border-black p-2 text-left" style={{borderTop: 'none'}}>
                      <div className="font-bold mb-2 text-sm">Detail</div>
                      <div className="text-xs text-gray-700">
                        {(article as any).description || article.nom_produit}
                      </div>
                    </td>
                    <td className="border-r border-b border-black" style={{borderTop: 'none'}}></td>
                    <td className="border-r border-b border-black" style={{borderTop: 'none'}}></td>
                    <td className="border-r border-b border-black" style={{borderTop: 'none'}}></td>
                  </tr>
                ];
              }).flat()}
            </tbody>
          </table>
          
          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <table className="border-collapse">
                              <tbody>
                 {taxMode === "with_tax" && tva > 0 && (
                   <>
                     <tr>
                       <td className="border border-black p-2 text-right bg-gray-100 font-bold min-w-36">Total HT :</td>
                       <td className="border border-black p-2 text-right font-bold min-w-24">{formatPrice(totalHT)}</td>
                     </tr>
                     <tr>
                       <td className="border border-black p-2 text-right bg-gray-100 font-bold">Tva 20% :</td>
                       <td className="border border-black p-2 text-right font-bold">{formatPrice(tva)}</td>
                     </tr>
                   </>
                 )}
                 {fraisLivraison > 0 && (
                   <tr>
                     <td className="border border-black p-2 text-right bg-gray-100 font-bold">Total Livraison:</td>
                     <td className="border border-black p-2 text-right font-bold">{formatPrice(fraisLivraison)}</td>
                   </tr>
                 )}
                 <tr className="bg-black text-white">
                   <td className="border border-black p-2 text-right font-bold">
                     {taxMode === "with_tax" && tva > 0 ? 'Total TTC :' : 'Total HT :'}
                   </td>
                   <td className="border border-black p-2 text-right font-bold">{formatPrice(totalFinal)}</td>
                 </tr>
                </tbody>
            </table>
          </div>
          
          {/* Montant en lettres */}
                      <div className="text-center font-bold my-8 p-4 border border-gray-300 bg-gray-50 rounded mb-auto">
             Arrete le presente facture a la somme de {convertirMontantEnLettres(totalFinal)} {taxMode === "with_tax" && tva > 0 ? 'TTC' : 'HT'}
            </div>
          
          </div> {/* Fin du contenu principal */}
          
          {/* Pied de page */}
          <div className="mt-auto text-center text-xs border-t border-gray-300 pt-4 px-8 pb-4 bg-white">
            <div className="mb-1">Télé: {COMPANY_CONFIG.telephone}</div>
            <div className="mb-1">Adresse: {COMPANY_CONFIG.adresse}</div>
            <div>RC: {COMPANY_CONFIG.rc} / IF: {COMPANY_CONFIG.if} / ICE: {COMPANY_CONFIG.ice}</div>
          </div>
        </div>
        </>
      </DialogContent>
    </Dialog>
  );
} 