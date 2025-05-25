import {
  BarChart3,
  Users,
  Truck,
  Package,
  Laptop,
  ShoppingCart,
  LogOut,
  Monitor,
  Mouse,
  MapPin,
  Banknote,
  UserCheck,
  ClipboardList,
  CreditCard,
  CheckSquare
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const adminMenuItems = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Point de vente",
    url: "/point-of-sale",
    icon: CreditCard,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Fournisseurs",
    url: "/suppliers",
    icon: Truck,
  },
  {
    title: "Stock",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "PC Portables",
    url: "/pc-portable",
    icon: Laptop,
  },
  {
    title: "Moniteurs",
    url: "/moniteurs",
    icon: Monitor,
  },
  {
    title: "Périphériques",
    url: "/peripheriques",
    icon: Mouse,
  },
  {
    title: "Ventes",
    url: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "Livraisons",
    url: "/delivery",
    icon: MapPin,
  },
  {
    title: "Caisse",
    url: "/cash-register",
    icon: Banknote,
  },
  {
    title: "Équipe",
    url: "/team",
    icon: UserCheck,
  },
  {
    title: "Tâches",
    url: "/tasks",
    icon: ClipboardList,
  },
];

const memberMenuItems = [
  {
    title: "Tableau de bord",
    url: "/member-dashboard",
    icon: BarChart3,
  },
  {
    title: "Mes Produits",
    url: "/my-products",
    icon: Package,
  },
  {
    title: "Mes Tâches",
    url: "/my-tasks",
    icon: CheckSquare,
  },
];

interface AppSidebarProps {
  userRole: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = userRole === "admin" ? adminMenuItems : memberMenuItems;

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <Sidebar className="tech-gradient border-r border-gray-700/50 shadow-2xl">
      <SidebarHeader className="border-b border-gray-700/50 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 gaming-gradient rounded-xl flex items-center justify-center shadow-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gaming-cyan rounded-full border-2 border-gray-800"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Gamerstore</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">Gestion Magasin</p>
              <Badge variant="outline" className="text-xs border-gaming-purple text-gaming-purple">
                {userRole === "admin" ? "Admin" : "Membre"}
              </Badge>
            </div>
          </div>
        </div>
        <SidebarTrigger className="ml-auto text-white hover:text-gaming-cyan lg:hidden" />
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider font-semibold px-3 mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-gray-300 hover:text-white hover:bg-gaming-purple/20 data-[active=true]:bg-gaming-purple/30 data-[active=true]:text-white data-[active=true]:shadow-lg transition-all duration-300 rounded-xl group"
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium"
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        {location.pathname === item.url && (
                          <div className="absolute -inset-1 bg-gaming-cyan/20 rounded-lg blur-sm"></div>
                        )}
                      </div>
                      <span className="text-sm lg:text-base">{item.title}</span>
                      {location.pathname === item.url && (
                        <div className="ml-auto w-2 h-2 bg-gaming-cyan rounded-full"></div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-700/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-500/20 transition-all duration-300 rounded-xl"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-sm lg:text-base">Déconnexion</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
