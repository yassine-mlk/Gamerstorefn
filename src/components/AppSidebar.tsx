import {
  BarChart3,
  Users,
  Truck,
  Package,
  Laptop,
  ShoppingCart,
  Monitor,
  Mouse,
  MapPin,
  Banknote,
  UserCheck,
  ClipboardList,
  CreditCard,
  CheckSquare,
  Armchair,
  FileCheck,
  Cpu,
  Settings,
  RotateCcw
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
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
import { Badge } from "@/components/ui/badge";

const adminMenuItems = [
  {
    title: "Dashboard",
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
    url: "/stock",
    icon: Package,
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
    title: "Chèques",
    url: "/cheques",
    icon: FileCheck,
  },
  {
    title: "Retours",
    url: "/retours",
    icon: RotateCcw,
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

const vendeurMenuItems = [
  {
    title: "Point de Vente",
    url: "/vendeur-pos",
    icon: CreditCard,
  },
  {
    title: "Mes Ventes",
    url: "/my-sales",
    icon: ShoppingCart,
  },
];

const memberMenuItems = [
  {
    title: "Dashboard",
    url: "/member-dashboard",
    icon: BarChart3,
  },
  {
    title: "Produits",
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
  
  const menuItems = userRole === "admin" ? adminMenuItems : 
                   userRole === "vendeur" ? vendeurMenuItems : 
                   memberMenuItems;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "vendeur": return "Vendeur";
      case "manager": return "Manager";
      case "livreur": return "Livreur";
      default: return "Membre";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "border-gaming-purple text-gaming-purple";
      case "vendeur": return "border-gaming-cyan text-gaming-cyan";
      case "manager": return "border-gaming-green text-gaming-green";
      case "livreur": return "border-yellow-500 text-yellow-500";
      default: return "border-gray-500 text-gray-500";
    }
  };

  return (
    <Sidebar className="bg-white border-r border-gray-200 shadow-lg">
      <SidebarHeader className="border-b border-gray-200 p-6 bg-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm border border-gray-200">
              <img 
                src="/logo-gamer-store.jpg" 
                alt="Logo Gamerstore" 
                className="w-8 h-8 object-contain rounded"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gaming-cyan rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Gamerstore</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-600">
                {userRole === "vendeur" ? "Caisse Tactile" : "Gestion Magasin"}
              </p>
              <Badge variant="outline" className={`text-xs ${getRoleColor(userRole)}`}>
                {getRoleLabel(userRole)}
              </Badge>
            </div>
          </div>
        </div>
        <SidebarTrigger className="ml-auto text-gray-600 hover:text-gaming-cyan lg:hidden" />
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6 bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 text-xs uppercase tracking-wider font-semibold px-3 mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[active=true]:bg-gaming-cyan/10 data-[active=true]:text-gaming-cyan data-[active=true]:shadow-sm transition-all duration-300 rounded-xl group"
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium"
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                        {location.pathname === item.url && (
                          <div className="absolute -inset-1 bg-gaming-cyan/10 rounded-lg"></div>
                        )}
                      </div>
                      <span className="text-sm lg:text-base truncate">{item.title}</span>
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
    </Sidebar>
  );
}
