import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AppSettings {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  saleAlerts: boolean;
  stockAlerts: boolean;
  
  // Affichage
  darkMode: boolean;
  language: string;
  currency: string;
  dateFormat: string;
  
  // Système
  autoBackup: boolean;
  backupFrequency: string;
  maxSessionTime: string;
  
  // Magasin
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  
  // Impressions
  defaultPrinter: string;
  printReceipts: boolean;
  printInvoices: boolean;
  logoOnReceipts: boolean;
  
  // Marques
  marquesPCPortable: string[];
  marquesPeripheriques: string[];
}

const defaultSettings: AppSettings = {
  // Notifications
  emailNotifications: true,
  pushNotifications: false,
  saleAlerts: true,
  stockAlerts: true,
  
  // Affichage
  darkMode: true,
  language: "fr",
  currency: "MAD",
  dateFormat: "DD/MM/YYYY",
  
  // Système
  autoBackup: true,
  backupFrequency: "daily",
  maxSessionTime: "8",
  
  // Magasin
  storeName: "Gamerstore",
  storeAddress: "123 Rue Mohammed V, Casablanca",
  storePhone: "+212 5 22 12 34 56",
  storeEmail: "contact@gamerstore.ma",
  
  // Impressions
  defaultPrinter: "HP LaserJet",
  printReceipts: true,
  printInvoices: true,
  logoOnReceipts: true,
  
  // Marques
  marquesPCPortable: [
    "ASUS", "Apple", "HP", "Dell", "Lenovo", "Acer", "MSI", "Alienware"
  ],
  marquesPeripheriques: [
    "Corsair", "Logitech", "Razer", "SteelSeries", "HyperX", "ASUS", "MSI", "Cooler Master", "Generic", "Samsung", "WD", "Seagate"
  ]
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gamerstore_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les paramètres
  const saveSettings = (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem('gamerstore_settings', JSON.stringify(updatedSettings));
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres ont été mis à jour avec succès",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des paramètres",
        variant: "destructive",
      });
      return false;
    }
  };

  // Ajouter une marque PC Portable
  const addMarquePCPortable = (marque: string) => {
    if (marque.trim() && !settings.marquesPCPortable.includes(marque.trim())) {
      const newMarques = [...settings.marquesPCPortable, marque.trim()];
      return saveSettings({ marquesPCPortable: newMarques });
    }
    return false;
  };

  // Supprimer une marque PC Portable
  const removeMarquePCPortable = (marque: string) => {
    const newMarques = settings.marquesPCPortable.filter(m => m !== marque);
    return saveSettings({ marquesPCPortable: newMarques });
  };

  // Ajouter une marque Périphérique
  const addMarquePeripherique = (marque: string) => {
    if (marque.trim() && !settings.marquesPeripheriques.includes(marque.trim())) {
      const newMarques = [...settings.marquesPeripheriques, marque.trim()];
      return saveSettings({ marquesPeripheriques: newMarques });
    }
    return false;
  };

  // Supprimer une marque Périphérique
  const removeMarquePeripherique = (marque: string) => {
    const newMarques = settings.marquesPeripheriques.filter(m => m !== marque);
    return saveSettings({ marquesPeripheriques: newMarques });
  };

  // Réinitialiser les paramètres
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('gamerstore_settings');
    toast({
      title: "Paramètres réinitialisés",
      description: "Tous les paramètres ont été remis aux valeurs par défaut",
    });
  };

  return {
    settings,
    loading,
    saveSettings,
    updateSettings: (updates: Partial<AppSettings>) => {
      setSettings(prev => ({ ...prev, ...updates }));
    },
    addMarquePCPortable,
    removeMarquePCPortable,
    addMarquePeripherique,
    removeMarquePeripherique,
    resetSettings,
  };
} 