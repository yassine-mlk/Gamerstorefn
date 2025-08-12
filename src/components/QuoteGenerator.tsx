import React, { useState, useEffect } from 'react';
import { COMPANY_CONFIG, getCompanyLogo } from '@/lib/companyConfig';
import { supabase } from '@/lib/supabase';
import { convertirMontantEnLettres } from '@/utils/numberToWords';
import { QRCodeGenerator } from '@/lib/qrCodeGenerator';

interface QuoteItem {
  id: string;
  nom_produit: string;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  quantite: number;
  produit_type: string;
  produit_id: string;
  image_url?: string;
  // Propriétés dynamiques du produit
  marque?: string;
  modele?: string;
  processeur?: string;
  carte_graphique?: string;
  ram?: string;
  stockage?: string;
  ecran?: string;
  etat?: string;
  taille_ecran?: string;
  resolution?: string;
  taux_rafraichissement?: string;
  type_peripherique?: string;
  materiau?: string;
  couleur?: string;
  categorie?: string;
}

interface QuoteData {
  numero_devis: string;
  date_devis: string;
  client_nom: string;
  client_email?: string;
  client_type?: 'particulier' | 'societe';
  articles: QuoteItem[];
  tva: number;
  frais_livraison?: number;
  notes?: string;
}

interface QuoteGeneratorProps {
  quote: QuoteData;
  onPreview: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

export function QuoteGenerator({ quote, onPreview, onPrint, onDownload }: QuoteGeneratorProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [articlesWithImages, setArticlesWithImages] = useState<QuoteItem[]>([]);

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
      if (quote.numero_devis) {
        const qrCode = await QRCodeGenerator.generateQuoteQR(quote);
        setQrCodeDataURL(qrCode);
      }
    };
    
    const enrichArticlesWithImages = async () => {
      if (quote.articles && quote.articles.length > 0) {
        const enrichedArticles = await Promise.all(
          quote.articles.map(async (article) => {
            const productData = await getProductData(article.produit_id, article.produit_type);
            return { ...article, ...productData };
          })
        );
        setArticlesWithImages(enrichedArticles);
      }
    };

    generateQR();
    enrichArticlesWithImages();
  }, [quote]);

  const generateQuoteHTML = (): string => {
    const numeroDevis = quote.numero_devis || 'N/A';
    const dateDevis = new Date(quote.date_devis || Date.now()).toLocaleDateString('fr-FR');
    
    const logo = getCompanyLogo();

    // Fonction pour normaliser les URLs d'images Supabase
    const normalizeImageUrl = (url: string): string => {
      if (!url) return '';
      
      // Si c'est déjà une URL complète, la retourner
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // Si c'est un chemin relatif, essayer de construire l'URL Supabase
      return url;
    };
  
    // Détection du mode de taxe basé sur la présence de TVA dans le devis
    const taxMode = (quote.tva && quote.tva > 0) ? "with_tax" : "without_tax";
    
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
    const fraisLivraison = quote.frais_livraison || 0;
    const totalFinal = totalTTC + fraisLivraison;

    // Format des nombres en français
    const formatPrice = (price: number) => price.toFixed(2);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${numeroDevis}</title>
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
        
        .quote-container {
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
        


        .products-table .price {
            text-align: right;
            font-weight: bold;
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
        
        .amount-in-words {
            text-align: center;
            font-weight: bold;
            margin: 30px 0;
            padding: 15px;
            border: 1px solid #ccc;
            background: #f9f9f9;
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
    <div class="quote-container">
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
            
            <div class="facture-title">Devis</div>
            
            <div class="company-name">
                <strong>${COMPANY_CONFIG.nom}</strong>
            </div>
        </div>
        
        <!-- Détails du devis -->
        <div class="invoice-details">
            <div class="invoice-info">
                <div class="detail-label">Devis :</div>
                <div>Numéro : ${numeroDevis}</div>
                <div>Date : ${dateDevis}</div>
            </div>
            
            <div class="client-info">
                <div class="detail-label">Client :</div>
                <div>${quote.client_type === 'societe' ? 'Ste : ' : ''}${quote.client_nom}</div>
                ${quote.client_type === 'societe' ? `<div>ICE : ${(quote as any).client_ice || quote.client_email || '00004974700087'}</div>` : ''}
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
                                     style="width: 120px; height: 90px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px;"
                                     onerror="this.style.display='none';" />
                            ` : `
                                <div style="width: 120px; height: 90px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; border-radius: 4px;">No Image</div>
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
                                <div style="font-size: 10px;">${(article as any).description || article.nom_produit}</div>
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
                    <td class="label total-final">Total TTC :</td>
                    <td class="amount total-final">${formatPrice(totalFinal)}</td>
                </tr>
            </table>
        </div>
        
        <!-- Montant en lettres -->
        <div class="amount-in-words">
            Arrete le present devis a la somme de ${convertirMontantEnLettres(totalFinal)} TTC
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
    const htmlContent = generateQuoteHTML();
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    }
    onPreview();
  };

  const handlePrint = () => {
    const htmlContent = generateQuoteHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
    onPrint();
  };

  const handleDownload = () => {
    const htmlContent = generateQuoteHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devis-${quote.numero_devis || 'nouveau'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onDownload();
  };

  return {
    preview: handlePreview,
    print: handlePrint,
    download: handleDownload,
    generateHTML: generateQuoteHTML
  };
}
