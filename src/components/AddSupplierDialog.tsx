import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Loader2 } from "lucide-react";
import { useSuppliers, type NewSupplier } from "@/hooks/useSuppliers";
import { useToast } from "@/hooks/use-toast";

interface AddSupplierDialogProps {
  trigger?: React.ReactNode;
  onSupplierAdded?: (supplierId: string) => void;
  className?: string;
}

export function AddSupplierDialog({ trigger, onSupplierAdded, className }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addSupplier } = useSuppliers();
  const { toast } = useToast();

  const [newSupplier, setNewSupplier] = useState<NewSupplier>({
    nom: "",
    contact_principal: "",
    email: "",
    telephone: "",
    adresse: "",
    specialite: "",
    statut: "Actif",
    conditions_paiement: "",
    delai_livraison_moyen: undefined,
    notes: "",
    type_fournisseur: "entreprise",
    ice: ""
  });

  const handleAddSupplier = async () => {
    if (!newSupplier.nom || !newSupplier.contact_principal || !newSupplier.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Validation spécifique pour les entreprises
    if (newSupplier.type_fournisseur === 'entreprise' && !newSupplier.ice) {
      toast({
        title: "Erreur",
        description: "Le numéro ICE est obligatoire pour les entreprises",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await addSupplier(newSupplier);
      if (result) {
        // Réinitialiser le formulaire
        setNewSupplier({
          nom: "",
          contact_principal: "",
          email: "",
          telephone: "",
          adresse: "",
          specialite: "",
          statut: "Actif",
          conditions_paiement: "",
          delai_livraison_moyen: undefined,
          notes: "",
          type_fournisseur: "entreprise",
          ice: ""
        });
        
        setOpen(false);
        
        // Appeler le callback avec l'ID du nouveau fournisseur
        if (onSupplierAdded) {
          onSupplierAdded(result.id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewSupplier({
      nom: "",
      contact_principal: "",
      email: "",
      telephone: "",
      adresse: "",
      specialite: "",
      statut: "Actif",
      conditions_paiement: "",
      delai_livraison_moyen: undefined,
      notes: "",
      type_fournisseur: "entreprise",
      ice: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un fournisseur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
          <DialogDescription className="text-gray-600">
            Remplissez les informations du fournisseur
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Type de fournisseur */}
          <div className="space-y-2">
            <Label>Type de fournisseur *</Label>
            <RadioGroup 
              value={newSupplier.type_fournisseur} 
              onValueChange={(value) => setNewSupplier({ ...newSupplier, type_fournisseur: value as 'particulier' | 'entreprise' })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entreprise" id="entreprise" />
                <Label htmlFor="entreprise">Entreprise</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="particulier" id="particulier" />
                <Label htmlFor="particulier">Particulier</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom du fournisseur *</Label>
              <Input
                id="nom"
                value={newSupplier.nom}
                onChange={(e) => setNewSupplier({ ...newSupplier, nom: e.target.value })}
                className="bg-white border-gray-200"
                placeholder="Nom de l'entreprise ou du particulier"
              />
            </div>
            <div>
              <Label htmlFor="contact_principal">Contact principal *</Label>
              <Input
                id="contact_principal"
                value={newSupplier.contact_principal}
                onChange={(e) => setNewSupplier({ ...newSupplier, contact_principal: e.target.value })}
                className="bg-white border-gray-200"
                placeholder="Nom du contact principal"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                className="bg-white border-gray-200"
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={newSupplier.telephone}
                onChange={(e) => setNewSupplier({ ...newSupplier, telephone: e.target.value })}
                className="bg-white border-gray-200"
                placeholder="+212 6 12 34 56 78"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea
              id="adresse"
              value={newSupplier.adresse}
              onChange={(e) => setNewSupplier({ ...newSupplier, adresse: e.target.value })}
              className="bg-white border-gray-200"
              placeholder="Adresse complète"
              rows={2}
            />
          </div>

          {/* ICE (pour entreprises) */}
          {newSupplier.type_fournisseur === 'entreprise' && (
            <div>
              <Label htmlFor="ice">Numéro ICE *</Label>
              <Input
                id="ice"
                value={newSupplier.ice}
                onChange={(e) => setNewSupplier({ ...newSupplier, ice: e.target.value })}
                className="bg-white border-gray-200"
                placeholder="000123456789"
              />
            </div>
          )}

          {/* Spécialité */}
          <div>
            <Label htmlFor="specialite">Spécialité</Label>
            <Input
              id="specialite"
              value={newSupplier.specialite}
              onChange={(e) => setNewSupplier({ ...newSupplier, specialite: e.target.value })}
              className="bg-white border-gray-200"
              placeholder="Ex: Composants PC, Périphériques, etc."
            />
          </div>

          {/* Statut */}
          <div>
            <Label htmlFor="statut">Statut</Label>
            <Select value={newSupplier.statut} onValueChange={(value) => setNewSupplier({ ...newSupplier, statut: value as 'Actif' | 'Inactif' | 'Privilégié' })}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Privilégié">Privilégié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditions de paiement */}
          <div>
            <Label htmlFor="conditions_paiement">Conditions de paiement</Label>
            <Input
              id="conditions_paiement"
              value={newSupplier.conditions_paiement}
              onChange={(e) => setNewSupplier({ ...newSupplier, conditions_paiement: e.target.value })}
              className="bg-white border-gray-200"
              placeholder="Ex: Paiement à 30 jours"
            />
          </div>

          {/* Délai de livraison */}
          <div>
            <Label htmlFor="delai_livraison">Délai de livraison moyen (jours)</Label>
            <Input
              id="delai_livraison"
              type="number"
              value={newSupplier.delai_livraison_moyen || ""}
              onChange={(e) => setNewSupplier({ ...newSupplier, delai_livraison_moyen: e.target.value ? parseInt(e.target.value) : undefined })}
              className="bg-white border-gray-200"
              placeholder="Ex: 7"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newSupplier.notes}
              onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
              className="bg-white border-gray-200"
              placeholder="Informations supplémentaires..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddSupplier}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le fournisseur
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 