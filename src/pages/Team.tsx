
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "vendeur" | "livreur";
  password: string;
  status: "actif" | "inactif";
  dateCreation: string;
  lastLogin?: string;
}

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "USR001",
      name: "Jean Dupont",
      email: "jean.dupont@techstore.com",
      role: "admin",
      password: "admin123",
      status: "actif",
      dateCreation: "2024-01-01",
      lastLogin: "2024-01-15"
    },
    {
      id: "USR002",
      name: "Marie Martin",
      email: "marie.martin@techstore.com",
      role: "manager",
      password: "manager123",
      status: "actif",
      dateCreation: "2024-01-05",
      lastLogin: "2024-01-14"
    },
    {
      id: "USR003",
      name: "Pierre Leblanc",
      email: "pierre.leblanc@techstore.com",
      role: "vendeur",
      password: "vendeur123",
      status: "actif",
      dateCreation: "2024-01-10"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "vendeur" as TeamMember["role"],
    password: ""
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "manager": return "bg-blue-500";
      case "vendeur": return "bg-green-500";
      case "livreur": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "manager": return "Manager";
      case "vendeur": return "Vendeur";
      case "livreur": return "Livreur";
      default: return role;
    }
  };

  const addMember = () => {
    if (!newMember.name || !newMember.email || !newMember.password) {
      return;
    }

    const member: TeamMember = {
      id: `USR${String(teamMembers.length + 1).padStart(3, '0')}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      password: newMember.password,
      status: "actif",
      dateCreation: new Date().toISOString().split('T')[0]
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({
      name: "",
      email: "",
      role: "vendeur",
      password: ""
    });
    setIsAddDialogOpen(false);
  };

  const updateMember = () => {
    if (!editingMember) return;

    setTeamMembers(teamMembers.map(member => 
      member.id === editingMember.id ? editingMember : member
    ));
    setEditingMember(null);
  };

  const deleteMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== memberId));
  };

  const togglePasswordVisibility = (memberId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const toggleMemberStatus = (memberId: string) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, status: member.status === "actif" ? "inactif" : "actif" }
        : member
    ));
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-gaming-cyan" />
            Gestion de l'Équipe
          </h1>
          <p className="text-gray-400 mt-2">Gérez les comptes et rôles des employés</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gaming-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Employé
            </Button>
          </DialogTrigger>
          <DialogContent className="tech-gradient border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Nouvel Employé</DialogTitle>
              <DialogDescription className="text-gray-400">
                Créer un nouveau compte employé avec rôle et mot de passe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Nom complet</Label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Nom de l'employé"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="email@techstore.com"
                />
              </div>
              <div>
                <Label className="text-gray-300">Rôle</Label>
                <Select 
                  value={newMember.role} 
                  onValueChange={(value: TeamMember["role"]) => 
                    setNewMember({...newMember, role: value})
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="vendeur">Vendeur</SelectItem>
                    <SelectItem value="livreur">Livreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Mot de passe</Label>
                <Input
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Mot de passe"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={addMember}
                  className="gaming-gradient text-white flex-1"
                >
                  Créer le compte
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {teamMembers.filter(m => m.role === "admin").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {teamMembers.filter(m => m.role === "manager").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm">Vendeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {teamMembers.filter(m => m.role === "vendeur").length}
            </div>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm">Livreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {teamMembers.filter(m => m.role === "livreur").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="tech-gradient border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Membres de l'Équipe</CardTitle>
          <CardDescription className="text-gray-400">
            Gérez les comptes et permissions de votre équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Nom</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Rôle</TableHead>
                <TableHead className="text-gray-300">Mot de passe</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Dernière connexion</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{member.id}</TableCell>
                  <TableCell className="text-gray-300">{member.name}</TableCell>
                  <TableCell className="text-gray-300">{member.email}</TableCell>
                  <TableCell>
                    <Badge className={`${getRoleColor(member.role)} text-white`}>
                      {getRoleText(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-mono">
                        {showPasswords[member.id] ? member.password : "••••••••"}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePasswordVisibility(member.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        {showPasswords[member.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${member.status === 'actif' ? 'bg-green-500' : 'bg-gray-500'} text-white cursor-pointer`}
                      onClick={() => toggleMemberStatus(member.id)}
                    >
                      {member.status === 'actif' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {member.lastLogin || "Jamais connecté"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="tech-gradient border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Modifier l'employé</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Modifier les informations de {member.name}
                            </DialogDescription>
                          </DialogHeader>
                          {editingMember && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-gray-300">Nom</Label>
                                <Input
                                  value={editingMember.name}
                                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Email</Label>
                                <Input
                                  value={editingMember.email}
                                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Rôle</Label>
                                <Select 
                                  value={editingMember.role} 
                                  onValueChange={(value: TeamMember["role"]) => 
                                    setEditingMember({...editingMember, role: value})
                                  }
                                >
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Administrateur</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="vendeur">Vendeur</SelectItem>
                                    <SelectItem value="livreur">Livreur</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-gray-300">Nouveau mot de passe</Label>
                                <Input
                                  type="password"
                                  value={editingMember.password}
                                  onChange={(e) => setEditingMember({...editingMember, password: e.target.value})}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={updateMember}
                                  className="gaming-gradient text-white flex-1"
                                >
                                  Sauvegarder
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingMember(null)}
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => deleteMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default Team;
