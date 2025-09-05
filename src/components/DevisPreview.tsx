import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { type Devis } from "@/hooks/useDevis";
import { QRCodeGenerator } from "@/lib/qrCodeGenerator";
import { COMPANY_CONFIG, getCompanyLogo } from "@/lib/companyConfig";
import { supabase } from "@/lib/supabase";
import { convertirMontantEnLettres } from "@/utils/numberToWords";

interface DevisPreviewProps {
  devis: Devis;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function DevisPreview({ devis, isOpen, onClose, onPrint, onDownload: _onDownload }: DevisPreviewProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [articlesWithImages, setArticlesWithImages] = useState<any[]>([]);

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
      if (devis.numero_devis) {
        // Adapter le QR code pour les devis
        const qrData = {
          type: 'devis',
          numero: devis.numero_devis,
          client: devis.client?.nom || 'Client',
          total: devis.total_ttc,
          date: devis.date_creation
        };
        const qrCode = await QRCodeGenerator.generateInvoiceQR(qrData as any);
        setQrCodeDataURL(qrCode);
      }
    };
    
    const enrichArticlesWithImages = async () => {
      if (devis.articles && devis.articles.length > 0) {
        const enrichedArticles = await Promise.all(
          devis.articles.map(async (article) => {
            const productData = await getProductData(article.produit_id, article.produit_type);
            return { ...article, ...productData };
          })
        );
        setArticlesWithImages(enrichedArticles);
      }
    };
    
    generateQR();
    enrichArticlesWithImages();
  }, [devis]);

  const numeroDevis = devis.numero_devis || 'N/A';
  const dateDevis = new Date(devis.date_creation || Date.now()).toLocaleDateString('fr-FR');
  
  const logo = getCompanyLogo();

  // Détection du mode de taxe basé sur la présence de TVA dans le devis
  const taxMode = (devis.tva && devis.tva > 0) ? "with_tax" : "without_tax";

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
  
  // Format des nombres
  const formatPrice = (price: number) => price.toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black">
        <DialogHeader className="no-print">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-black text-xl">
              Aperçu Devis {numeroDevis}
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
              .devis-preview-container {
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
        <div className="devis-preview-container bg-white border rounded-lg flex flex-col min-h-[297mm]" style={{
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
            
            <div className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Devis</div>
            
            <div className="text-right">
              <strong className="underline">{COMPANY_CONFIG.nom}</strong>
            </div>
          </div>
          
          {/* Détails du devis */}
          <div className="bg-gray-100 p-4 mb-5 flex justify-between">
            <div className="flex-1">
              <div className="font-bold mb-1">Devis :</div>
              <div>Numéro : {numeroDevis}</div>
              <div>Date : {dateDevis}</div>
              <div>Validité : {devis.date_expiration ? new Date(devis.date_expiration).toLocaleDateString('fr-FR') : 'N/A'}</div>
            </div>
            
            <div className="flex-1 ml-10">
              <div className="font-bold mb-1">Client :</div>
              <div>{devis.client?.nom || 'Client'}</div>
              {devis.client?.email && (
                <div>Email : {devis.client.email}</div>
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
                const prixUnitaire = article.prix_unitaire_ht || article.prix_unitaire_ttc || 0;
                const total = prixUnitaire * article.quantite;
                
                return (
                  <tr key={index} className="border-b">
                    <td className="border border-black p-2 text-center text-xs">{index + 1}</td>
                    <td className="border border-black p-2 text-xs">
                      <div className="font-semibold">{article.nom_produit}</div>
                      {article.marque && <div className="text-gray-600">Marque: {article.marque}</div>}
                      {article.modele && <div className="text-gray-600">Modèle: {article.modele}</div>}
                    </td>
                    <td className="border border-black p-2 text-center text-xs">{formatPrice(prixUnitaire)} DH</td>
                    <td className="border border-black p-2 text-center text-xs">{article.quantite}</td>
                    <td className="border border-black p-2 text-center text-xs font-semibold">{formatPrice(total)} DH</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Totaux */}
          <div className="flex justify-end mb-6">
            <div className="w-80">
              <div className="bg-gray-100 p-4 border border-black">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">Total HT :</span>
                  <span className="font-bold">{formatPrice(totalHT)} DH</span>
                </div>
                {taxMode === "with_tax" && (
                  <div className="flex justify-between mb-2">
                    <span>TVA (20%) :</span>
                    <span>{formatPrice(tva)} DH</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">Total TTC :</span>
                  <span className="font-bold text-lg">{formatPrice(totalTTC)} DH</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Montant en lettres */}
          <div className="mb-6">
            <div className="font-bold mb-2">Montant en lettres :</div>
            <div className="italic">{convertirMontantEnLettres(totalTTC)} dirhams</div>
          </div>
          
          {/* Notes */}
          {devis.notes && (
            <div className="mb-6">
              <div className="font-bold mb-2">Notes :</div>
              <div className="text-sm">{devis.notes}</div>
            </div>
          )}
          </div>
          
          {/* Pied de page */}
          <div className="mt-auto p-6 border-t border-gray-300 bg-gray-50">
            <div className="text-center text-xs text-gray-600">
              <div className="mb-2">
                <strong>{COMPANY_CONFIG.nom}</strong> - {COMPANY_CONFIG.adresse}
              </div>
              <div className="mb-2">
                Tél: {COMPANY_CONFIG.telephone} | Email: contact@gamerstore.ma
              </div>
              <div>
                ICE: {COMPANY_CONFIG.ice} | RC: {COMPANY_CONFIG.rc} | IF: {COMPANY_CONFIG.if}
              </div>
            </div>
          </div>
        </div>
        </>
      </DialogContent>
    </Dialog>
  );
}