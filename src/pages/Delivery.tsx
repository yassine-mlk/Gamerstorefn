
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Calendar, Search, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Delivery {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  status: "en_attente" | "en_cours" | "livree" | "echec";
  driver: string;
  date: string;
  totalAmount: number;
  products: Array<{ name: string; quantity: number; price: number }>;
}

const Delivery = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: "DEL001",
      orderId: "CMD001",
      customer: "Jean Dupont",
      address: "123 Rue de la Paix, 75001 Paris",
      status: "en_cours",
      driver: "Pierre Martin",
      date: "2024-01-15",
      totalAmount: 1299.99,
      products: [
        { name: "PC Gamer RTX 4070", quantity: 1, price: 1199.99 },
        { name: "Souris Gaming", quantity: 1, price: 79.99 },
      ]
    },
    {
      id: "DEL002",
      orderId: "CMD002",
      customer: "Marie Leblanc",
      address: "456 Avenue des Champs, 69000 Lyon",
      status: "en_attente",
      driver: "Non assigné",
      date: "2024-01-16",
      totalAmount: 799.99,
      products: [
        { name: "Moniteur 27 pouces", quantity: 1, price: 299.99 },
        { name: "Clavier mécanique", quantity: 1, price: 149.99 },
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_attente": return "bg-yellow-500";
      case "en_cours": return "bg-blue-500";
      case "livree": return "bg-green-500";
      case "echec": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "en_attente": return "En attente";
      case "en_cours": return "En cours";
      case "livree": return "Livrée";
      case "echec": return "Échec";
      default: return status;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "tous" || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateDeliveryStatus = (deliveryId: string, newStatus: string) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, status: newStatus as Delivery["status"] }
        : delivery
    ));
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-gaming-cyan" />
            Gestion des Livraisons
          </h1>
          <p className="text-gray-400 mt-2">Suivez et gérez toutes vos livraisons</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {deliveries.filter(d => d.status === "en_attente").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {deliveries.filter(d => d.status === "en_cours").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm">Livrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {deliveries.filter(d => d.status === "livree").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm">Échecs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {deliveries.filter(d => d.status === "echec").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="tech-gradient border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-gray-300">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Rechercher par client ou commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-300">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="livree">Livrée</SelectItem>
                  <SelectItem value="echec">Échec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card className="tech-gradient border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Liste des Livraisons</CardTitle>
          <CardDescription className="text-gray-400">
            Gérez et suivez l'état de toutes vos livraisons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">ID Livraison</TableHead>
                <TableHead className="text-gray-300">Commande</TableHead>
                <TableHead className="text-gray-300">Client</TableHead>
                <TableHead className="text-gray-300">Chauffeur</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Montant</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{delivery.id}</TableCell>
                  <TableCell className="text-gray-300">{delivery.orderId}</TableCell>
                  <TableCell className="text-gray-300">{delivery.customer}</TableCell>
                  <TableCell className="text-gray-300">{delivery.driver}</TableCell>
                  <TableCell className="text-gray-300">{delivery.date}</TableCell>
                  <TableCell className="text-gray-300">{delivery.totalAmount.toFixed(2)} €</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(delivery.status)} text-white`}>
                      {getStatusText(delivery.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="tech-gradient border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Détails de la livraison {delivery.id}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Informations complètes sur cette livraison
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-300">Adresse de livraison</Label>
                              <p className="text-white">{delivery.address}</p>
                            </div>
                            <div>
                              <Label className="text-gray-300">Produits</Label>
                              <div className="space-y-2">
                                {delivery.products.map((product, index) => (
                                  <div key={index} className="flex justify-between text-gray-300">
                                    <span>{product.name} x{product.quantity}</span>
                                    <span>{product.price.toFixed(2)} €</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Select 
                                value={delivery.status} 
                                onValueChange={(value) => updateDeliveryStatus(delivery.id, value)}
                              >
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en_attente">En attente</SelectItem>
                                  <SelectItem value="en_cours">En cours</SelectItem>
                                  <SelectItem value="livree">Livrée</SelectItem>
                                  <SelectItem value="echec">Échec</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Delivery;
