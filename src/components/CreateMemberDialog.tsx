import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader } from "lucide-react";
import { useMembers, CreateMemberData } from "@/hooks/useMembers";

interface CreateMemberDialogProps {
  trigger?: React.ReactNode;
  onMemberCreated?: () => void;
}

export function CreateMemberDialog({ trigger, onMemberCreated }: CreateMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createMember } = useMembers();

  const [memberData, setMemberData] = useState<CreateMemberData>({
    email: "",
    password: "",
    name: "",
    role: "vendeur"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberData.email || !memberData.password || !memberData.name) {
      return;
    }

    setLoading(true);
    try {
      const success = await createMember(memberData);
      if (success) {
        // Reset form
        setMemberData({
          email: "",
          password: "",
          name: "",
          role: "vendeur"
        });
        setOpen(false);
        onMemberCreated?.();
      }
    } catch (error) {
      console.error('Error creating member:', error);
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gaming-gradient">
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel Employé
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="tech-gradient border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gaming-cyan" />
            Créer un nouveau membre
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Ajoutez un nouveau membre à votre équipe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Nom complet *
            </Label>
            <Input
              id="name"
              type="text"
              value={memberData.name}
              onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={memberData.email}
              onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Mot de passe *
            </Label>
            <Input
              id="password"
              type="password"
              value={memberData.password}
              onChange={(e) => setMemberData({ ...memberData, password: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Minimum 6 caractères"
              minLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-300">
              Rôle *
            </Label>
            <Select 
              value={memberData.role} 
              onValueChange={(value: any) => setMemberData({ ...memberData, role: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="admin">{getRoleText("admin")}</SelectItem>
                <SelectItem value="manager">{getRoleText("manager")}</SelectItem>
                <SelectItem value="designer">{getRoleText("designer")}</SelectItem>
                <SelectItem value="developper">{getRoleText("developper")}</SelectItem>
                <SelectItem value="monteur">{getRoleText("monteur")}</SelectItem>
                <SelectItem value="vendeur">{getRoleText("vendeur")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="gaming-gradient"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer le compte
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 