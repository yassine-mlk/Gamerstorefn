import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  Plus,
  Eye,
  UserPlus,
  Calendar,
  DollarSign,
  Package,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MonteurPCGamerDialog } from "@/components/MonteurPCGamerDialog";
import { MonteurComposantPCDialog } from "@/components/MonteurComposantPCDialog";
import { AssignProductDialog } from "@/components/AssignProductDialog";

const ConfigPCPage = () => {
  const [pcGamerConfigs, setPcGamerConfigs] = useState<any[]>([]);
  const [loadingPCGamer, setLoadingPCGamer] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Fonction pour rafraîchir les données après création d'un PC bureau
  const handlePCGamerCreated = () => {
    fetchPCGamerConfigs();
  };

  // Fonction pour rafraîchir les données après création d'un composant PC
  const handleComposantCreated = () => {
    // Recharger les PC gamer (les composants peuvent être utilisés dans les PC bureau)
    handlePCGamerCreated();
  };

  // Charger les PC gamer créés
  const fetchPCGamerConfigs = async () => {
    setLoadingPCGamer(true);
    try {
      const { data, error } = await supabase
        .from('pc_gamer_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erreur lors du chargement des PC gamer:', error);
        setPcGamerConfigs([]);
      } else {
        console.log('PC gamer chargés:', data);
        setPcGamerConfigs(data || []);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des PC gamer:', error);
      setPcGamerConfigs([]);
    } finally {
      setLoadingPCGamer(false);
    }
  };

  // Charger les PC gamer au montage du composant
  useEffect(() => {
    fetchPCGamerConfigs();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingPCGamer) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Config PC</h1>
            <p className="text-gray-600">Chargement en cours...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-cyan"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-gaming-cyan" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Config PC</h1>
            <p className="text-gray-600">Gérez vos configurations PC et assignez-les aux membres</p>
          </div>
        </div>
        <div className="flex gap-3">
          <MonteurComposantPCDialog 
            onComposantCreated={handleComposantCreated}
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Créer Composant
              </Button>
            }
          />
          <MonteurPCGamerDialog 
            onPCGamerCreated={handlePCGamerCreated}
            trigger={
              <Button className="flex items-center gap-2 bg-gaming-cyan hover:bg-gaming-cyan/90">
                <Plus className="w-4 h-4" />
                Créer PC Bureau
              </Button>
            }
          />
        </div>
      </div>

      {/* Section PC Gamer */}
      <Card className="bg-card border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-5 h-5 text-gaming-cyan" />
            <h2 className="text-xl font-semibold text-gray-900">PC Gamer</h2>
            <Badge variant="outline" className="ml-2">{pcGamerConfigs.length}</Badge>
          </div>

          {loadingPCGamer ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-cyan"></div>
              <span className="ml-3 text-gray-600">Chargement des PC gamer...</span>
            </div>
          ) : pcGamerConfigs.length === 0 ? (
            <div className="text-center py-12">
              <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun PC gamer créé</h3>
              <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de PC gamer.</p>
              <MonteurPCGamerDialog 
                trigger={
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Créer un PC gamer
                  </Button>
                }
                onPCGamerCreated={handlePCGamerCreated}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  PC Gamer créés ({pcGamerConfigs.length})
                </h3>
                <MonteurPCGamerDialog 
                  trigger={
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nouveau PC
                    </Button>
                  }
                  onPCGamerCreated={handlePCGamerCreated}
                />
              </div>
              
              <div className="grid gap-4">
                {pcGamerConfigs.map((config) => (
                  <Card key={config.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <Cpu className="w-5 h-5 text-gaming-cyan" />
                              <Badge variant="outline" className="text-xs">
                                PC Gamer
                              </Badge>
                            </div>
                            <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                              {config.statut}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.nom_config}</h3>
                          {config.description && (
                            <p className="text-gray-600 mb-3">{config.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>Prix: {config.prix_vente} MAD</span>
                            </div>
                            {config.code_barre && (
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span>Code: {config.code_barre}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Créé le {formatDate(config.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <AssignProductDialog
                            productId={config.id}
                            productType="pc_gamer"
                            productName={config.nom_config}
                            productCode={config.code_barre}
                            productEtat="Neuf"
                            trigger={
                              <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Assigner
                              </Button>
                            }
                            onAssignmentCreated={handlePCGamerCreated}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/pc-gamer/${config.id}`)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigPCPage; 