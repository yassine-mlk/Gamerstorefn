import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download, Eye } from "lucide-react";
import { type Vente } from "@/hooks/useVentes";
import { QRCodeGenerator } from "@/lib/qrCodeGenerator";
import { InvoicePreview } from "@/components/InvoicePreview";
import { COMPANY_CONFIG, getCompanyLogo } from "@/lib/companyConfig";
import { supabase } from "@/lib/supabase";

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

  // Fonction pour récupérer l'image d'un produit depuis sa table source
  const getProductImage = async (produit_id: string, produit_type: string): Promise<string | null> => {
    try {
      let tableName: string;
      
      switch (produit_type) {
        case 'pc_portable':
          tableName = 'pc_portables';
          break;
        case 'moniteur':
          tableName = 'moniteurs';
          break;
        case 'peripherique':
          tableName = 'peripheriques';
          break;
        case 'chaise_gaming':
          tableName = 'chaises_gaming';
          break;
        case 'pc_gamer':
          tableName = 'pc_gamer';
          break;
        case 'composant_pc':
          tableName = 'composants_pc';
          break;
        default:
          return null;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('image_url')
        .eq('id', produit_id)
        .single();

      if (error || !data) return null;
      
      return data.image_url || null;
    } catch (err) {
      console.error(`Erreur lors de la récupération de l'image pour ${produit_type} ${produit_id}:`, err);
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
            const image_url = await getProductImage(article.produit_id, article.produit_type);
            return { ...article, image_url };
          })
        );
        setArticlesWithImages(enrichedArticles);
      }
    };
    
    generateQR();
    enrichArticlesWithImages();
  }, [vente]);

      const generateInvoiceHTML = (): string => {
      const numeroFacture = vente.numero_vente || 'N/A';
      const dateFacture = new Date(vente.date_vente || Date.now()).toLocaleDateString('fr-FR');
      
      const logo = getCompanyLogo();

      // Calculs
      const totalHT = vente.total_ht || 0;
      const tva = vente.tva || 0;
      const totalTTC = vente.total_ttc || 0;
      const fraisLivraison = vente.frais_livraison || 0;

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
    
    // Détecter le mode de taxe en comparant les prix des articles
    const detectTaxMode = () => {
      if (!articlesWithImages || articlesWithImages.length === 0) return "with_tax";
      
      // Si les prix unitaires TTC sont égaux aux prix unitaires HT, alors c'est du mode sans taxe
      const firstArticle = articlesWithImages[0];
      const isWithoutTax = Math.abs(firstArticle.prix_unitaire_ttc - firstArticle.prix_unitaire_ht) < 0.01;
      
      return isWithoutTax ? "without_tax" : "with_tax";
    };
    
    const taxMode = detectTaxMode();
    
    // Format des nombres en français
    const formatPrice = (price: number) => price.toFixed(2);
    const formatPriceText = (price: number) => {
      const formatter = new Intl.NumberFormat('fr-FR');
      const parts = formatter.formatToParts(Math.floor(price));
      const integerPart = parts.map(part => part.value).join('');
      const decimal = Math.round((price - Math.floor(price)) * 100);
      return `${integerPart} dirham${price >= 2 ? 's' : ''} et ${decimal} centimes`;
    };

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
        
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: white;
        }
        
        .invoice-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 20px;
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
            width: 80px;
            height: 60px;
            background: #000;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border-radius: 5px;
        }
        
        .logo .gs {
            font-size: 18px;
            letter-spacing: 1px;
        }
        
        .facture-title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
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
            padding: 10px 8px;
            border: 1px solid #000;
            text-align: center;
            vertical-align: middle;
        }
        
        .products-table .product-name {
            text-align: left;
            max-width: 250px;
        }
        
        /* Ligne image produit séparée */
        .product-image-row td {
            padding: 0;
            border: 1px solid #000;
            background: #fafafa;
            vertical-align: middle;
        }
        .product-image-large {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            background: #f9f9f9;
            min-height: 350px;
        }
        .product-image-large img,
        .product-image-large .placeholder {
            max-width: 480px;
            max-height: 300px;
            object-fit: contain;
            border-radius: 12px;
            border: 2px solid #ccc;
            background: #fff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .product-image-large .placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: #999;
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
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            border-top: 1px solid #ccc;
            padding-top: 15px;
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
        <!-- En-tête -->
        <div class="header">
            <div class="logo-section">
                ${logo.type === "image" ? `
                    <img src="${logo.url}" alt="${logo.alt}" style="width: ${logo.width}px; height: ${logo.height}px; object-fit: contain;">
                ` : `
                    <div class="logo">
                        <div class="gs">${logo.text}</div>
                        <div style="font-size: 8px;">${logo.subtext.replace('\n', '<br>')}</div>
                    </div>
                `}
            </div>
            
            <div class="facture-title">Facture</div>
        </div>
        
        <!-- Détails de la facture -->
        <div class="invoice-details">
            <div class="invoice-info">
                <div class="detail-label">Facture :</div>
                <div>Numéro : ${numeroFacture}</div>
                <div>Date : ${dateFacture}</div>
            </div>
            
            <div class="client-info">
                <div class="detail-label">CLIENT :</div>
                <div>${vente.client_type === 'societe' ? 'Ste : ' : ''}${vente.client_nom}</div>
                ${vente.client_type === 'societe' ? `<div>Ice : ${vente.client_email || 'N/A'}</div>` : ''}
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
                ${articlesWithImages.map((article, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="product-name">${article.nom_produit}</td>
                        <td class="price">${formatPrice(taxMode === "without_tax" ? article.prix_unitaire_ht : article.prix_unitaire_ttc)}</td>
                        <td>${article.quantite}</td>
                        <td class="price">${formatPrice(taxMode === "without_tax" ? article.total_ht : article.total_ttc)}</td>
                    </tr>
                    ${article.image_url ? `
                        <tr class="product-image-row">
                            <td colspan="5">
                                <div class="product-image-large">
                                    <img src="${normalizeImageUrl(article.image_url)}" alt="${article.nom_produit}"
                                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                    <div class="placeholder" style="display: none;">📦</div>
                                </div>
                            </td>
                        </tr>
                    ` : ''}
                `).join('')}
            </tbody>
        </table>
        
        <!-- Totaux -->
        <div class="totals-section">
            <table class="totals-table">
                ${taxMode === "with_tax" && tva > 0 ? `
                    <tr>
                        <td class="label">Total HT:</td>
                        <td class="amount">${formatPrice(totalHT)}</td>
                    </tr>
                    <tr>
                        <td class="label">Total TVA (20%):</td>
                        <td class="amount">${formatPrice(tva)}</td>
                    </tr>
                ` : `
                    <tr>
                        <td class="label">Total:</td>
                        <td class="amount">${formatPrice(totalTTC)}</td>
                    </tr>
                `}
                ${fraisLivraison > 0 ? `
                    <tr>
                        <td class="label">Total Livraison:</td>
                        <td class="amount">${formatPrice(fraisLivraison)}</td>
                    </tr>
                ` : ''}
                <tr class="total-final">
                    <td class="label total-final">Prix Total:</td>
                    <td class="amount total-final">${formatPrice(totalTTC)}</td>
                </tr>
            </table>
        </div>
        
        <!-- Montant en lettres -->
        <div class="amount-in-words">
            Arrête le présente facture à la somme de ${formatPriceText(totalTTC)} ${taxMode === "with_tax" ? "ttc" : ""} .
        </div>
        
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

  const handleDownload = () => {
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
          Aperçu
        </Button>
        
        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
        
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Télécharger
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