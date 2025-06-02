import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  UserCheck, 
  Loader, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  User, 
  Shield, 
  Edit, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMembers, Member } from "@/hooks/useMembers";
import { useMemberSessions, MemberLastSession } from "@/hooks/useMemberSessions";
import { CreateMemberDialog } from "@/components/CreateMemberDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Team = () => {
  const { members, isLoading: membersLoading } = useMembers();
  const { lastSessions, isLoading: sessionsLoading, fetchLastSessions, formatLoginTime } = useMemberSessions();
  const [membersWithSessions, setMembersWithSessions] = useState<(Member & { lastSession?: MemberLastSession })[]>([]);
  const { toast } = useToast();

  // États pour la modification
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '' as Member['role'],
    password: '',
    changePassword: false
  });

  // États pour la suppression
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Liste des rôles disponibles
  const availableRoles: { value: Member['role']; label: string; color: string }[] = [
    { value: 'admin', label: 'Administrateur', color: 'bg-red-500' },
    { value: 'manager', label: 'Manager', color: 'bg-blue-500' },
    { value: 'designer', label: 'Designer', color: 'bg-pink-500' },
    { value: 'developper', label: 'Développeur', color: 'bg-indigo-500' },
    { value: 'monteur', label: 'Monteur', color: 'bg-orange-500' },
    { value: 'vendeur', label: 'Vendeur', color: 'bg-green-500' }
  ];

  // Fonction pour ouvrir le dialogue de modification
  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      password: '',
      changePassword: false
    });
    setShowEditDialog(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!editingMember) return;

    try {
      // Mettre à jour le profil dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMember.id);

      if (profileError) throw profileError;

      // Si l'utilisateur veut changer le mot de passe
      if (editFormData.changePassword && editFormData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          editingMember.id,
          { 
            password: editFormData.password,
            email: editFormData.email // Mettre à jour l'email aussi dans l'auth
          }
        );

        if (passwordError) {
          console.warn('Erreur lors de la mise à jour du mot de passe:', passwordError.message);
          toast({
            title: "Partiellement réussi",
            description: `${editFormData.name} a été modifié, mais le mot de passe n'a pas pu être changé: ${passwordError.message}`,
            variant: "default",
          });
        } else {
          toast({
            title: "Membre modifié",
            description: `${editFormData.name} a été modifié avec succès (y compris le mot de passe)`,
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Membre modifié",
          description: `${editFormData.name} a été modifié avec succès`,
          variant: "default",
        });
      }

      setShowEditDialog(false);
      setEditingMember(null);
      // Rechargement de la page pour voir les changements
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la modification: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Fonction pour ouvrir le dialogue de suppression
  const handleDeleteMember = (member: Member) => {
    setDeletingMember(member);
    setShowDeleteDialog(true);
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!deletingMember) return;

    try {
      // Supprimer le profil
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deletingMember.id);

      if (error) throw error;

      toast({
        title: "Membre supprimé",
        description: `${deletingMember.name} a été supprimé avec succès`,
        variant: "default",
      });

      setShowDeleteDialog(false);
      setDeletingMember(null);
      // Rechargement de la page pour voir les changements
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLastSessions();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      const membersWithSessionData = members.map(member => {
        const lastSession = lastSessions.find(session => session.user_id === member.id);
        return { ...member, lastSession };
      });
      setMembersWithSessions(membersWithSessionData);
    }
  }, [members, lastSessions]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "manager": return "bg-blue-500";
      case "designer": return "bg-pink-500";
      case "developper": return "bg-indigo-500";
      case "monteur": return "bg-orange-500";
      case "vendeur": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "manager": return "Manager";
      case "designer": return "Designer";
      case "developper": return "Développeur";
      case "monteur": return "Monteur";
      case "vendeur": return "Vendeur";
      default: return role;
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "tablet": return <Tablet className="w-4 h-4" />;
      case "desktop": return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getConnectionStatus = (lastSession?: MemberLastSession) => {
    if (!lastSession) return { status: "Jamais connecté", color: "bg-gray-500" };
    
    if (lastSession.is_active) {
      return { status: "En ligne", color: "bg-green-500" };
    }
    
    const lastLoginTime = new Date(lastSession.login_time);
    const now = new Date();
    const diffInHours = (now.getTime() - lastLoginTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return { status: "Récemment", color: "bg-yellow-500" };
    } else if (diffInHours < 168) { // 7 jours
      return { status: "Cette semaine", color: "bg-orange-500" };
    } else {
      return { status: "Inactif", color: "bg-red-500" };
    }
  };

  if (membersLoading || sessionsLoading) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-gaming-cyan" />
        </div>
      </div>
    );
  }

  // Statistiques calculées
  const totalMembers = members.length;
  const activeMembers = membersWithSessions.filter(m => m.lastSession?.is_active).length;
  const membersByRole = {
    admin: members.filter(m => m.role === "admin").length,
    manager: members.filter(m => m.role === "manager").length,
    designer: members.filter(m => m.role === "designer").length,
    developper: members.filter(m => m.role === "developper").length,
    monteur: members.filter(m => m.role === "monteur").length,
    vendeur: members.filter(m => m.role === "vendeur").length,
  };

  const recentConnections = membersWithSessions.filter(m => {
    if (!m.lastSession) return false;
    const diffInHours = (new Date().getTime() - new Date(m.lastSession.login_time).getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  }).length;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-gaming-cyan" />
            Tableau de Bord - Équipe
          </h1>
          <p className="text-gray-400 mt-2">Surveillance et statistiques des membres de l'équipe</p>
        </div>
        <CreateMemberDialog onMemberCreated={() => {
          // Rafraîchir les données après création
          window.location.reload();
        }} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gaming-cyan text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Total Membres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalMembers}</div>
            <p className="text-xs text-gray-400">Membres enregistrés</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              En ligne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeMembers}</div>
            <p className="text-xs text-gray-400">Connectés maintenant</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Récentes (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{recentConnections}</div>
            <p className="text-xs text-gray-400">Connexions récentes</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{membersByRole.admin}</div>
            <p className="text-xs text-gray-400">Admins actifs</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{membersByRole.manager}</div>
            <p className="text-xs text-gray-400">Responsables</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm">Vendeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{membersByRole.vendeur}</div>
            <p className="text-xs text-gray-400">Équipe vente</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-pink-400 text-sm">Designers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{membersByRole.designer}</div>
            <p className="text-xs text-gray-400">Équipe créative</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-indigo-400 text-sm">Développeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{membersByRole.developper}</div>
            <p className="text-xs text-gray-400">Équipe technique</p>
          </CardContent>
        </Card>

        <Card className="tech-gradient border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-400 text-sm">Monteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{membersByRole.monteur}</div>
            <p className="text-xs text-gray-400">Équipe assemblage</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Dashboard Table */}
      <Card className="tech-gradient border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Surveillance des Membres
          </CardTitle>
          <CardDescription className="text-gray-400">
            Dernières connexions, adresses IP et informations sur les appareils
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersWithSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Aucun membre trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Membre</TableHead>
                  <TableHead className="text-gray-300">Rôle</TableHead>
                  <TableHead className="text-gray-300">Statut</TableHead>
                  <TableHead className="text-gray-300">Dernière connexion</TableHead>
                  <TableHead className="text-gray-300">Adresse IP</TableHead>
                  <TableHead className="text-gray-300">Système d'exploitation</TableHead>
                  <TableHead className="text-gray-300">Appareil</TableHead>
                  <TableHead className="text-gray-300">Navigateur</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersWithSessions.map((member) => {
                  const connectionStatus = getConnectionStatus(member.lastSession);
                  return (
                    <TableRow key={member.id} className="border-gray-700">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-gray-300 font-medium">{member.name}</span>
                          <span className="text-gray-500 text-sm">{member.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(member.role)} text-white`}>
                          {getRoleText(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${connectionStatus.color}`}></div>
                          <span className="text-gray-300 text-sm">{connectionStatus.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {member.lastSession 
                          ? formatLoginTime(member.lastSession.login_time)
                          : "Jamais connecté"
                        }
                      </TableCell>
                      <TableCell className="text-gray-300 font-mono text-sm">
                        {member.lastSession?.ip_address || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {member.lastSession?.operating_system || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-300">
                          {getDeviceIcon(member.lastSession?.device_type)}
                          <span className="text-sm capitalize">
                            {member.lastSession?.device_type || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {member.lastSession?.browser || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                            className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member)}
                            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                            disabled={member.role === 'admin'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="tech-gradient border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-400" />
              Modifier le membre
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les informations du membre sélectionné
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Nom complet</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="Nom complet"
              />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="email@example.com"
                type="email"
              />
            </div>
            <div>
              <Label className="text-gray-300">Rôle</Label>
              <Select value={editFormData.role} onValueChange={(value) => setEditFormData({ ...editFormData, role: value as Member['role'] })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Section modification du mot de passe */}
            <div className="border-t border-gray-600 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={editFormData.changePassword}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    changePassword: e.target.checked,
                    password: e.target.checked ? editFormData.password : ''
                  })}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <Label htmlFor="changePassword" className="text-gray-300">
                  Modifier le mot de passe
                </Label>
              </div>
              
              {editFormData.changePassword && (
                <div>
                  <Label className="text-gray-300">Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    placeholder="Minimum 6 caractères"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Laissez vide pour ne pas modifier le mot de passe
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="gaming-gradient"
              disabled={
                !editFormData.name || 
                !editFormData.email || 
                !editFormData.role ||
                (editFormData.changePassword && (!editFormData.password || editFormData.password.length < 6))
              }
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="tech-gradient border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Cette action est irréversible. Le membre sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-red-400 font-medium mb-2">Membre à supprimer :</h4>
              <div className="text-white">
                <p><strong>Nom :</strong> {deletingMember?.name}</p>
                <p><strong>Email :</strong> {deletingMember?.email}</p>
                <p><strong>Rôle :</strong> {deletingMember ? getRoleText(deletingMember.role) : ''}</p>
              </div>
            </div>
            <p className="text-yellow-400 text-sm">
              ⚠️ Attention : Cette suppression affectera toutes les données liées à ce membre (assignations, historique, etc.)
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team;
