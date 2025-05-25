import { useState } from "react";
import { User, ChevronDown, Bell, LogOut, Settings, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [notificationCount] = useState(3);
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
      <Button
        variant="ghost"
        size="icon"
        className="relative text-white hover:bg-gaming-purple/20 rounded-xl"
      >
        <Bell className="w-5 h-5" />
        {notificationCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 bg-red-500 text-white"
          >
            {notificationCount}
          </Badge>
        )}
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 h-auto p-2 text-white hover:bg-gaming-purple/20 rounded-xl">
            <Avatar className="w-9 h-9 ring-2 ring-gaming-purple/30">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-gaming-purple text-white text-sm font-medium">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <span className="text-sm font-medium">{user.name}</span>
              <p className="text-xs text-gray-400">
                {user.role === "admin" ? "Administrateur" : "Membre"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-600 shadow-xl">
          <DropdownMenuItem 
            onClick={() => navigate("/profile")}
            className="text-white hover:bg-gaming-purple/20 cursor-pointer rounded-lg mx-1"
          >
            <User className="w-4 h-4 mr-3" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-600" />
          {user.role === "admin" && (
            <DropdownMenuItem 
              onClick={() => navigate("/settings")}
              className="text-white hover:bg-gaming-purple/20 cursor-pointer rounded-lg mx-1"
            >
              <Settings className="w-4 h-4 mr-3" />
              <span>Paramètres</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-gray-600" />
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-400 hover:bg-red-500/20 cursor-pointer rounded-lg mx-1 disabled:opacity-50"
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
