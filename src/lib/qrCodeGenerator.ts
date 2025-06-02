import QRCode from 'qrcode';
import { type Vente } from '@/hooks/useVentes';

export class QRCodeGenerator {
  /**
   * Génère un QR code pour une facture contenant les informations essentielles
   */
  static async generateInvoiceQR(vente: Vente): Promise<string> {
    const qrData = {
      invoice_number: vente.numero_vente,
      date: vente.date_vente,
      client: vente.client_nom,
      total: vente.total_ttc,
      status: vente.statut,
      payment_method: vente.mode_paiement,
      verification_url: `https://gamerstore.ma/verify-invoice/${vente.numero_vente}`
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 200,
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      return '';
    }
  }

  /**
   * Génère un QR code simple avec juste le numéro de facture
   */
  static async generateSimpleQR(numeroFacture: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(numeroFacture, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 150,
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code simple:', error);
      return '';
    }
  }

  /**
   * Génère un QR code pour paiement mobile (format bancaire marocain)
   */
  static async generatePaymentQR(vente: Vente): Promise<string> {
    const paymentData = {
      merchant_id: "GAMERSTORE_TANGER",
      amount: vente.total_ttc,
      currency: "MAD",
      invoice: vente.numero_vente,
      description: `Facture ${vente.numero_vente} - ${vente.client_nom}`,
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(paymentData), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 200,
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code de paiement:', error);
      return '';
    }
  }
} 