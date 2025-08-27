import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { type Vente, type VenteArticle } from "@/hooks/useVentes";
import { supabase } from "@/lib/supabase";

interface EditVenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  vente: Vente | null;
  updateVenteFn: (id: string, updates: Partial<Vente>) => Promise<boolean>;
  onSaved?: () => void;
}

type EditableArticle = VenteArticle & { withTax: boolean };

export function EditVenteModal({ isOpen, onClose, vente, updateVenteFn, onSaved }: EditVenteModalProps) {
  const { toast } = useToast();
  const [numeroVente, setNumeroVente] = useState<string>("");
  const [dateVente, setDateVente] = useState<string>("");
  const [articles, setArticles] = useState<EditableArticle[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!vente) return;
    setNumeroVente(vente.numero_vente || "");
    setDateVente(vente.date_vente ? new Date(vente.date_vente).toISOString().slice(0, 10) : "");
    const initialArticles: EditableArticle[] = (vente.articles || []).map(a => {
      const withTax = Math.abs((a.prix_unitaire_ttc || 0) - (a.prix_unitaire_ht || 0) * 1.2) < 0.01;
      return { ...a, withTax };
    });
    setArticles(initialArticles);
  }, [vente]);

  const totalsPreview = useMemo(() => {
    const totalHT = articles.reduce((sum, a) => sum + (a.prix_unitaire_ht * a.quantite), 0);
    const totalTTC = articles.reduce((sum, a) => {
      const unitTTC = a.withTax ? a.prix_unitaire_ht * 1.2 : a.prix_unitaire_ht;
      return sum + unitTTC * a.quantite;
    }, 0);
    const tva = Math.max(0, totalTTC - totalHT);
    return { totalHT, totalTTC, tva };
  }, [articles]);

  const handleToggleTVA = (id?: string) => async (checked: boolean) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, withTax: checked } : a));
  };

  const saveChanges = async () => {
    if (!vente?.id) return;
    setIsSaving(true);
    try {
      // 1) Update vente fields (numero_vente, date_vente)
      const updates: Partial<Vente> = {};
      if (numeroVente && numeroVente !== vente.numero_vente) updates.numero_vente = numeroVente;
      if (dateVente) updates.date_vente = new Date(dateVente).toISOString();
      if (Object.keys(updates).length > 0) {
        const ok = await updateVenteFn(vente.id, updates);
        if (!ok) throw new Error("Échec mise à jour de la vente");
      }

      // 2) Update articles prix/totaux with tax toggle
      for (const article of articles) {
        if (!article.id) continue;
        const prixHT = article.prix_unitaire_ht;
        const prixTTC = article.withTax ? +(prixHT * 1.2).toFixed(2) : prixHT;
        const totalHT = +(prixHT * article.quantite).toFixed(2);
        const totalTTC = +(prixTTC * article.quantite).toFixed(2);

        const { error } = await supabase
          .from('ventes_articles')
          .update({
            prix_unitaire_ht: prixHT,
            prix_unitaire_ttc: prixTTC,
            total_ht: totalHT,
            total_ttc: totalTTC
          })
          .eq('id', article.id);
        if (error) throw error;
      }

      // Totals are recalculated by DB trigger; just inform the user
      toast({
        title: "Vente modifiée",
        description: "Les informations de la vente ont été mises à jour.",
      });
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la vente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-black">Modifier la vente</DialogTitle>
        </DialogHeader>
        {!vente ? null : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Numéro de facture</Label>
                <Input id="numero" value={numeroVente} onChange={(e) => setNumeroVente(e.target.value)} className="bg-white border-gray-300 text-black" />
              </div>
              <div>
                <Label htmlFor="date">Date de vente</Label>
                <Input id="date" type="date" value={dateVente} onChange={(e) => setDateVente(e.target.value)} className="bg-white border-gray-300 text-black" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Articles</div>
              <div className="space-y-3">
                {articles.map((a) => (
                  <div key={a.id} className="flex items-center justify-between border rounded p-3">
                    <div className="text-sm">
                      <div className="font-medium">{a.nom_produit}</div>
                      <div className="text-gray-600">Qté: {a.quantite} • Prix HT: {a.prix_unitaire_ht.toFixed(2)} MAD</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`tva-${a.id}`}>TVA 20%</Label>
                      <Switch id={`tva-${a.id}`} checked={a.withTax} onCheckedChange={handleToggleTVA(a.id)} />
                    </div>
                  </div>
                ))}
                {articles.length === 0 && (
                  <div className="text-sm text-gray-600">Aucun article</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="border rounded p-3">
                <div className="text-gray-600">Total HT</div>
                <div className="font-bold">{totalsPreview.totalHT.toFixed(2)} MAD</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-gray-600">TVA</div>
                <div className="font-bold">{totalsPreview.tva.toFixed(2)} MAD</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-gray-600">Total TTC</div>
                <div className="font-bold">{totalsPreview.totalTTC.toFixed(2)} MAD</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={onClose} variant="outline" className="border-gray-300 text-gray-700">Annuler</Button>
              <Button onClick={saveChanges} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


