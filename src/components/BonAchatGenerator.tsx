import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { type Vente } from "@/hooks/useVentes";
import { QRCodeGenerator } from "@/lib/qrCodeGenerator";
import { BonAchatPreview } from "@/components/BonAchatPreview";
import { COMPANY_CONFIG, getCompanyLogo, getCompanyLogoBase64 } from "@/lib/companyConfig";
import { supabase } from "@/lib/supabase";
import { convertirMontantEnLettres } from "@/utils/numberToWords";
import { PDFGenerator } from "@/lib/pdfGenerator";

interface BonAchatGeneratorProps {
  vente: Vente;
  onPreview?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function BonAchatGenerator({ vente, onPreview, onPrint, onDownload }: BonAchatGeneratorProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [articlesWithImages, setArticlesWithImages] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Fonction pour générer le HTML du bon d'achat
  const generateBonAchatHTML = (): string => {
    const numeroVente = vente.numero_vente || 'N/A';
    const dateVente = new Date(vente.date_vente || '').toLocaleDateString('fr-FR');
    const clientNom = vente.client_nom || 'Client';
    const clientEmail = vente.client_email || '';
    const adresseLivraison = vente.adresse_livraison || '';
    const modePaiement = vente.mode_paiement || '';
    const typeVente = vente.type_vente || '';
    const statut = vente.statut || '';
    const notes = vente.notes || '';

    // Détection du mode taxe
    const detectTaxMode = () => {
      if (!vente.articles || vente.articles.length === 0) return 'with_tax';
      const firstArticle = vente.articles[0];
      const isWithoutTax = Math.abs(firstArticle.prix_unitaire_ttc - firstArticle.prix_unitaire_ht) < 0.01;
      return isWithoutTax ? 'without_tax' : 'with_tax';
    };
    
    const taxMode = detectTaxMode();

    const articlesHTML = articlesWithImages.map((article, index) => {
      const imageSrc = article.image_url || '/placeholder.svg';
      
      if (taxMode === 'with_tax') {
        return `
          <tr>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${imageSrc}" alt="${article.nom_produit}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='/placeholder.svg'" />
                <span>${article.nom_produit}</span>
              </div>
            </td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${article.quantite}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${(article.prix_unitaire_ht || 0).toFixed(2)} MAD</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${(article.total_ht || 0).toFixed(2)} MAD</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${(article.total_ttc || 0).toFixed(2)} MAD</td>
          </tr>`;
      } else {
        return `
          <tr>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${imageSrc}" alt="${article.nom_produit}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='/placeholder.svg'" />
                <span>${article.nom_produit}</span>
              </div>
            </td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${article.quantite}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${(article.prix_unitaire_ht || 0).toFixed(2)} MAD</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${(article.total_ht || 0).toFixed(2)} MAD</td>
          </tr>`;
      }
    }).join('');

    const tableHeaders = taxMode === 'with_tax'
      ? '<th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">#</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Désignation</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Qté</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Prix HT</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Total HT</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Total TTC</th>'
      : '<th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">#</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Désignation</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Qté</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Prix</th><th style="padding: 10px; background-color: #22c55e; color: white; border: 1px solid #ddd;">Total</th>';

    // Calculs des totaux
    const totalHT = vente.total_ht || 0;
    const totalTTC = vente.total_ttc || 0;
    const tva = vente.tva || 0;
    const remise = vente.remise || 0;

    let totalsHTML = '';
    if (taxMode === 'with_tax' && tva > 0) {
      totalsHTML = `
        <tr><td style="text-align: right; padding: 8px; font-weight: bold;">Sous-total HT:</td><td style="text-align: right; padding: 8px;">${totalHT.toFixed(2)} MAD</td></tr>
        <tr><td style="text-align: right; padding: 8px; font-weight: bold;">TVA (20%):</td><td style="text-align: right; padding: 8px;">${tva.toFixed(2)} MAD</td></tr>`;
    } else {
      totalsHTML = `<tr><td style="text-align: right; padding: 8px; font-weight: bold;">Total:</td><td style="text-align: right; padding: 8px;">${totalTTC.toFixed(2)} MAD</td></tr>`;
    }
    
    if (remise > 0) {
      totalsHTML += `<tr><td style="text-align: right; padding: 8px; font-weight: bold;">Remise:</td><td style="text-align: right; padding: 8px;">-${remise.toFixed(2)} MAD</td></tr>`;
    }
    
    totalsHTML += `<tr style="background-color: #22c55e; color: white;"><td style="text-align: right; padding: 8px; font-weight: bold;">TOTAL TTC:</td><td style="text-align: right; padding: 8px; font-weight: bold;">${totalTTC.toFixed(2)} MAD</td></tr>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bon d'achat ${numeroVente}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; margin-bottom: 20px; }
          .company-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .invoice-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #22c55e; color: white; }
          .totals { width: 300px; margin-left: auto; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GamerStore</h1>
          <p>Équipement Gaming Professionnel</p>
          <h2 style="text-align: right; margin-top: -40px;">BON D'ACHAT</h2>
          <p style="text-align: right;">N° ${numeroVente}</p>
        </div>
        
        <div class="company-info">
          <div>
            <h3>Émetteur:</h3>
            <p><strong>GamerStore</strong><br>
            123 Rue Gaming, Casablanca<br>
            Tél: +212 6 12 34 56 78<br>
            Email: contact@gamerstore.ma<br>
            ICE: ICE123456789</p>
          </div>
          <div>
            <h3>Client:</h3>
            <p><strong>${clientNom}</strong><br>
            ${clientEmail ? clientEmail + '<br>' : ''}
            ${adresseLivraison ? adresseLivraison : ''}</p>
          </div>
        </div>
        
        <div class="invoice-details">
          <p><strong>Date:</strong> ${dateVente}</p>
          <p><strong>Mode de paiement:</strong> ${modePaiement}</p>
          <p><strong>Type:</strong> ${typeVente}</p>
          <p><strong>Statut:</strong> ${statut}</p>
        </div>
        
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${articlesHTML}
          </tbody>
        </table>
        
        <table class="totals">
          <tbody>
            ${totalsHTML}
          </tbody>
        </table>
        
        ${notes ? `<div><h3>Notes:</h3><p>${notes}</p></div>` : ''}
        
        <div class="footer">
          <p>Merci de votre confiance !</p>
          <p>www.gamerstore.ma | contact@gamerstore.ma</p>
          <p>Ce bon d'achat est généré électroniquement.</p>
        </div>
        
        ${qrCodeDataURL ? `<div style="text-align: center; margin-top: 20px;"><img src="${qrCodeDataURL}" alt="QR Code" style="width: 100px; height: 100px;" /></div>` : ''}
      </body>
      </html>
    `;
  };

  const handlePreview = () => {
    setShowPreview(true);
    onPreview?.();
  };

  const handlePrint = () => {
    const htmlContent = generateBonAchatHTML();
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
      const htmlContent = generateBonAchatHTML();
      const filename = `Bon_achat_${vente.numero_vente}.pdf`;
      
      // Générer le PDF à partir du HTML
      await PDFGenerator.generateInvoiceFromHTML(htmlContent, filename);
      
      onDownload?.();
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      
      // Fallback : télécharger en HTML si le PDF échoue
      try {
        const htmlContent = generateBonAchatHTML();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bon_achat_${vente.numero_vente}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onDownload?.();
      } catch (fallbackError) {
        console.error('Erreur lors du fallback HTML:', fallbackError);
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
          Bon d'achat
        </Button>
      </div>

      <BonAchatPreview
        vente={{ ...vente, articles: articlesWithImages }}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={handlePrint}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </>
  );
}