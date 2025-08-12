import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { type Vente } from "@/hooks/useVentes";
import { QRCodeGenerator } from "@/lib/qrCodeGenerator";
import { InvoicePreview } from "@/components/InvoicePreview";
import { COMPANY_CONFIG, getCompanyLogo, getCompanyLogoBase64 } from "@/lib/companyConfig";
import { supabase } from "@/lib/supabase";
import { convertirMontantEnLettres } from "@/utils/numberToWords";
import { PDFGenerator } from "@/lib/pdfGenerator";

interface InvoiceGeneratorProps {
  vente: Vente;
  onPreview?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function InvoiceGenerator({ vente, onPreview, onPrint, onDownload }: InvoiceGeneratorProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
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

      // Fonction pour générer le HTML avec logo base64 (pour téléchargement)
      const generateInvoiceHTMLWithBase64Logo = async (): Promise<string> => {
        const numeroFacture = vente.numero_vente || 'N/A';
        const dateFacture = new Date(vente.date_vente || Date.now()).toLocaleDateString('fr-FR');
        
        const logo = await getCompanyLogoBase64();
        
        return generateHTMLContent(numeroFacture, dateFacture, logo);
      };

      // Fonction pour générer le HTML normal (pour aperçu/impression)
      const generateInvoiceHTML = (): string => {
        const numeroFacture = vente.numero_vente || 'N/A';
        const dateFacture = new Date(vente.date_vente || Date.now()).toLocaleDateString('fr-FR');
        
        const logo = getCompanyLogo();
        
        return generateHTMLContent(numeroFacture, dateFacture, logo);
      };

      // Fonction commune pour générer le contenu HTML
      const generateHTMLContent = (numeroFacture: string, dateFacture: string, logo: any): string => {



      // Fonction pour normaliser les URLs d'images Supabase
      const normalizeImageUrl = (url: string): string => {
        if (!url) return '';
        
        // Si c'est déjà une URL complète, la retourner
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        
        // Si c'est un chemin relatif, essayer de construire l'URL Supabase
        // Cette logique peut être adaptée selon votre configuration Supabase
        return url;
      };
    
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

    // Format des nombres en français
    const formatPrice = (price: number) => price.toFixed(2);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${numeroFacture}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: white;
        }
        
        .invoice-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 0;
        }
        
        .invoice-content {
            flex: 1;
            padding: 20px;
            padding-bottom: 0;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
            position: relative;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 160px;
            height: 120px;
            background: #000;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border-radius: 10px;
        }
        
        .logo .gs {
            font-size: 36px;
            letter-spacing: 2px;
        }
        
