import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { type Vente } from '@/hooks/useVentes';
import { COMPANY_CONFIG, getCompanyLogoBase64, convertImageToBase64 } from '@/lib/companyConfig';
import { convertirMontantEnLettres } from '@/utils/numberToWords';
import { QRCodeGenerator } from '@/lib/qrCodeGenerator';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export class PDFGenerator {
  private static getCompanyInfo() {
    return {
      nom: 'GamerStore',
      adresse: '123 Rue Gaming, Casablanca',
      telephone: '+212 6 12 34 56 78',
      email: 'contact@gamerstore.ma',
      website: 'www.gamerstore.ma',
      ice: 'ICE123456789'
    };
  }

  // Fonction pour convertir une image URL en base64
  private static async convertImageToBase64(imageUrl: string): Promise<string | null> {
    try {
      // Construire l'URL complète si c'est un chemin relatif
      const fullUrl = imageUrl.startsWith('/') ? window.location.origin + imageUrl : imageUrl;
      console.log('Tentative de récupération de l\'image:', fullUrl);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      console.log('Blob récupéré:', blob.size, 'bytes, type:', blob.type);
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Créer un canvas pour convertir l'image avec un fond blanc
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            if (ctx) {
              // Définir un fond blanc opaque pour éviter le fond noir
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Dessiner l'image par-dessus avec une composition qui préserve la transparence
              ctx.globalCompositeOperation = 'source-over';
              ctx.drawImage(img, 0, 0);
              
              // Convertir en base64 avec le format JPEG pour éviter les problèmes de transparence
              const base64 = canvas.toDataURL('image/jpeg', 0.95);
              console.log('Base64 généré avec canvas, longueur:', base64.length);
              resolve(base64);
            } else {
              console.error('Impossible d\'obtenir le contexte canvas');
              resolve(null);
            }
          };
          
          img.onerror = () => {
            console.error('Erreur lors du chargement de l\'image dans le canvas');
            resolve(null);
          };
          
          img.src = reader.result as string;
        };
        
        reader.onerror = () => {
          console.error('Erreur lors de la lecture du blob');
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erreur lors de la conversion de l\'image:', error);
      return null;
    }
  }

  static generateInvoice(vente: Vente): void {
    const doc = new jsPDF();
    const company = this.getCompanyInfo();
    
    // Configuration des couleurs
    const primaryColor = [34, 197, 94]; // Gaming green
    const secondaryColor = [168, 85, 247]; // Gaming purple
    const darkColor = [17, 24, 39]; // Dark gray
    
    // En-tête
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo et nom de l'entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(company.nom, 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Équipement Gaming Professionnel', 20, 32);
    
    // Titre Facture
    doc.setTextColor(...darkColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 160, 25);
    
    // Informations de la facture
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${vente.numero_vente}`, 160, 32);
    
    // Informations de l'entreprise
    doc.setFontSize(9);
    let yPos = 55;
    doc.text('Émetteur:', 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(company.nom, 20, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(company.adresse, 20, yPos + 10);
    doc.text(`Tél: ${company.telephone}`, 20, yPos + 15);
    doc.text(`Email: ${company.email}`, 20, yPos + 20);
    doc.text(`ICE: ${company.ice}`, 20, yPos + 25);
    
    // Informations du client
    doc.text('Facturé à:', 120, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(vente.client_nom, 120, yPos + 5);
    doc.setFont('helvetica', 'normal');
    if (vente.client_email) {
      doc.text(vente.client_email, 120, yPos + 10);
    }
    if (vente.adresse_livraison) {
      const adresseLines = doc.splitTextToSize(vente.adresse_livraison, 70);
      doc.text(adresseLines, 120, yPos + 15);
    }
    
    // Informations de la vente
    yPos += 40;
    doc.text(`Date: ${new Date(vente.date_vente || '').toLocaleDateString('fr-FR')}`, 20, yPos);
    doc.text(`Mode de paiement: ${vente.mode_paiement.charAt(0).toUpperCase() + vente.mode_paiement.slice(1)}`, 120, yPos);
    doc.text(`Type: ${this.formatTypeVente(vente.type_vente)}`, 20, yPos + 5);
    doc.text(`Statut: ${this.formatStatut(vente.statut)}`, 120, yPos + 5);
    
    // Tableau des articles
    yPos += 20;
    
    // Détecter le mode de taxe
    const detectTaxMode = () => {
      if (!vente.articles || vente.articles.length === 0) return "with_tax";
      
      const firstArticle = vente.articles[0];
      const isWithoutTax = Math.abs(firstArticle.prix_unitaire_ttc - firstArticle.prix_unitaire_ht) < 0.01;
      
      return isWithoutTax ? "without_tax" : "with_tax";
    };
    
    const taxMode = detectTaxMode();
    
    const tableColumns = taxMode === "with_tax" 
      ? ['Image', 'Désignation', 'Qté', 'Prix unitaire HT', 'Total HT', 'Total TTC']
      : ['Image', 'Désignation', 'Qté', 'Prix unitaire', 'Total'];
      
    const tableRows = vente.articles?.map(article => {
      const imagePlaceholder = article.image_url ? "📷" : "📦";
      
      if (taxMode === "with_tax") {
        return [
          imagePlaceholder,
          article.nom_produit,
          article.quantite.toString(),
          `${article.prix_unitaire_ht.toFixed(2)} MAD`,
          `${article.total_ht.toFixed(2)} MAD`,
          `${article.total_ttc.toFixed(2)} MAD`
        ];
      } else {
        return [
          imagePlaceholder,
          article.nom_produit,
          article.quantite.toString(),
          `${article.prix_unitaire_ht.toFixed(2)} MAD`,
          `${article.total_ht.toFixed(2)} MAD`
        ];
      }
    }) || [];
    
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: yPos,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: darkColor
      },
      alternateRowStyles: { 
        fillColor: [249, 250, 251] 
      },
      columnStyles: taxMode === "without_tax" ? {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 65, halign: 'left' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      } : {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 85, halign: 'left' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 40, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' },
        5: { cellWidth: 40, halign: 'right' }
      }
    });

    // Après le tableau, afficher les images en grand, une par article si dispo
    let imageY = (doc as any).lastAutoTable.finalY + 10;
    if (vente.articles && vente.articles.length > 0) {
      for (const article of vente.articles) {
        if (article.image_url) {
          // jsPDF n'intègre pas directement des images distantes; il faut les charger en dataURL
          // Ici, on affiche un placeholder caméra pour indiquer présence d'image
          doc.setFontSize(10);
          doc.text(`Image: ${article.nom_produit}`, 20, imageY);
          doc.text('📷', 180, imageY, { align: 'right' });
          imageY += 8;
        }
      }
    }
    
    // Récupérer la position Y après le tableau
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Totaux
    const totalsData = taxMode === "with_tax" && vente.tva > 0 ? [
      ['Sous-total HT', `${vente.total_ht.toFixed(2)} MAD`],
      ['TVA (20%)', `${vente.tva.toFixed(2)} MAD`]
    ] : [
      ['Total', `${vente.total_ttc.toFixed(2)} MAD`]
    ];
    
    if (vente.remise > 0) {
      totalsData.push(['Remise', `-${vente.remise.toFixed(2)} MAD`]);
    }
    
    if (vente.frais_livraison && vente.frais_livraison > 0) {
      totalsData.push(['Frais de livraison', `${vente.frais_livraison.toFixed(2)} MAD`]);
    }
    
    totalsData.push(['TOTAL TTC', `${vente.total_ttc.toFixed(2)} MAD`]);
    
    doc.autoTable({
      body: totalsData,
      startY: finalY,
      theme: 'plain',
      margin: { left: 120 },
      bodyStyles: { 
        fontSize: 10,
        textColor: darkColor
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function (data) {
        if (data.row.index === totalsData.length - 1) {
          data.cell.styles.fillColor = primaryColor;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 12;
        }
      }
    });
    
    // Pied de page
    const finalYFooter = (doc as any).lastAutoTable.finalY + 20;
    
    if (vente.notes) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 20, finalYFooter);
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(vente.notes, 170);
      doc.text(notesLines, 20, finalYFooter + 5);
    }
    
    // Informations légales
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Merci de votre confiance !', 20, pageHeight - 30);
    doc.text(`${company.website} | ${company.email}`, 20, pageHeight - 25);
    doc.text('Cette facture est générée électroniquement.', 20, pageHeight - 20);
    
    // Sauvegarde
    doc.save(`Facture_${vente.numero_vente}.pdf`);
  }

  // Nouvelle méthode pour générer un PDF à partir du HTML (identique à l'aperçu)
  static async generateInvoiceFromHTML(htmlContent: string, filename: string = 'facture.pdf'): Promise<void> {
    try {
      // Créer un élément temporaire pour le HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // Format A4
      tempDiv.style.background = 'white';
      document.body.appendChild(tempDiv);

      // Convertir en canvas avec options optimisées pour la vitesse
      const canvas = await html2canvas(tempDiv, {
        scale: 1.5, // Résolution réduite pour plus de vitesse
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // 210mm à 96 DPI
        height: 1123, // 297mm à 96 DPI (A4)
        scrollX: 0,
        scrollY: 0,
        logging: false, // Désactiver les logs pour plus de vitesse
        imageTimeout: 5000, // Timeout plus court pour les images
        removeContainer: true // Optimisation
      });

      // Supprimer l'élément temporaire
      document.body.removeChild(tempDiv);

      // Créer le PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculer les dimensions pour s'adapter au PDF
      const imgWidth = 210; // Largeur A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Ajouter l'image au PDF avec compression optimisée
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // Légère compression pour plus de vitesse
      doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

      // Télécharger le PDF
      doc.save(filename);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }

  // Méthode pour générer un PDF de devis à partir du HTML
  static async generateQuoteFromHTML(htmlContent: string, filename: string = 'devis.pdf'): Promise<void> {
    try {
      // Utiliser la même logique que pour les factures
      await this.generateInvoiceFromHTML(htmlContent, filename);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF de devis:', error);
      throw error;
    }
  }

  // Fonction pour formater les montants avec séparateurs de milliers
  private static formatAmount(amount: number): string {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  // Nouvelle méthode pour générer un PDF natif identique à l'HTML avec vraies images
  static async generateNativeInvoicePDF(vente: Vente, articlesWithImages: any[]): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Variables de base (dimensions A4 en mm)
    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    let currentY = marginTop;
    
    console.log(`Page: ${pageWidth}mm, Marges: ${marginLeft}+${marginRight}mm, Largeur disponible: ${pageWidth - marginLeft - marginRight}mm`);

    // === EN-TÊTE ===
    
    // Logo réel - dimensions comme dans l'aperçu HTML
    try {
      console.log('Chargement du logo pour PDF...');
      
      // Utiliser la fonction convertImageToBase64 de companyConfig qui gère mieux le fond blanc
      const logoBase64 = await convertImageToBase64('/logo-gamer-store.jpg');
      
      console.log('Logo base64 obtenu:', logoBase64 ? `Longueur: ${logoBase64.length}` : 'null');
      
      if (logoBase64 && logoBase64.length > 100) {
        console.log('Ajout du logo image au PDF...');
        
        // Utiliser les dimensions de l'aperçu HTML avec object-fit: contain
        // Configuration COMPANY_CONFIG : width: 80, height: 60 → Aperçu: 160x120px → PDF: 42mm x 32mm
        // Mais ajuster pour préserver les proportions comme object-fit: contain
        const targetWidth = (COMPANY_CONFIG.logo.width * 2) * 0.265; // Conversion px vers mm
        const targetHeight = (COMPANY_CONFIG.logo.height * 2) * 0.265;
        
        // Pour préserver les proportions comme object-fit: contain, utiliser des dimensions plus petites
        // Le logo original a probablement des proportions différentes de 4:3
        // Utiliser des dimensions qui s'adaptent mieux au conteneur
        const logoWidth = targetWidth * 0.8; // Réduire légèrement pour éviter la déformation
        const logoHeight = targetHeight * 0.8;
        
        const imageFormat = 'JPEG'; // Forcer JPEG pour éviter les problèmes de transparence
        console.log('Format d\'image détecté:', imageFormat);
        console.log('Dimensions du logo:', logoWidth, 'x', logoHeight, 'mm');
        
        // Centrer le logo dans son espace (comme object-fit: contain)
        const logoX = marginLeft + (targetWidth - logoWidth) / 2;
        const logoY = currentY + (targetHeight - logoHeight) / 2;
        
        doc.addImage(logoBase64, imageFormat, logoX, logoY, logoWidth, logoHeight);
        console.log('Logo ajouté avec succès au PDF');
      } else {
        console.log('Logo base64 invalide, utilisation du fallback');
        throw new Error(`Logo base64 invalide ou trop court: ${logoBase64 ? logoBase64.length : 'null'}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du logo:', error);
      console.log('Utilisation du logo fallback');
      // Fallback au logo textuel - dimensions réduites
      doc.setFillColor(0, 0, 0);
      doc.rect(marginLeft, currentY, 42, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('GS', marginLeft + 21, currentY + 14, { align: 'center' });
      doc.setFontSize(7);
      doc.text('GAMER', marginLeft + 21, currentY + 20, { align: 'center' });
      doc.text('STORE', marginLeft + 21, currentY + 25, { align: 'center' });
    }

    // Titre "Facture" au centre - taille réduite comme dans l'aperçu
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20); // Réduit de 28 à 20 (équivalent text-2xl)
    doc.setFont('helvetica', 'bold');
    doc.text('Facture', pageWidth / 2, currentY + 18, { align: 'center' });

    // "GAMER STORE SARL" à droite - avec soulignement et taille réduite
    doc.setFontSize(12); // Réduit de 16 à 12
    doc.setFont('helvetica', 'bold');
    const rightX = pageWidth - marginRight;
    doc.text(COMPANY_CONFIG.nom, rightX, currentY + 15, { align: 'right' });
    
    // Ajouter le soulignement sous GAMER STORE SARL
    const textWidth = doc.getTextWidth(COMPANY_CONFIG.nom);
    doc.setLineWidth(0.5);
    doc.line(rightX - textWidth, currentY + 16, rightX, currentY + 16);

    // Ligne de séparation
    currentY += 35;
    doc.setLineWidth(2);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    currentY += 10;

    // === DÉTAILS FACTURE ET CLIENT ===
    
    // Fond gris pour les détails
    doc.setFillColor(245, 245, 245);
    doc.rect(marginLeft, currentY, pageWidth - marginLeft - marginRight, 25, 'F');
    
    // Informations facture
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Facture :', marginLeft + 5, currentY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Numéro : ${vente.numero_vente}`, marginLeft + 5, currentY + 13);
    doc.text(`Date : ${new Date(vente.date_vente || Date.now()).toLocaleDateString('fr-FR')}`, marginLeft + 5, currentY + 18);

    // Informations client
    doc.setFont('helvetica', 'bold');
    doc.text('Client :', marginLeft + 80, currentY + 8);
    doc.setFont('helvetica', 'normal');
    const clientText = vente.client_type === 'societe' ? `Ste : ${vente.client_nom}` : vente.client_nom;
    doc.text(clientText, marginLeft + 80, currentY + 13);
    if (vente.client_type === 'societe') {
      doc.text(`ICE : ${(vente as any).client_ice || vente.client_email || '00004974700087'}`, marginLeft + 80, currentY + 18);
    }

    // QR Code réel
    try {
      const qrCodeBase64 = await QRCodeGenerator.generateInvoiceQR(vente);
      if (qrCodeBase64) {
        doc.addImage(qrCodeBase64, 'PNG', pageWidth - marginRight - 20, currentY + 2.5, 15, 15);
      } else {
        // Fallback si le QR code ne génère pas
        doc.setFillColor(255, 255, 255);
        doc.rect(pageWidth - marginRight - 20, currentY + 2.5, 15, 15, 'F');
        doc.setLineWidth(1);
        doc.rect(pageWidth - marginRight - 20, currentY + 2.5, 15, 15);
        doc.setFontSize(6);
        doc.text('QR', pageWidth - marginRight - 12.5, currentY + 9, { align: 'center' });
        doc.text('CODE', pageWidth - marginRight - 12.5, currentY + 12, { align: 'center' });
      }
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      // Fallback
      doc.setFillColor(255, 255, 255);
      doc.rect(pageWidth - marginRight - 20, currentY + 2.5, 15, 15, 'F');
      doc.setLineWidth(1);
      doc.rect(pageWidth - marginRight - 20, currentY + 2.5, 15, 15);
      doc.setFontSize(6);
      doc.text('QR', pageWidth - marginRight - 12.5, currentY + 9, { align: 'center' });
      doc.text('CODE', pageWidth - marginRight - 12.5, currentY + 12, { align: 'center' });
    }

    currentY += 35;

    // === TABLEAU DES PRODUITS ===
    
    // Calculs des totaux
    const taxMode = (vente.tva && vente.tva > 0) ? "with_tax" : "without_tax";
    const totalHT = articlesWithImages.reduce((sum, article) => {
      const prixHT = article.prix_unitaire_ht || article.prix_unitaire_ttc;
      return sum + (prixHT * article.quantite);
    }, 0);
    const tva = taxMode === "with_tax" ? totalHT * 0.20 : 0;
    const totalTTC = totalHT + tva;
    const fraisLivraison = vente.frais_livraison || 0;
    const totalFinal = totalTTC + fraisLivraison;

    // Préparer les données du tableau avec images en base64
    const tableData = [];
    
    for (const article of articlesWithImages) {
      // Créer les spécifications
      const specifications = [];
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

      if (specifications.length === 0) {
        specifications.push(`• Product: ${article.nom_produit}`);
        if (article.etat) specifications.push(`• Condition: ${article.etat}`);
      }

      const prixUnitaire = article.prix_unitaire_ht || article.prix_unitaire_ttc;
      const total = prixUnitaire * article.quantite;

      // Convertir l'image en base64
      let imageBase64 = null;
      if (article.image_url) {
        try {
          imageBase64 = await this.convertImageToBase64(article.image_url);
        } catch (error) {
          console.error('Erreur lors de la conversion de l\'image:', error);
        }
      }

      // Chaque produit génère 2 lignes comme dans l'aperçu
      tableData.push({
        type: 'product',
        imageBase64: imageBase64,
        specifications: specifications,
        prix: this.formatAmount(prixUnitaire),
        quantite: article.quantite.toString(),
        total: this.formatAmount(total),
        nomProduit: (article as any).description || article.nom_produit
      });
    }

    // Générer le tableau manuellement avec design amélioré
    const tableStartY = currentY;
    
    // Largeurs des colonnes optimisées pour rester dans les marges (170mm disponible)
    const availableWidth = pageWidth - marginLeft - marginRight; // 170mm
    const colWidths = [25, 75, 25, 20, 25]; // Total: 170mm exactement
    
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    let tableY = tableStartY;
    
    // En-tête du tableau avec design amélioré
    doc.setFillColor(0, 0, 0);
    doc.rect(marginLeft, tableY, tableWidth, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['ID', 'NOM DU PRODUIT', 'PRIX', 'QTÉ', 'TOTAL'];
    let currentX = marginLeft;
    
    headers.forEach((header, index) => {
      doc.text(header, currentX + colWidths[index] / 2, tableY + 8, { align: 'center' });
      currentX += colWidths[index];
    });
    
    tableY += 12;
    
    // Corps du tableau avec design épuré - bordures fines
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.2); // Bordures très fines
    doc.setFont('helvetica', 'normal');
    
    tableData.forEach((product, productIndex) => {
      const specificationRowHeight = Math.max(18, Math.ceil(product.specifications.length * 3));
      const detailRowHeight = 12;
      
      // === PREMIÈRE LIGNE : Image + Specifications + Prix + Quantité + Total ===
      currentX = marginLeft;
      
      // Cellule Image (rowspan pour les 2 lignes)
      const totalRowHeight = specificationRowHeight + detailRowHeight;
      
      // Fond alterné pour l'image
      if (productIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(currentX, tableY, colWidths[0], totalRowHeight, 'F');
      }
      
      if (product.imageBase64) {
        try {
          // Dimensions fixes pour maintenir les proportions (comme dans l'aperçu HTML h-24)
          const imageWidth = colWidths[0] - 4; // Largeur disponible
          const imageHeight = 18; // Hauteur fixe équivalente à h-24 (6rem = 96px ≈ 18mm)
          const imageX = currentX + 2;
          const imageY = tableY + 2; // Position en haut de la cellule
          
          // Centrer l'image verticalement dans la cellule si besoin
          const centerY = tableY + (totalRowHeight - imageHeight) / 2;
          
          doc.addImage(product.imageBase64, 'JPEG', imageX, centerY, imageWidth, imageHeight);
        } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'image au PDF:', error);
          // Fallback propre avec dimensions fixes
          const fallbackHeight = 18;
          const fallbackY = tableY + (totalRowHeight - fallbackHeight) / 2;
          doc.setFillColor(245, 245, 245);
          doc.rect(currentX + 2, fallbackY, colWidths[0] - 4, fallbackHeight, 'F');
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text('IMG', currentX + colWidths[0] / 2, fallbackY + fallbackHeight / 2 + 2, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      } else {
        // Placeholder avec dimensions fixes
        const placeholderHeight = 18;
        const placeholderY = tableY + (totalRowHeight - placeholderHeight) / 2;
        doc.setFillColor(245, 245, 245);
        doc.rect(currentX + 2, placeholderY, colWidths[0] - 4, placeholderHeight, 'F');
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text('IMG', currentX + colWidths[0] / 2, placeholderY + placeholderHeight / 2 + 2, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      doc.rect(currentX, tableY, colWidths[0], totalRowHeight);
      currentX += colWidths[0];
      
      // Cellule Specifications (première ligne) - fond alterné
      if (productIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(currentX, tableY, colWidths[1], specificationRowHeight, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Specification', currentX + 3, tableY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      product.specifications.forEach((spec, specIndex) => {
        if (tableY + 9 + (specIndex * 3) < tableY + specificationRowHeight - 2) {
          doc.text(spec, currentX + 3, tableY + 9 + (specIndex * 3));
        }
      });
      doc.rect(currentX, tableY, colWidths[1], specificationRowHeight);
      currentX += colWidths[1];
      
      // Cellules Prix, Quantité, Total (première ligne) - fond alterné
      [product.prix, product.quantite, product.total].forEach((value, index) => {
        if (productIndex % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(currentX, tableY, colWidths[2 + index], specificationRowHeight, 'F');
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const align = index === 1 ? 'center' : 'right';
        const x = index === 1 ? currentX + colWidths[2 + index] / 2 : currentX + colWidths[2 + index] - 3;
        doc.text(value, x, tableY + specificationRowHeight / 2 + 2, { align: align });
        doc.rect(currentX, tableY, colWidths[2 + index], specificationRowHeight);
        currentX += colWidths[2 + index];
      });
      
      tableY += specificationRowHeight;
      
      // === DEUXIÈME LIGNE : Detail (nom du produit) ===
      currentX = marginLeft + colWidths[0]; // Skip l'image (rowspan)
      
      // Cellule Detail (s'étend sur toutes les colonnes restantes)
      const detailWidth = colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
      
      if (productIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(currentX, tableY, detailWidth, detailRowHeight, 'F');
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Detail', currentX + 3, tableY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(product.nomProduit, currentX + 3, tableY + 8);
      doc.rect(currentX, tableY, detailWidth, detailRowHeight);
      
      tableY += detailRowHeight;
    });

    currentY = tableY + 10;

    // === TABLEAU DES TOTAUX (structure tableau claire) ===
    
    const totalsStartX = pageWidth - marginRight - 70;
    const totalsWidth = 68;
    const labelColWidth = 40;
    const valueColWidth = 28;
    const rowHeight = 8;
    
    // Préparer les lignes du tableau des totaux
    const totalsRows = [];
    
    if (taxMode === "with_tax" && tva > 0) {
      totalsRows.push({ label: 'Total HT :', value: this.formatAmount(totalHT) + ' DH', isFinal: false });
      totalsRows.push({ label: 'TVA 20% :', value: this.formatAmount(tva) + ' DH', isFinal: false });
    }
    
    if (fraisLivraison > 0) {
      totalsRows.push({ label: 'Livraison :', value: this.formatAmount(fraisLivraison) + ' DH', isFinal: false });
    }
    
    // Ligne finale
    const totalLabel = (taxMode === "with_tax" && tva > 0) ? 'Total TTC :' : 'Total HT :';
    totalsRows.push({ label: totalLabel, value: this.formatAmount(totalFinal) + ' DH', isFinal: true });
    
    const tableHeight = totalsRows.length * rowHeight;
    
    // Dessiner le cadre du tableau
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.rect(totalsStartX, currentY, totalsWidth, tableHeight);
    
    // Dessiner les lignes et le contenu
    totalsRows.forEach((row, index) => {
      const rowY = currentY + (index * rowHeight);
      
      if (row.isFinal) {
        // Ligne finale avec fond noir
        doc.setFillColor(0, 0, 0);
        doc.rect(totalsStartX, rowY, totalsWidth, rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
      } else {
        // Lignes normales avec fond blanc
        doc.setFillColor(255, 255, 255);
        doc.rect(totalsStartX, rowY, totalsWidth, rowHeight, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      }
      
      // Ligne de séparation horizontale (sauf pour la dernière)
      if (index > 0) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(totalsStartX, rowY, totalsStartX + totalsWidth, rowY);
      }
      
      // Ligne de séparation verticale entre colonnes
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(totalsStartX + labelColWidth, rowY, totalsStartX + labelColWidth, rowY + rowHeight);
      
      // Texte du label (colonne gauche)
      doc.text(row.label, totalsStartX + 3, rowY + (rowHeight / 2) + 2);
      
      // Texte de la valeur (colonne droite, aligné à droite)
      doc.text(row.value, totalsStartX + totalsWidth - 3, rowY + (rowHeight / 2) + 2, { align: 'right' });
    });
    
    // Bordure finale du tableau
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(totalsStartX, currentY, totalsWidth, tableHeight);
    
    currentY += tableHeight + 10;

    // === MONTANT EN LETTRES ===
    
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(249, 249, 249);
    const amountText = `Arrete le presente facture a la somme de ${convertirMontantEnLettres(totalFinal)} ${(taxMode === "with_tax" && tva > 0) ? 'TTC' : 'HT'}`;
    
    doc.rect(marginLeft, currentY, pageWidth - marginLeft - marginRight, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    // Centrer le texte
    const amountTextWidth = doc.getTextWidth(amountText);
    const textX = (pageWidth - amountTextWidth) / 2;
    doc.text(amountText, textX, currentY + 8);

    // === PIED DE PAGE ===
    
    // Positionner le pied de page en bas de la page
    const footerY = pageHeight - 30;
    
    // Ligne de séparation
    doc.setLineWidth(1);
    doc.line(marginLeft, footerY, pageWidth - marginRight, footerY);
    
    // Informations de l'entreprise
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Télé: ${COMPANY_CONFIG.telephone}`, pageWidth / 2, footerY + 8, { align: 'center' });
    doc.text(`Adresse: ${COMPANY_CONFIG.adresse}`, pageWidth / 2, footerY + 13, { align: 'center' });
    doc.text(`RC: ${COMPANY_CONFIG.rc} / IF: ${COMPANY_CONFIG.if} / ICE: ${COMPANY_CONFIG.ice}`, pageWidth / 2, footerY + 18, { align: 'center' });

    // Télécharger le PDF
    doc.save(`Facture_${vente.numero_vente}.pdf`);
  }

  static generateReceipt(vente: Vente): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // Format ticket de caisse
    });
    
    const company = this.getCompanyInfo();
    
    // Centrage du texte
    const centerText = (text: string, y: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
      const x = (80 - textWidth) / 2;
      doc.text(text, x, y);
    };
    
    let yPos = 10;
    
    // En-tête
    doc.setFont('helvetica', 'bold');
    centerText(company.nom, yPos, 14);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    centerText(company.adresse, yPos);
    yPos += 4;
    centerText(company.telephone, yPos);
    yPos += 4;
    centerText(company.email, yPos);
    yPos += 8;
    
    // Ligne de séparation
    doc.line(5, yPos, 75, yPos);
    yPos += 6;
    
    // Titre
    doc.setFont('helvetica', 'bold');
    centerText('TICKET DE CAISSE', yPos, 12);
    yPos += 8;
    
    // Informations de la vente
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`N° ${vente.numero_vente}`, 5, yPos);
    yPos += 4;
    doc.text(`Date: ${new Date(vente.date_vente || '').toLocaleDateString('fr-FR')}`, 5, yPos);
    yPos += 4;
    doc.text(`Client: ${vente.client_nom}`, 5, yPos);
    yPos += 4;
    doc.text(`Vendeur: ${vente.vendeur_nom || 'N/A'}`, 5, yPos);
    yPos += 6;
    
    // Ligne de séparation
    doc.line(5, yPos, 75, yPos);
    yPos += 4;
    
    // Articles
    doc.setFont('helvetica', 'bold');
    doc.text('ARTICLES', 5, yPos);
    yPos += 4;
    doc.line(5, yPos, 75, yPos);
    yPos += 4;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    vente.articles?.forEach(article => {
      // Nom du produit (tronqué si nécessaire)
      const nomTronque = article.nom_produit.length > 25 
        ? article.nom_produit.substring(0, 22) + '...'
        : article.nom_produit;
      doc.text(nomTronque, 5, yPos);
      yPos += 3;
      
      // Quantité et prix
      const ligne = `${article.quantite} x ${article.prix_unitaire_ttc} MAD`;
      doc.text(ligne, 5, yPos);
      doc.text(`${article.total_ttc.toFixed(2)} MAD`, 75, yPos, { align: 'right' });
      yPos += 5;
    });
    
    // Ligne de séparation
    doc.line(5, yPos, 75, yPos);
    yPos += 4;
    
    // Totaux
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Sous-total HT:', 5, yPos);
    doc.text(`${vente.total_ht.toFixed(2)} MAD`, 75, yPos, { align: 'right' });
    yPos += 4;
    
    doc.text('TVA (20%):', 5, yPos);
    doc.text(`${vente.tva.toFixed(2)} MAD`, 75, yPos, { align: 'right' });
    yPos += 4;
    
    if (vente.remise > 0) {
      doc.text('Remise:', 5, yPos);
      doc.text(`-${vente.remise.toFixed(2)} MAD`, 75, yPos, { align: 'right' });
      yPos += 4;
    }
    
    // Total final
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL TTC:', 5, yPos);
    doc.text(`${vente.total_ttc.toFixed(2)} MAD`, 75, yPos, { align: 'right' });
    yPos += 6;
    
    // Mode de paiement
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Paiement: ${vente.mode_paiement.toUpperCase()}`, 5, yPos);
    yPos += 8;
    
    // Ligne de séparation
    doc.line(5, yPos, 75, yPos);
    yPos += 6;
    
    // Message de remerciement
    centerText('Merci de votre visite !', yPos, 9);
    yPos += 4;
    centerText('À bientôt chez GamerStore', yPos, 8);
    yPos += 6;
    
    centerText(company.website, yPos, 7);
    
    // Sauvegarde
    doc.save(`Ticket_${vente.numero_vente}.pdf`);
  }

  private static formatTypeVente(type: string): string {
    switch (type) {
      case 'magasin': return 'Magasin';
      case 'en_ligne': return 'En ligne';
      case 'telephone': return 'Téléphone';
      case 'commande': return 'Commande';
      default: return type;
    }
  }

  private static formatStatut(statut: string): string {
    switch (statut) {
      case 'payee': return 'Payée';
      case 'en_cours': return 'En cours';
      case 'partiellement_payee': return 'Partiellement payée';
      case 'annulee': return 'Annulée';
      case 'remboursee': return 'Remboursée';
      default: return statut;
    }
  }
} 