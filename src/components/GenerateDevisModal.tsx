import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Eye } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useDevis, type NewDevis, type DevisArticle } from "@/hooks/useDevis";
import { useToast } from "@/hooks/use-toast";
import { DevisPreview } from "@/components/DevisPreview";

interface ProductItem {
  id: string;
  nom_produit: string;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  produit_type: 'pc_portable' | 'moniteur' | 'peripherique' | 'chaise_gaming' | 'pc_gamer' | 'composant_pc';
  marque?: string;
  modele?: string;
}

interface GenerateDevisModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: ProductItem;
}

export function GenerateDevisModal({ isOpen, onClose, initialProduct }: GenerateDevisModalProps) {
  const { clients } = useClients();
  const { createDevis } = useDevis();
  const { toast } = useToast();
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [articles, setArticles] = useState<Omit<DevisArticle, 'id' | 'devis_id' | 'created_at'>[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [conditionsParticulieres, setConditionsParticulieres] = useState<string>('');
  const [dateExpiration, setDateExpiration] = useState<string>('');
  const [remise, setRemise] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevis, setPreviewDevis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialiser avec le produit sélectionné
  useEffect(() => {
    if (initialProduct && isOpen) {
      const article: Omit<DevisArticle, 'id' | 'devis_id' | 'created_at'> = {
        produit_id: initialProduct.id,
        produit_type: initialProduct.produit_type,
        nom_produit: initialProduct.nom_produit,
        marque: initialProduct.marque,
        quantite: 1,
        prix_unitaire_ht: initialProduct.prix_unitaire_ht,
        prix_unitaire_ttc: initialProduct.prix_unitaire_ttc,
        total_ht: initialProduct.prix_unitaire_ht,
        total_ttc: initialProduct.prix_unitaire_ttc
      };
      setArticles([article]);
    }
  }, [initialProduct, isOpen]);

  // Définir la date d'expiration par défaut (30 jours)
  useEffect(() => {
    if (isOpen) {
      const defaultExpiration = new Date();
      defaultExpiration.setDate(defaultExpiration.getDate() + 30);
      setDateExpiration(defaultExpiration.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const updateArticleQuantity = (index: number, quantite: number) => {
    const updatedArticles = [...articles];
    updatedArticles[index].quantite = quantite;
    updatedArticles[index].total_ht = updatedArticles[index].prix_unitaire_ht * quantite;
    updatedArticles[index].total_ttc = updatedArticles[index].prix_unitaire_ttc * quantite;
    setArticles(updatedArticles);
  };

  const updateArticlePrice = (index: number, prixHT: number) => {
    const updatedArticles = [...articles];
    updatedArticles[index].prix_unitaire_ht = prixHT;
    updatedArticles[index].prix_unitaire_ttc = prixHT * 1.2; // TVA 20%
    updatedArticles[index].total_ht = prixHT * updatedArticles[index].quantite;
    updatedArticles[index].total_ttc = updatedArticles[index].prix_unitaire_ttc * updatedArticles[index].quantite;
    setArticles(updatedArticles);
  };

  const removeArticle = (index: number) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const sousTotal = articles.reduce((sum, article) => sum + article.total_ht, 0);
    const totalApresRemise = sousTotal - remise;
    const tva = totalApresRemise * 0.2;
    const totalTTC = totalApresRemise + tva;
    
    return {
      sousTotal,
      totalHT: totalApresRemise,
      tva,
      totalTTC
    };
  };

  const handlePreview = () => {
    if (!selectedClientId || articles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et ajouter au moins un article.",
        variant: "destructive"
      });
      return;
    }

    const totals = calculateTotals();
    const selectedClient = clients.find(c => c.id === selectedClientId);
    
    const devisPreview = {
      id: 'preview',
      numero_devis: `DEV-${Date.now()}`,
      client_id: selectedClientId,
      date_creation: new Date().toISOString(),
      date_expiration: dateExpiration,
      statut: 'en_attente' as const,
      sous_total: totals.sousTotal,
      tva: totals.tva,
      remise: remise,
      total_ht: totals.totalHT,
      total_ttc: totals.totalTTC,
      notes,
      conditions_particulieres: conditionsParticulieres,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client: selectedClient ? {
        id: selectedClient.id,
        nom: `${selectedClient.prenom} ${selectedClient.nom}`,
        prenom: selectedClient.prenom,
        email: selectedClient.email,
        telephone: selectedClient.telephone,
        adresse: selectedClient.adresse
      } : undefined,
      articles: articles.map((article, index) => ({
        ...article,
        id: `preview-${index}`,
        devis_id: 'preview',
        created_at: new Date().toISOString()
      }))
    };
    
    setPreviewDevis(devisPreview);
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!selectedClientId || articles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et ajouter au moins un article.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const totals = calculateTotals();
      
      const newDevis: NewDevis = {
        client_id: selectedClientId,
        date_expiration: dateExpiration,
        sous_total: totals.sousTotal,
        tva: totals.tva,
        remise,
        total_ht: totals.totalHT,
        total_ttc: totals.totalTTC,
        notes,
        conditions_particulieres: conditionsParticulieres,
        articles
      };

      await createDevis(newDevis);
      
      toast({
        title: "Succès",
        description: "Le devis a été créé avec succès."
      });
      
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du devis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClientId('');
    setArticles([]);
    setNotes('');
    setConditionsParticulieres('');
    setRemise(0);
    setShowPreview(false);
    setPreviewDevis(null);
  };

  const totals = calculateTotals();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Générer un Devis</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Sélection du client */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.prenom} {client.nom} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date d'expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiration">Date d'expiration</Label>
              <Input
                id="expiration"
                type="date"
                value={dateExpiration}
                onChange={(e) => setDateExpiration(e.target.value)}
              />
            </div>

            {/* Articles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Articles *</Label>
                <Badge variant="outline">{articles.length} article(s)</Badge>
              </div>
              
              {articles.map((article, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{article.nom_produit}</h4>
                        {article.marque && (
                          <p className="text-sm text-gray-600">Marque: {article.marque}</p>
                        )}
                        <Badge variant="outline" className="mt-1">
                          {article.produit_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArticle(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          min="1"
                          value={article.quantite}
                          onChange={(e) => updateArticleQuantity(index, parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prix HT</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={article.prix_unitaire_ht}
                          onChange={(e) => updateArticlePrice(index, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total TTC</Label>
                        <Input
                          type="text"
                          value={`${article.total_ttc.toFixed(2)} DH`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Remise */}
            <div className="space-y-2">
              <Label htmlFor="remise">Remise (DH)</Label>
              <Input
                id="remise"
                type="number"
                step="0.01"
                value={remise}
                onChange={(e) => setRemise(parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes additionnelles..."
              />
            </div>

            {/* Conditions particulières */}
            <div className="space-y-2">
              <Label htmlFor="conditions">Conditions particulières</Label>
              <Textarea
                id="conditions"
                value={conditionsParticulieres}
                onChange={(e) => setConditionsParticulieres(e.target.value)}
                placeholder="Conditions particulières..."
              />
            </div>

            {/* Totaux */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total HT:</span>
                    <span>{totals.sousTotal.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remise:</span>
                    <span>-{remise.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total HT:</span>
                    <span>{totals.totalHT.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%):</span>
                    <span>{totals.tva.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total TTC:</span>
                    <span>{totals.totalTTC.toFixed(2)} DH</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!selectedClientId || articles.length === 0}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!selectedClientId || articles.length === 0 || isLoading}
                >
                  {isLoading ? 'Création...' : 'Créer le Devis'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Aperçu du devis */}
      {previewDevis && (
        <DevisPreview
          devis={previewDevis}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onPrint={() => window.print()}
        />
      )}
    </>
  );
}