        .facture-title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            text-align: right;
            text-decoration: underline;
        }
        
        .invoice-details {
            background: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }
        
        .invoice-info {
            flex: 1;
        }
        
        .client-info {
            flex: 1;
            margin-left: 40px;
        }
        
        .qr-section {
            width: 80px;
            height: 80px;
            border: 2px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            margin-left: 20px;
        }
        
        .detail-label {
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid #000;
        }
        
        .products-table th {
            background: #000;
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            border: 1px solid #000;
        }
        
        .products-table td {
            padding: 8px 6px;
            border: 1px solid #000;
            text-align: center;
            vertical-align: middle;
        }
        
        .products-table .product-name {
            text-align: left;
            max-width: 250px;
        }
        
        /* Spécifications produit */
        .product-specs {
            font-size: 10px;
            line-height: 1.3;
            text-align: left;
        }
        
        .product-detail {
            font-size: 10px;
            line-height: 1.3;
            text-align: left;
            color: #333;
        }

        .products-table .price {
            text-align: right;
            font-weight: bold;
        }
        
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        
        .totals-table {
            border-collapse: collapse;
        }
        
        .totals-table td {
            padding: 8px 15px;
            border: 1px solid #000;
            font-weight: bold;
        }
        
        .totals-table .label {
            text-align: right;
            background: #f5f5f5;
            min-width: 150px;
        }
        
        .totals-table .amount {
            text-align: right;
            min-width: 100px;
        }
        
        .total-final {
            background: #000 !important;
            color: white !important;
        }
        
        .amount-in-words {
            text-align: center;
            font-weight: bold;
            margin: 30px 0;
            padding: 15px;
            border: 1px solid #ccc;
            background: #f9f9f9;
            margin-bottom: auto;
        }
        
        .footer {
            margin-top: auto;
            text-align: center;
            font-size: 10px;
            border-top: 1px solid #ccc;
            padding: 15px 20px;
            background: white;
        }
        
        .footer-info {
            margin-bottom: 5px;
        }
        
        @media print {
            .no-print {
                display: none !important;
            }
            
            .invoice-container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-content">
        <!-- En-tête -->
        <div class="header">
            <div class="logo-section">
                ${logo.type === "image" ? `
                    <img src="${logo.url}" alt="${logo.alt}" style="width: ${logo.width * 2}px; height: ${logo.height * 2}px; object-fit: contain;">
                ` : `
                    <div class="logo">
                        <div class="gs">${logo.text}</div>
                        <div style="font-size: 16px;">${logo.subtext.replace('\n', '<br>')}</div>
                    </div>
                `}
            </div>
            
            <div class="facture-title">Facture</div>
            
            <div class="company-name">
                <strong>${COMPANY_CONFIG.nom}</strong>
            </div>
        </div>
        
        <!-- Détails de la facture -->
        <div class="invoice-details">
            <div class="invoice-info">
                <div class="detail-label">Facture :</div>
                <div>Numéro : ${numeroFacture}</div>
                <div>Date : ${dateFacture}</div>
            </div>
            
            <div class="client-info">
                <div class="detail-label">Client :</div>
                <div>${vente.client_type === 'societe' ? 'Ste : ' : ''}${vente.client_nom}</div>
                ${vente.client_type === 'societe' ? `<div>ICE : ${vente.client_ice || vente.client_email || '00004974700087'}</div>` : ''}
            </div>
            
            <div class="qr-section">
                ${qrCodeDataURL ? `
                    <img src="${qrCodeDataURL}" alt="QR Code" style="width: 80px; height: 80px; border: 2px solid #000;">
                ` : `
                    <div style="text-align: center;">
                        QR<br>CODE
                    </div>
                `}
            </div>
        </div>
        
        <!-- Tableau des produits -->
        <table class="products-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>NOM DU PRODUIT</th>
                    <th>PRIX</th>
                    <th>QTÉ</th>
                    <th>TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${articlesWithImages.map((article, index) => {
                    // Créer les spécifications détaillées avec les vraies données
                    const specifications = [];
                    
                    // Marque et modèle (toujours présents)
                    if (article.marque) specifications.push(`• Brand: ${article.marque}`);
                    if (article.modele) specifications.push(`• Model: ${article.modele}`);
                    
                    // Spécifications selon le type de produit
                    if (article.produit_type === 'pc_portable') {
                        if (article.processeur) specifications.push(`• Processor Type: ${article.processeur}`);
                        if (article.carte_graphique) specifications.push(`• Graphics Chipset: ${article.carte_graphique}`);
                        if (article.ram) specifications.push(`• RAM: ${article.ram}`);
                        if (article.stockage) specifications.push(`• Storage: ${article.stockage}`);
                        if (article.ecran) specifications.push(`• Display: ${article.ecran}`);
                        if (article.etat) specifications.push(`• Condition: ${article.etat}`);
                        specifications.push(`• Bonus: Free RGB Mouse`); // Toujours offerte avec PC portable
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
                    
                    const specificationsText = specifications.join('<br>');
                    
                    return `
                        <tr>
                            <td rowspan="2" style="vertical-align: top; padding: 5px; text-align: left;">
                                ${article.image_url ? `
                                <img src="${normalizeImageUrl(article.image_url)}" alt="${article.nom_produit}"
                                     style="width: 100%; height: 90px; object-fit: cover; border: 1px solid #ccc; border-radius: 4px;"
                                     onerror="this.style.display='none';" />
                            ` : `
                                <div style="width: 100%; height: 90px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; border-radius: 4px;">No Image</div>
                            `}
                            </td>
                            <td class="product-name" style="vertical-align: top;">
                                <div style="font-weight: bold; margin-bottom: 5px;">Specification</div>
                                <div style="font-size: 10px;">${specificationsText}</div>
                            </td>
                            <td class="price" style="vertical-align: top; padding-top: 20px;">${formatPrice(article.prix_unitaire_ht || article.prix_unitaire_ttc)}</td>
                            <td style="vertical-align: top; padding-top: 20px;">${article.quantite}</td>
                            <td class="price" style="vertical-align: top; padding-top: 20px;">${formatPrice((article.prix_unitaire_ht || article.prix_unitaire_ttc) * article.quantite)}</td>
                        </tr>
                        <tr>
                            <td style="border-top: none; padding-top: 0;">
                                <div style="font-weight: bold; margin-bottom: 5px;">Detail</div>
                                <div style="font-size: 10px;">${article.description || article.nom_produit}</div>
                            </td>
                            <td style="border-top: none;"></td>
                            <td style="border-top: none;"></td>
                            <td style="border-top: none;"></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        
        <!-- Totaux -->
        <div class="totals-section">
            <table class="totals-table">
                ${taxMode === "with_tax" && tva > 0 ? `
                    <tr>
                        <td class="label">Total HT :</td>
                        <td class="amount">${formatPrice(totalHT)}</td>
                    </tr>
                    <tr>
                        <td class="label">Tva 20% :</td>
                        <td class="amount">${formatPrice(tva)}</td>
                    </tr>
                ` : ''}
                ${fraisLivraison > 0 ? `
                    <tr>
                        <td class="label">Total Livraison:</td>
                        <td class="amount">${formatPrice(fraisLivraison)}</td>
                    </tr>
                ` : ''}
                <tr class="total-final">
                    <td class="label total-final">${taxMode === "with_tax" && tva > 0 ? 'Total TTC :' : 'Total HT :'}</td>
                    <td class="amount total-final">${formatPrice(totalFinal)}</td>
                </tr>
            </table>
        </div>
        
        <!-- Montant en lettres -->
        <div class="amount-in-words">
            Arrete le presente facture a la somme de ${convertirMontantEnLettres(totalFinal)} ${taxMode === "with_tax" && tva > 0 ? 'TTC' : 'HT'}
        </div>
        
        </div> <!-- Fin du contenu principal -->
        
        <!-- Pied de page -->
        <div class="footer">
            <div class="footer-info">Télé: ${COMPANY_CONFIG.telephone}</div>
            <div class="footer-info">Adresse: ${COMPANY_CONFIG.adresse}</div>
            <div class="footer-info">RC: ${COMPANY_CONFIG.rc} / IF: ${COMPANY_CONFIG.if} / ICE: ${COMPANY_CONFIG.ice}</div>
        </div>
    </div>
</body>
</html>
    `;
      };

  const handlePreview = () => {
    setShowPreview(true);
    onPreview?.();
  };

  const handlePrint = () => {
    const htmlContent = generateInvoiceHTML();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.onload = () => {
        newWindow.print();
        newWindow.close();
      };
    }
    onPrint?.();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Générer le HTML avec logo base64 pour le PDF
      const htmlContent = await generateInvoiceHTMLWithBase64Logo();
      const filename = `Facture_${vente.numero_vente}.pdf`;
      
      // Générer le PDF à partir du HTML
      await PDFGenerator.generateInvoiceFromHTML(htmlContent, filename);
      
      onDownload?.();
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      
      // Fallback : télécharger en HTML si le PDF échoue
      try {
        const htmlContent = await generateInvoiceHTMLWithBase64Logo();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${vente.numero_vente}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onDownload?.();
      } catch (fallbackError) {
        console.error('Erreur lors du fallback HTML:', fallbackError);
        // Dernier fallback : version normale
        const htmlContent = generateInvoiceHTML();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${vente.numero_vente}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onDownload?.();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={handlePreview}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Facture
        </Button>
      </div>

      <InvoicePreview
        vente={{ ...vente, articles: articlesWithImages }}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />
    </>
  );
} 