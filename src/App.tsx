import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Clients from "./pages/Clients";
import Suppliers from "./pages/Suppliers";
import PCPortable from "./pages/PCPortableNew";
import PCPortableDetails from "./pages/PCPortableDetails";
import ComposantsPC from "./pages/ComposantsPC";
import ComposantsPCDetails from "./pages/ComposantsPCDetails";
import PCGamer from "./pages/PCGamer";
import MoniteursNew from "./pages/MoniteursNew";
import ChaisesGaming from "./pages/ChaisesGamingSimple";
import Peripheriques from "./pages/Peripheriques";
import Sales from "./pages/Sales";
import PointOfSale from "./pages/PointOfSale";
import VendeurPOS from "./pages/VendeurPOS";
import Delivery from "./pages/Delivery";
import CashRegister from "./pages/CashRegister";
import Cheques from "./pages/Cheques";
import Retours from "./pages/Retours";
import Team from "./pages/Team";
import Tasks from "./pages/Tasks";
import MyProducts from "./pages/MyProducts";
import MyTasks from "./pages/MyTasks";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center tech-gradient">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-purple"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar userRole={user.role} />
          <main className="flex-1 overflow-auto">
            <div className="flex justify-end p-4">
              <UserMenu />
            </div>
            <Routes>
              <Route 
                path="/" 
                element={
                  <Navigate 
                    to={
                      user.role === "admin" ? "/dashboard" : 
                      user.role === "vendeur" ? "/vendeur-pos" :
                      "/member-dashboard"
                    } 
                    replace 
                  />
                } 
              />
              <Route 
                path="/myproduct" 
                element={<Navigate to="/my-products" replace />} 
              />
              {user.role === "admin" ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/pc-portable" element={<PCPortable />} />
                  <Route path="/pc-portable/:id" element={<PCPortableDetails />} />
                  <Route path="/composants-pc" element={<ComposantsPC />} />
                  <Route path="/composants-pc/:id" element={<ComposantsPCDetails />} />
                  <Route path="/pc-gamer" element={<PCGamer />} />
                  <Route path="/moniteurs" element={<MoniteursNew />} />
                  <Route path="/chaises-gaming" element={<ChaisesGaming />} />
                  <Route path="/peripheriques" element={<Peripheriques />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/point-of-sale" element={<PointOfSale />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/cash-register" element={<CashRegister />} />
                  <Route path="/cheques" element={<Cheques />} />
                  <Route path="/retours" element={<Retours />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/tasks" element={<Tasks />} />
                </>
              ) : user.role === "vendeur" ? (
                <>
                  <Route path="/vendeur-pos" element={<VendeurPOS />} />
                  <Route path="/my-sales" element={<Sales />} />
                </>
              ) : (
                <>
                  <Route path="/member-dashboard" element={<MemberDashboard />} />
                  <Route path="/my-products" element={<MyProducts />} />
                  <Route path="/my-tasks" element={<MyTasks />} />
                </>
              )}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route 
                path="*" 
                element={
                  <Navigate 
                    to={
                      user.role === "admin" ? "/dashboard" : 
                      user.role === "vendeur" ? "/vendeur-pos" :
                      "/member-dashboard"
                    } 
                    replace 
                  />
                } 
              />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
