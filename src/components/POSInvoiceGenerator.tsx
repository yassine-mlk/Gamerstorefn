import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download, Eye, Check, X } from "lucide-react";
import { type Vente } from "@/hooks/useVentes";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";

interface POSInvoiceGeneratorProps {
  vente: Vente | null;
  isOpen: boolean;
  onClose: () => void;
  onNewSale?: () => void;
}

export function POSInvoiceGenerator({ vente, isOpen, onClose, onNewSale }: POSInvoiceGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!vente) return null;

  const handlePrint = () => {
    // Cette fonctionnalité sera gérée par les boutons InvoiceGenerator
    console.log('Impression depuis POS');
  };

  const handleDownload = () => {
    // Cette fonctionnalité sera gérée par les boutons InvoiceGenerator
    console.log('Téléchargement depuis POS');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Check className="w-6 h-6 text-green-500" />
              Vente réalisée avec succès !
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Résumé de la vente */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-bold text-lg">Facture {vente.numero_vente}</h3>
                  <p className="text-gray-400">Client: {vente.client_nom}</p>
                  <p className="text-gray-400">
                    Date: {new Date(vente.date_vente || '').toLocaleDateString('fr-FR')}
                  </p>
                  <div className="text-2xl font-bold text-gaming-cyan">
                    {vente.total_ttc.toLocaleString()} MAD
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options de facture */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Actions facture :</h4>
              
              <InvoiceGenerator 
                vente={vente}
                onPreview={() => setShowPreview(true)}
                onPrint={() => console.log('Impression facture POS')}
                onDownload={() => console.log('Téléchargement facture POS')}
              />
            </div>

            {/* Actions principales */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onNewSale}
                className="flex-1 gaming-gradient"
              >
                Nouvelle vente
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Fermer
              </Button>
            </div>

            {/* Informations additionnelles */}
            <div className="text-xs text-gray-500 text-center">
              <p>La vente a été enregistrée dans le système.</p>
              <p>Vous pouvez imprimer ou télécharger la facture à tout moment.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prévisualisation de la facture */}
      <InvoicePreview
        vente={vente}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />
    </>
  );
} 