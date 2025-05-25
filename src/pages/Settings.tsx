import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  Bell,
  Monitor,
  Shield,
  Database,
  Printer,
  Globe,
  Moon,
  Sun,
  Save,
  RefreshCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Laptop,
  Mouse,
  Plus,
  X,
  Building2,
  CreditCard,
  Banknote,
  Edit,
  Trash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useBankAccounts, CompteBancaire } from "@/hooks/useBankAccounts";

export default function Settings() {
  const { 
    settings, 
    loading, 
    saveSettings, 
    updateSettings,
    addMarquePCPortable, 
    removeMarquePCPortable,
    addMarquePeripherique, 
    removeMarquePeripherique,
    resetSettings 
  } = useSettings();
  
  const {
    comptes,
    loading: loadingBankAccounts,
    addCompte,
    updateCompte,
    deleteCompte,
    getTotaux
  } = useBankAccounts();
  
  const [nouvelleMarque, setNouvelleMarque] = useState("");
  const [nouvelleMarquePeripherique, setNouvelleMarquePeripherique] = useState("");
  
  // États pour la gestion des comptes bancaires
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CompteBancaire | null>(null);
  const [newAccount, setNewAccount] = useState({
    nom_compte: "",
    nom_banque: "",
    numero_compte: "",
    iban: "",
    bic: "",
    solde_initial: "",
    type_compte: "Professionnel" as CompteBancaire['type_compte'],
    description: "",
    contact_banque: "",
    telephone_banque: "",
    email_banque: "",
    devise: "MAD",
    statut: "Actif" as CompteBancaire['statut']
  });

  const { toast } = useToast();

  const handleSave = () => {
    saveSettings(settings);
  };

  const handleReset = () => {
    resetSettings();
  };

  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "Les paramètres sont en cours d'export",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import des paramètres",
      description: "Sélectionnez un fichier de paramètres à importer",
    });
  };

  const handleBackup = () => {
    toast({
      title: "Sauvegarde lancée",
      description: "La sauvegarde des données est en cours",
    });
  };

  const ajouterMarque = () => {
    if (nouvelleMarque.trim()) {
      const success = addMarquePCPortable(nouvelleMarque.trim());
      if (success) {
        setNouvelleMarque("");
      } else {
        toast({
          title: "Erreur",
          description: "Cette marque existe déjà",
          variant: "destructive",
        });
      }
    }
  };

  const supprimerMarque = (marque: string) => {
    removeMarquePCPortable(marque);
  };

  const ajouterMarquePeripherique = () => {
    if (nouvelleMarquePeripherique.trim()) {
      const success = addMarquePeripherique(nouvelleMarquePeripherique.trim());
      if (success) {
        setNouvelleMarquePeripherique("");
      } else {
        toast({
          title: "Erreur",
          description: "Cette marque existe déjà",
          variant: "destructive",
        });
      }
    }
  };

  const supprimerMarquePeripherique = (marque: string) => {
    removeMarquePeripherique(marque);
  };

  // Fonctions pour la gestion des comptes bancaires
  const resetNewAccount = () => {
    setNewAccount({
      nom_compte: "",
      nom_banque: "",
      numero_compte: "",
      iban: "",
      bic: "",
      solde_initial: "",
      type_compte: "Professionnel" as CompteBancaire['type_compte'],
      description: "",
      contact_banque: "",
      telephone_banque: "",
      email_banque: "",
      devise: "MAD",
      statut: "Actif" as CompteBancaire['statut']
    });
  };

  const handleAddAccount = () => {
    if (!newAccount.nom_compte.trim() || !newAccount.nom_banque.trim() || !newAccount.solde_initial) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le nom du compte, la banque et le solde initial",
        variant: "destructive",
      });
      return;
    }

    const accountData = {
      ...newAccount,
      solde_initial: parseFloat(newAccount.solde_initial)
    };

    const success = addCompte(accountData);
    if (success) {
      resetNewAccount();
      setIsAddAccountDialogOpen(false);
    }
  };

  const handleEditAccount = (account: CompteBancaire) => {
    setSelectedAccount(account);
    setNewAccount({
      nom_compte: account.nom_compte,
      nom_banque: account.nom_banque,
      numero_compte: account.numero_compte || "",
      iban: account.iban || "",
      bic: account.bic || "",
      solde_initial: account.solde_initial.toString(),
      type_compte: account.type_compte,
      description: account.description || "",
      contact_banque: account.contact_banque || "",
      telephone_banque: account.telephone_banque || "",
      email_banque: account.email_banque || "",
      devise: account.devise,
      statut: account.statut
    });
    setIsEditAccountDialogOpen(true);
  };

  const handleUpdateAccount = () => {
    if (!selectedAccount) return;

    if (!newAccount.nom_compte.trim() || !newAccount.nom_banque.trim() || !newAccount.solde_initial) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le nom du compte, la banque et le solde initial",
        variant: "destructive",
      });
      return;
    }

    const accountData = {
      ...newAccount,
      solde_initial: parseFloat(newAccount.solde_initial)
    };

    const success = updateCompte(selectedAccount.id, accountData);
    if (success) {
      resetNewAccount();
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  const handleDeleteAccount = (account: CompteBancaire) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte "${account.nom_compte}" ?`)) {
      deleteCompte(account.id);
    }
  };

  const totaux = getTotaux();

  if (loading || loadingBankAccounts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-purple"></div>
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-gaming-cyan lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Paramètres</h1>
            <p className="text-gray-400 text-sm lg:text-base">Configuration de l'application</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="gaming-gradient">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button onClick={handleReset} variant="outline" className="border-gray-600">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-gray-400">
              Gérez vos préférences de notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Notifications par email</Label>
                <p className="text-sm text-gray-400">Recevoir les alertes par email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSettings({emailNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Notifications push</Label>
                <p className="text-sm text-gray-400">Notifications en temps réel</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSettings({pushNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Alertes de vente</Label>
                <p className="text-sm text-gray-400">Notifications des nouvelles ventes</p>
              </div>
              <Switch
                checked={settings.saleAlerts}
                onCheckedChange={(checked) => updateSettings({saleAlerts: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Alertes de stock</Label>
                <p className="text-sm text-gray-400">Notifications de stock faible</p>
              </div>
              <Switch
                checked={settings.stockAlerts}
                onCheckedChange={(checked) => updateSettings({stockAlerts: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Affichage */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Affichage
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Mode sombre</Label>
                <p className="text-sm text-gray-400">Interface en mode sombre</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSettings({darkMode: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Langue</Label>
              <Select value={settings.language} onValueChange={(value) => updateSettings({language: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Devise</Label>
              <Select value={settings.currency} onValueChange={(value) => updateSettings({currency: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="MAD">MAD (Dirham)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="USD">USD (Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Format de date</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => updateSettings({dateFormat: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Informations du magasin */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Informations du magasin
            </CardTitle>
            <CardDescription className="text-gray-400">
              Coordonnées et informations de votre magasin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Nom du magasin</Label>
              <Input
                value={settings.storeName}
                onChange={(e) => updateSettings({storeName: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Adresse</Label>
              <Input
                value={settings.storeAddress}
                onChange={(e) => updateSettings({storeAddress: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Téléphone</Label>
              <Input
                value={settings.storePhone}
                onChange={(e) => updateSettings({storePhone: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => updateSettings({storeEmail: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Système et sécurité */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Système et sécurité
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configuration du système et sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Sauvegarde automatique</Label>
                <p className="text-sm text-gray-400">Sauvegarde périodique des données</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => updateSettings({autoBackup: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Fréquence de sauvegarde</Label>
              <Select value={settings.backupFrequency} onValueChange={(value) => updateSettings({backupFrequency: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="hourly">Toutes les heures</SelectItem>
                  <SelectItem value="daily">Quotidienne</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Durée max de session (heures)</Label>
              <Input
                type="number"
                value={settings.maxSessionTime}
                onChange={(e) => updateSettings({maxSessionTime: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <Button onClick={handleBackup} className="w-full bg-blue-600 hover:bg-blue-700">
              <Database className="w-4 h-4 mr-2" />
              Lancer une sauvegarde maintenant
            </Button>
          </CardContent>
        </Card>

        {/* Marques PC Portable */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Laptop className="w-5 h-5" />
              Marques PC Portable
            </CardTitle>
            <CardDescription className="text-gray-400">
              Gérez les marques disponibles pour les PC portables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle marque..."
                value={nouvelleMarque}
                onChange={(e) => setNouvelleMarque(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white flex-1"
                onKeyDown={(e) => e.key === 'Enter' && ajouterMarque()}
              />
              <Button 
                onClick={ajouterMarque}
                className="gaming-gradient"
                disabled={!nouvelleMarque.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Marques disponibles ({settings.marquesPCPortable.length})</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {settings.marquesPCPortable.map((marque, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-gaming-cyan text-gaming-cyan flex items-center gap-1 pr-1"
                  >
                    {marque}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => supprimerMarque(marque)}
                      className="h-4 w-4 p-0 hover:bg-red-500/20 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              {settings.marquesPCPortable.length === 0 && (
                <p className="text-gray-500 text-sm italic">Aucune marque configurée</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Marques Périphériques */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mouse className="w-5 h-5" />
              Marques Périphériques
            </CardTitle>
            <CardDescription className="text-gray-400">
              Gérez les marques disponibles pour les périphériques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle marque..."
                value={nouvelleMarquePeripherique}
                onChange={(e) => setNouvelleMarquePeripherique(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white flex-1"
                onKeyDown={(e) => e.key === 'Enter' && ajouterMarquePeripherique()}
              />
              <Button 
                onClick={ajouterMarquePeripherique}
                className="gaming-gradient"
                disabled={!nouvelleMarquePeripherique.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Marques disponibles ({settings.marquesPeripheriques.length})</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {settings.marquesPeripheriques.map((marque, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-gaming-cyan text-gaming-cyan flex items-center gap-1 pr-1"
                  >
                    {marque}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => supprimerMarquePeripherique(marque)}
                      className="h-4 w-4 p-0 hover:bg-red-500/20 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              {settings.marquesPeripheriques.length === 0 && (
                <p className="text-gray-500 text-sm italic">Aucune marque configurée</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comptes Bancaires */}
        <Card className="bg-gray-900/50 border-gray-700 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Comptes Bancaires
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Gérez les comptes bancaires de l'entreprise
                </CardDescription>
              </div>
              <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gaming-gradient" onClick={resetNewAccount}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Compte
                  </Button>
                </DialogTrigger>
                <DialogContent className="tech-gradient border-gray-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Nouveau Compte Bancaire</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Ajouter un nouveau compte bancaire pour l'entreprise
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Nom du compte *</Label>
                      <Input
                        value={newAccount.nom_compte}
                        onChange={(e) => setNewAccount({...newAccount, nom_compte: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Compte Principal..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Nom de la banque *</Label>
                      <Input
                        value={newAccount.nom_banque}
                        onChange={(e) => setNewAccount({...newAccount, nom_banque: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Attijariwafa Bank..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Numéro de compte</Label>
                      <Input
                        value={newAccount.numero_compte}
                        onChange={(e) => setNewAccount({...newAccount, numero_compte: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="007780001234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">IBAN</Label>
                      <Input
                        value={newAccount.iban}
                        onChange={(e) => setNewAccount({...newAccount, iban: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="MA64..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Solde initial (MAD) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAccount.solde_initial}
                        onChange={(e) => setNewAccount({...newAccount, solde_initial: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="50000.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Type de compte</Label>
                      <Select value={newAccount.type_compte} onValueChange={(value: CompteBancaire['type_compte']) => setNewAccount({...newAccount, type_compte: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Professionnel">Professionnel</SelectItem>
                          <SelectItem value="Courant">Courant</SelectItem>
                          <SelectItem value="Épargne">Épargne</SelectItem>
                          <SelectItem value="Crédit">Crédit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Contact banque</Label>
                      <Input
                        value={newAccount.contact_banque}
                        onChange={(e) => setNewAccount({...newAccount, contact_banque: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Mohammed Alami"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Téléphone banque</Label>
                      <Input
                        value={newAccount.telephone_banque}
                        onChange={(e) => setNewAccount({...newAccount, telephone_banque: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="0522-123456"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-gray-300">Description</Label>
                      <Textarea
                        value={newAccount.description}
                        onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Compte principal pour les opérations courantes..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsAddAccountDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddAccount} className="gaming-gradient">
                      Créer le compte
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total des soldes</p>
                    <p className="text-xl font-bold text-green-400">{totaux.totalSoldes.toFixed(2)} MAD</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Nombre de comptes</p>
                    <p className="text-xl font-bold text-blue-400">{totaux.nombreComptes}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Banques partenaires</p>
                    <p className="text-xl font-bold text-purple-400">{[...new Set(comptes.map(c => c.nom_banque))].length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des comptes */}
            <div className="space-y-3">
              <Label className="text-white">Comptes actifs ({comptes.filter(c => c.statut === 'Actif').length})</Label>
              {comptes.length === 0 ? (
                <p className="text-gray-500 text-sm italic text-center py-8">Aucun compte bancaire configuré</p>
              ) : (
                <div className="grid gap-3">
                  {comptes.filter(c => c.statut === 'Actif').map((compte) => (
                    <div key={compte.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gaming-cyan/20 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-gaming-cyan" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{compte.nom_compte}</h4>
                              <p className="text-sm text-gray-400">{compte.nom_banque}</p>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <span className="ml-2 text-white">{compte.type_compte}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Solde:</span>
                              <span className="ml-2 text-green-400 font-semibold">{compte.solde_actuel.toFixed(2)} MAD</span>
                            </div>
                            {compte.numero_compte && (
                              <div className="md:col-span-2">
                                <span className="text-gray-400">N° Compte:</span>
                                <span className="ml-2 text-white font-mono text-xs">{compte.numero_compte}</span>
                              </div>
                            )}
                          </div>
                          {compte.description && (
                            <p className="mt-2 text-sm text-gray-400">{compte.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAccount(compte)}
                            className="text-gaming-cyan hover:bg-gaming-cyan/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccount(compte)}
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog d'édition */}
        <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
          <DialogContent className="tech-gradient border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Modifier le Compte Bancaire</DialogTitle>
              <DialogDescription className="text-gray-400">
                Modifier les informations du compte bancaire
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nom du compte *</Label>
                <Input
                  value={newAccount.nom_compte}
                  onChange={(e) => setNewAccount({...newAccount, nom_compte: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Nom de la banque *</Label>
                <Input
                  value={newAccount.nom_banque}
                  onChange={(e) => setNewAccount({...newAccount, nom_banque: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Numéro de compte</Label>
                <Input
                  value={newAccount.numero_compte}
                  onChange={(e) => setNewAccount({...newAccount, numero_compte: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">IBAN</Label>
                <Input
                  value={newAccount.iban}
                  onChange={(e) => setNewAccount({...newAccount, iban: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Solde initial (MAD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newAccount.solde_initial}
                  onChange={(e) => setNewAccount({...newAccount, solde_initial: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Type de compte</Label>
                <Select value={newAccount.type_compte} onValueChange={(value: CompteBancaire['type_compte']) => setNewAccount({...newAccount, type_compte: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Professionnel">Professionnel</SelectItem>
                    <SelectItem value="Courant">Courant</SelectItem>
                    <SelectItem value="Épargne">Épargne</SelectItem>
                    <SelectItem value="Crédit">Crédit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Statut</Label>
                <Select value={newAccount.statut} onValueChange={(value: CompteBancaire['statut']) => setNewAccount({...newAccount, statut: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                    <SelectItem value="Fermé">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Contact banque</Label>
                <Input
                  value={newAccount.contact_banque}
                  onChange={(e) => setNewAccount({...newAccount, contact_banque: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditAccountDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateAccount} className="gaming-gradient">
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Actions avancées */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Actions avancées</CardTitle>
          <CardDescription className="text-gray-400">
            Import/export et gestion des données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={handleExport} variant="outline" className="border-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Exporter paramètres
            </Button>
            
            <Button onClick={handleImport} variant="outline" className="border-gray-600">
              <Upload className="w-4 h-4 mr-2" />
              Importer paramètres
            </Button>
            
            <Button onClick={handleBackup} className="bg-blue-600 hover:bg-blue-700">
              <Database className="w-4 h-4 mr-2" />
              Sauvegarder données
            </Button>
            
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Réinitialiser app
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
