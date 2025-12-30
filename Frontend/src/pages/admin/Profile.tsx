import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Shield, Mail, User, Save } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const AdminProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@umuti.com",
    role: "Super Admin",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({ title: "Profile updated successfully" });
  };

  return (
    <AdminSidebar>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your admin account</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="gradient-primary text-2xl text-primary-foreground">
                <Shield className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>
            <Button 
              variant={isEditing ? "hero" : "outline"} 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </Label>
                <Input 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Role
                </Label>
                <Input 
                  value={profile.role}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button variant="hero">Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
};

export default AdminProfile;
