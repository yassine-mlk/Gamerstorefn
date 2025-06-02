import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Lock, User, ChevronRight, ChevronLeft, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const gamingImages = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % gamingImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans Gamerstore Manager",
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gamingImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gamingImages.length) % gamingImages.length);
  };

  return (
    <div className="min-h-screen flex">
      {/* Section de connexion */}
      <div className="flex-1 flex items-center justify-center p-8 tech-gradient">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <img 
                src="/logo-gamer-store.jpg" 
                alt="Logo Gamerstore" 
                className="w-12 h-12 object-contain rounded"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Gamerstore Manager</h1>
            <p className="text-gray-400">Gestion complète de votre magasin gaming</p>
          </div>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">Connexion</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Accédez à votre tableau de bord
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-gaming-purple"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-gaming-purple"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gaming-gradient hover:scale-105 transition-transform duration-200 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section images gaming */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/20 z-10" />
        
        {gamingImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Gaming setup ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Contrôles de navigation */}
        <div className="absolute inset-0 flex items-center justify-between p-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevImage}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextImage}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Indicateurs */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {gamingImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentImageIndex
                  ? 'bg-gaming-purple scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Overlay text */}
        <div className="absolute bottom-20 left-8 right-8 z-20 text-white">
          <h2 className="text-2xl font-bold mb-2">Équipements Gaming Pro</h2>
          <p className="text-gray-200 text-sm opacity-90">
            Découvrez notre sélection de matériel informatique haut de gamme pour gamers et professionnels
          </p>
        </div>
      </div>
    </div>
  );
}
