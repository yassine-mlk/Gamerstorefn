import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  ArrowLeft, 
  Laptop, 
  Cpu, 
  HardDrive, 
  Monitor, 
  Zap, 
  Package, 
  DollarSign,
  Calendar,
  User,
  Building,
  Shield,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { usePcPortables, PcPortable } from "@/hooks/usePcPortables";
import { useToast } from "@/hooks/use-toast";

export default function PCPortableDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pcPortables, loading, deletePcPortable } = usePcPortables();
  const { toast } = useToast();
  const [product, setProduct] = useState<PcPortable | null>(null);

  useEffect(() => {
    if (id && pcPortables.length > 0) {
      const foundProduct = pcPortables.find(p => p.id === id);
      setProduct(foundProduct || null);
    }
  }, [id, pcPortables]);

  const handleDelete = async () => {
    if (!product) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${product.nom_produit} ?`)) {
      try {
        await deletePcPortable(product.id!);
        toast({
          title: "Produit supprimé",
          description: `${product.nom_produit} a été supprimé avec succès`,
        });
        navigate('/pc-portable');
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le produit",
          variant: "destructive",
        });
      }
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Stock faible': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Rupture': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-cyan"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Button
            onClick={() => navigate('/pc-portable')}
            variant="ghost"
            className="text-gaming-cyan hover:bg-gaming-cyan/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux PC Portables
          </Button>
        </div>
        
        <div className="text-center py-12">
          <Laptop className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Produit non trouvé</h2>
          <p className="text-gray-400">Le PC portable demandé n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Button
            onClick={() => navigate('/pc-portable')}
            variant="ghost"
            className="text-gaming-cyan hover:bg-gaming-cyan/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux PC Portables
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/pc-portable/edit/${product.id}`)}
            variant="outline"
            className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Product Header */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image */}
            <div className="lg:w-1/3">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.nom_produit}
                  className="w-full h-64 object-cover rounded-lg border border-gray-700"
                />
              ) : (
                <div className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
                  <Laptop className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="lg:w-2/3 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{product.nom_produit}</h1>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-gaming-purple/20 text-gaming-purple border-gaming-purple/50">
                      {product.marque}
                    </Badge>
                    <Badge className={getStatutColor(product.statut)}>
                      {product.statut}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-gaming-cyan">{product.prix_vente.toLocaleString()} MAD</p>
                  <p className="text-sm text-gray-400">Prix de vente</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-gaming-cyan" />
                    <span className="text-sm text-gray-400">Stock</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{product.stock_actuel}</p>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-gaming-green" />
                    <span className="text-sm text-gray-400">Prix d'achat</span>
                  </div>
                  <p className="text-lg font-semibold text-gaming-green">{product.prix_achat.toLocaleString()} MAD</p>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Garantie</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{product.garantie || 'N/A'}</p>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gaming-purple" />
                    <span className="text-sm text-gray-400">Ajouté le</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {product.created_at ? new Date(product.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Specs */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gaming-cyan" />
              Spécifications techniques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Processeur:</span>
                <span className="text-white font-medium">{product.processeur || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Mémoire RAM:</span>
                <span className="text-white font-medium">{product.ram || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Stockage:</span>
                <span className="text-white font-medium">{product.stockage || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Carte graphique:</span>
                <span className="text-white font-medium">{product.carte_graphique || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Écran:</span>
                <span className="text-white font-medium">{product.ecran || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Système d'exploitation:</span>
                <span className="text-white font-medium">{product.systeme_exploitation || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Code-barres:</span>
                <span className="text-white font-mono text-sm">{product.code_barre || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-gaming-green" />
              Informations commerciales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Fournisseur:</span>
                <span className="text-white font-medium">{product.fournisseur_nom || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Stock minimum:</span>
                <span className="text-white font-medium">{product.stock_minimum}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Marge bénéficiaire:</span>
                <span className="text-gaming-green font-medium">
                  {((product.prix_vente - product.prix_achat) / product.prix_achat * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Bénéfice unitaire:</span>
                <span className="text-gaming-green font-medium">
                  {(product.prix_vente - product.prix_achat).toLocaleString()} MAD
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Valeur stock:</span>
                <span className="text-white font-medium">
                  {(product.prix_achat * product.stock_actuel).toLocaleString()} MAD
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Dernière modification:</span>
                <span className="text-white font-medium">
                  {product.updated_at ? new Date(product.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      {product.notes && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Notes et commentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">{product.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 