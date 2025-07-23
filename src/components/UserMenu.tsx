import { useState } from "react";
import { User, ChevronDown, LogOut, Settings, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { NotificationPanel } from "@/components/NotificationPanel";

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <NotificationPanel />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 h-auto p-2 text-gray-700 hover:bg-gray-100 rounded-xl">
            <Avatar className="w-9 h-9 ring-2 ring-gray-200">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-gaming-cyan text-white text-sm font-medium">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <span className="text-sm font-medium text-gray-900">{user.name}</span>
              <p className="text-xs text-gray-600">
                {user.role === "admin" ? "Administrateur" : 
                 user.role === "monteur" ? "Monteur" :
                 user.role === "vendeur" ? "Vendeur" :
                 user.role === "manager" ? "Manager" :
                 user.role === "livreur" ? "Livreur" : "Membre"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-xl">
          <DropdownMenuItem 
            onClick={() => navigate("/profile")}
            className="text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg mx-1"
          >
            <User className="w-4 h-4 mr-3" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-200" />
          {user.role === "admin" && (
            <DropdownMenuItem 
              onClick={() => navigate("/settings")}
              className="text-gray-700 hover:bg-gray-100 cursor-pointer rounded-lg mx-1"
            >
              <Settings className="w-4 h-4 mr-3" />
              <span>Paramètres</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-gray-200" />
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 hover:bg-red-50 cursor-pointer rounded-lg mx-1 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader className="w-4 h-4 mr-3 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-3" />
            )}
            <span>{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
