import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download, Eye, Shield } from "lucide-react";
import { type Vente } from "@/hooks/useVentes";
import { QRCodeGenerator } from "@/lib/qrCodeGenerator";
import { COMPANY_CONFIG, getCompanyLogo } from "@/lib/companyConfig";

interface WarrantyGeneratorProps {
  vente: Vente;
  onPreview?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function WarrantyGenerator({ vente, onPreview, onPrint, onDownload }: WarrantyGeneratorProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      if (vente.numero_vente) {
        const qrCode = await QRCodeGenerator.generateSimpleQR(`GARANTIE-${vente.numero_vente}`);
        setQrCodeDataURL(qrCode);
      }
    };
    generateQR();
  }, [vente]);

  const generateWarrantyHTML = (): string => {
    const numeroFacture = vente.numero_vente || 'N/A';
    const dateVente = new Date(vente.date_vente || Date.now());
    const dateGarantie = new Date(dateVente);
    dateGarantie.setFullYear(dateGarantie.getFullYear() + 1); // Garantie 1 an
    
    const logo = getCompanyLogo();
    
    // Format des nombres
    const formatPrice = (price: number) => price.toFixed(2);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Garantie ${numeroFacture}</title>
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
            font-size: 12px;
            line-height: 1.5;
            color: #000;
            background: white;
        }
        
        .warranty-container {
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
            padding-bottom: 15px;
            border-bottom: 3px solid #000;
        }
        
        .header .logo-section {
            flex: 0 0 auto;
        }
        
        .header .warranty-title {
            flex: 1;
            text-align: center;
            margin-left: -40px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 120px;
            height: 90px;
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
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #000;
        }
        
        .warranty-title {
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            margin: 0 auto;
            color: #ff0000;
            flex: 1;
        }
        
        .warranty-subtitle {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        
        .warranty-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 10px;
            border: 2px solid #000;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .info-section h3 {
            color: #000;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        
        .info-item {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #333;
            display: inline-block;
            min-width: 120px;
        }
        
        .products-section {
            margin-bottom: 25px;
        }
        
        .products-title {
            background: #000;
            color: white;
            padding: 12px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 0;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
        }
        
        .products-table th {
            background: #f8f9fa;
            color: #333;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
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
            font-weight: 500;
        }
        
        .warranty-terms {
            background: #ffe6e6;
            border: 2px solid #000;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
        }
        
        .warranty-terms h3 {
            color: #000;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .warranty-terms ul {
            list-style-type: none;
            padding: 0;
        }
        
        .warranty-terms li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .warranty-terms li:before {
            content: "✓";
            color: #000;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        .qr-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .qr-code {
            width: 100px;
            height: 100px;
            border: 2px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .validity-info {
            text-align: center;
            flex: 1;
            margin: 0 20px;
        }
        
        .validity-date {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            border-top: 2px solid #000;
            padding-top: 15px;
            color: #666;
        }
        
        .stamp-section {
            margin-top: 60px;
            text-align: center;
            padding: 40px;
            border: 2px dashed #ccc;
            border-radius: 10px;
            background: #f9f9f9;
        }
        
        .stamp-placeholder {
            font-size: 18px;
            font-weight: bold;
            color: #666;
            margin-bottom: 10px;
        }
        
        .stamp-subtitle {
            font-size: 12px;
            color: #999;
        }
        
        .footer-info {
            margin-bottom: 5px;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
        }
        
        .signature-box {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-bottom: 2px solid #333;
            margin-bottom: 10px;
            height: 60px;
        }
        
        @media print {
            .no-print {
                display: none !important;
            }
            
            .warranty-container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="warranty-container">
        <!-- En-tête -->
        <div class="header">
            <div class="logo-section">
                ${logo.type === "image" ? `
                    <img src="${logo.url}" alt="${logo.alt}" style="width: 120px; height: 90px; object-fit: contain;">
                ` : `
                    <div class="logo">
                        <div class="gs">${logo.text}</div>
                        <div style="font-size: 8px;">${logo.subtext.replace('\n', '<br>')}</div>
                    </div>
                `}
            </div>
            
            <div class="warranty-title">CERTIFICAT DE GARANTIE</div>
        </div>
        
        <!-- Informations de garantie -->
        <div class="warranty-info">
            <div class="info-grid">
                <div class="info-section">
                    <h3>INFORMATIONS ACHAT</h3>
                    <div class="info-item">
                        <span class="info-label">N° Facture :</span>
                        <span>${numeroFacture}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date d'achat :</span>
                        <span>${dateVente.toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Client :</span>
                        <span>${vente.client_nom}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Montant :</span>
                        <span>${formatPrice(vente.total_ttc)} MAD</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>DURÉE DE GARANTIE</h3>
                    <div class="info-item">
                        <span class="info-label">N° Série :</span>
                        <span>${vente.articles?.[0]?.code_barre || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Durée :</span>
                        <span>12 mois</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Début garantie :</span>
                        <span>${dateVente.toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fin garantie :</span>
                        <span>${dateGarantie.toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Produits couverts -->
        <div class="products-section">
            <div class="products-title">PRODUITS COUVERTS PAR LA GARANTIE</div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Désignation</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Statut garantie</th>
                    </tr>
                </thead>
                <tbody>
                    ${vente.articles?.map(article => `
                        <tr>
                            <td class="product-name">${article.nom_produit}</td>
                            <td>${article.quantite}</td>
                            <td>${formatPrice(article.prix_unitaire_ttc)} MAD</td>
                            <td style="color: #28a745; font-weight: bold;">✓ ACTIVE</td>
                        </tr>
                    `).join('') || ''}
                </tbody>
            </table>
        </div>
        
        <!-- QR Code et validité -->
        <div class="qr-section">
            <div class="qr-code">
                ${qrCodeDataURL ? `
                    <img src="${qrCodeDataURL}" alt="QR Code Garantie" style="width: 96px; height: 96px;">
                ` : `
                    <div style="text-align: center; font-size: 10px;">
                        QR<br>GARANTIE
                    </div>
                `}
            </div>
            
            <div class="validity-info">
                <div class="validity-date">Valide jusqu'au ${dateGarantie.toLocaleDateString('fr-FR')}</div>
                <div>Scannez le QR code pour vérifier la validité</div>
            </div>
            
            <div style="text-align: center;">
                <div style="font-weight: bold; color: #000;">N° GARANTIE</div>
                <div style="font-size: 14px; font-weight: bold;">GAR-${numeroFacture}</div>
            </div>
        </div>
        
        <!-- Conditions de garantie -->
        <div class="warranty-terms">
            <h3>CONDITIONS DE GARANTIE</h3>
            <ul>
                <li>Gamer store vous garantit que votre ordinateur portable est exempt de tout défaut matériel ou de main-d'œuvre, sous une utilisation normale, durant la Période de Garantie Limitée indiquée. La Période de Garantie d'achat. En cas de besoin de réparation survenant durant la Période de Garantie Limitée, vous pourrez prétendre à notre Page Facebook Gamer store ou nous consulter sur WhatsApp, le prestataire de services autorisé par Game store pourra vous demander cette preuve d'achat en échange du service de garantie.</li>
                <li>Gamer store garantit que ce produit fonctionnera sans erreur ni interruption. Pour le produit soumis à garantie, tout support technique ou autre, tel qu'une assistance par téléphone concernant les réglages du produit, sera fournie sans garantie d'aucune sorte. La Garantie Limitée ne couvre que les pannes ou les défaillances se produisant pendant la période indiquée et sous des conditions d'utilisation normales, aussi bien que tous les défauts matériels et de main d'œuvre. Toutefois, la Garantie Limitée ne pourra pas s'appliquer si:</li>
                <li>Le produit a été examiné, démonté, réparé et/ou modifié par du personnel non autorisé;</li>
                <li>Le numéro de série a été altéré, annulé, enlevé ou effacé;</li>
                <li>Les sceaux de garantie ont été brisés, enlevés ou altérés ;</li>
                <li>Des dégâts ont été causés par une panne électrique externe; en cas d'accident, de catastrophe naturelle, d'une utilisation incorrecte intentionnelle ou accidentelle du produit, en cas d'abus, de négligence ou d'une maintenance inappropriée ou enfin d'une utilisation dans des conditions anormales</li>
                <li>Des dégâts ont été causés par une mauvaise installation ou une mauvaise connexion avec une périphérique externe (moniteur, clavier, etc.);</li>
                <li>Des dégâts ont été causés par un accident ou une anomalie électrique externe;</li>
                <li>Des dégâts ont été causés par une utilisation en dehors des paramètres d'opération, de stockage, d'entretien ou d'environnement établis par le manuel de l'utilisateur;</li>
                <li>Des dégâts ont été causés par l'utilisation de composants non fabriqués ou vendus par Gamer Store;</li>
                <li>Des dégâts ont été causés par des logiciels tiers ou des virus informatiques;</li>
            </ul>
        </div>
        
        <!-- Espace pour cachet du magasin -->
        <div class="stamp-section">
            <div class="stamp-placeholder">CACHET DU MAGASIN</div>
            <div class="stamp-subtitle">GAMER STORE SARL</div>
        </div>
        
        <!-- Pied de page -->
        <div class="footer">
            <div class="footer-info"><strong>Contact SAV :</strong> ${COMPANY_CONFIG.telephone}</div>
            <div class="footer-info"><strong>Adresse :</strong> ${COMPANY_CONFIG.adresse}</div>
            <div class="footer-info">RC: ${COMPANY_CONFIG.rc} / IF: ${COMPANY_CONFIG.if} / ICE: ${COMPANY_CONFIG.ice}</div>
            <div style="margin-top: 10px; font-style: italic;">
                Conservez précieusement ce certificat de garantie avec votre facture d'achat
            </div>
        </div>
    </div>
</body>
</html>
    `;
  };

  const handlePreview = () => {
    const htmlContent = generateWarrantyHTML();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
    onPreview?.();
  };

  const handlePrint = () => {
    const htmlContent = generateWarrantyHTML();
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
    const htmlContent = generateWarrantyHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Garantie_${vente.numero_vente}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handlePreview}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
      >
        <Shield className="w-4 h-4" />
        Aperçu Garantie
      </Button>
      
      <Button
        onClick={handlePrint}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
      >
        <Printer className="w-4 h-4" />
        Imprimer
      </Button>
      
      <Button
        onClick={handleDownload}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
      >
        <Download className="w-4 h-4" />
        Télécharger
      </Button>
    </div>
  );
} 