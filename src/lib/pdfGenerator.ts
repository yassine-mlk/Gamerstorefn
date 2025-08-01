import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Vente } from '@/hooks/useVentes';

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
    
    const tableColumns = ['Désignation', 'Qté', 'Prix unitaire HT', 'Total HT', 'Total TTC'];
    const tableRows = vente.articles?.map(article => [
      article.nom_produit,
      article.quantite.toString(),
      `${article.prix_unitaire_ht.toFixed(2)} MAD`,
      `${article.total_ht.toFixed(2)} MAD`,
      `${article.total_ttc.toFixed(2)} MAD`
    ]) || [];
    
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
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Récupérer la position Y après le tableau
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Totaux
    const totalsData = [
      ['Sous-total HT', `${vente.total_ht.toFixed(2)} MAD`],
      ['TVA (20%)', `${vente.tva.toFixed(2)} MAD`]
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