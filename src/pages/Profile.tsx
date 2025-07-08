
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    nom: "Admin User",
    email: "admin@gamerstore.ma",
    telephone: "+212 6 12 34 56 78",
    adresse: "123 Rue Mohammed V, Casablanca",
    dateCreation: "2024-01-15",
    role: "Administrateur",
    dernièreConnexion: "2024-05-24 14:30"
  });
  const [tempData, setTempData] = useState(userData);
  const { toast } = useToast();

  const handleSave = () => {
    setUserData(tempData);
    setIsEditing(false);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès",
    });
  };

  const handleCancel = () => {
    setTempData(userData);
    setIsEditing(false);
  };

  const handleImageUpload = () => {
    toast({
      title: "Upload d'image",
      description: "Fonctionnalité d'upload d'avatar à venir",
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 text-sm lg:text-base">Gérez vos informations personnelles</p>
          </div>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gaming-gradient">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button onClick={handleCancel} variant="outline" className="border-gray-200">
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo de profil et infos générales */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Photo de profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" alt="Avatar" />
                  <AvatarFallback className="bg-gaming-purple text-white text-2xl">
                    {userData.nom.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    onClick={handleImageUpload}
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 gaming-gradient"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">{userData.nom}</h3>
                <p className="text-gaming-cyan">{userData.role}</p>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-400">Membre depuis</p>
                  <p className="text-sm">{new Date(userData.dateCreation).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-400">Dernière connexion</p>
                  <p className="text-sm">{userData.dernièreConnexion}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Shield className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-400">Statut</p>
                  <p className="text-sm text-green-400">Actif</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card className="bg-gray-900/50 border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Informations personnelles</CardTitle>
            <CardDescription className="text-gray-400">
              Vos informations de contact et personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom complet */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom complet
                </Label>
                {isEditing ? (
                  <Input
                    value={tempData.nom}
                    onChange={(e) => setTempData({...tempData, nom: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                ) : (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                    <p className="text-white">{userData.nom}</p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={tempData.email}
                    onChange={(e) => setTempData({...tempData, email: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                ) : (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                    <p className="text-white">{userData.email}</p>
                  </div>
                )}
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </Label>
                {isEditing ? (
                  <Input
                    value={tempData.telephone}
                    onChange={(e) => setTempData({...tempData, telephone: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                ) : (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                    <p className="text-white">{userData.telephone}</p>
                  </div>
                )}
              </div>

              {/* Rôle */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rôle
                </Label>
                <div className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                  <p className="text-gaming-cyan">{userData.role}</p>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse
              </Label>
              {isEditing ? (
                <Input
                  value={tempData.adresse}
                  onChange={(e) => setTempData({...tempData, adresse: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              ) : (
                <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                  <p className="text-white">{userData.adresse}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques d'activité */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Statistiques d'activité</CardTitle>
          <CardDescription className="text-gray-600">
            Votre activité dans l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gaming-purple/20 rounded-lg flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-gaming-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-gray-600">Clients gérés</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gaming-cyan/20 rounded-lg flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-gaming-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">89</p>
                <p className="text-xs text-gray-600">Ventes ce mois</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gaming-green/20 rounded-lg flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-gaming-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">24h</p>
                <p className="text-xs text-gray-600">Temps connecté</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Admin</p>
                <p className="text-xs text-gray-600">Niveau d'accès</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
